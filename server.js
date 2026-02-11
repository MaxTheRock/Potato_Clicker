const validator = require("validator");
const express = require("express");
const cors = require("cors");
const path = require("path");
const { Pool } = require("pg");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
require("dotenv").config();

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve frontend from project root so frontend and API share same origin
app.use(express.static(path.join(__dirname)));
app.get("/", (req, res) => res.sendFile(path.join(__dirname, "index.html")));

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
});

const JWT_SECRET = process.env.JWT_SECRET || "change-me";

/* -------------------------------------------------------------
   Database schema – users, saves, leaderboard
   ------------------------------------------------------------- */
async function ensureTables() {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS users (
      id SERIAL PRIMARY KEY,
      username TEXT UNIQUE NOT NULL,
      email TEXT UNIQUE NOT NULL,
      password_hash TEXT NOT NULL,
      created_at TIMESTAMPTZ DEFAULT now()
    )
  `);

  await pool.query(`
    CREATE TABLE IF NOT EXISTS saves (
      user_id INTEGER PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
      data JSONB NOT NULL,
      updated_at TIMESTAMPTZ DEFAULT now()
    )
  `);

  await pool.query(`
    CREATE TABLE IF NOT EXISTS leaderboard (
      user_id INTEGER PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
      username TEXT NOT NULL,
      all_time_potatoes BIGINT NOT NULL DEFAULT 0,
      updated_at TIMESTAMPTZ DEFAULT now()
    )
  `);
}
ensureTables().catch((e) => {
  console.error("Failed to ensure tables", e);
  process.exit(1);
});

/* -------------------------------------------------------------
   Helper functions
   ------------------------------------------------------------- */
function createToken(user) {
  return jwt.sign({ userId: user.id }, JWT_SECRET, { expiresIn: "7d" });
}

async function getUserById(id) {
  const r = await pool.query(
    "SELECT id, username, email, created_at FROM users WHERE id = $1",
    [id],
  );
  return r.rows[0];
}

/**
 * Extract the ID of the skin that has `equipped: true`.
 * Returns "default" if the save is missing, the skins array is missing,
 * or no skin is marked as equipped.
 */
function getEquippedSkin(save) {
  if (!save || !Array.isArray(save.skins)) return "default";
  const equipped = save.skins.find((s) => s.equipped);
  return equipped ? equipped.id : "default";
}

/* -------------------------------------------------------------
   Auth routes – signup, login, me
   ------------------------------------------------------------- */
app.post("/api/auth/signup", async (req, res) => {
  try {
    let { username, email, password } = req.body;

    if (!username || !email || !password) {
      return res.status(400).json({ error: "Missing fields" });
    }

    email = validator.normalizeEmail(email);
    if (!validator.isEmail(email)) {
      return res.status(400).json({ error: "Invalid email address" });
    }

    const exists = await pool.query(
      "SELECT id FROM users WHERE email = $1 OR username = $2",
      [email, username],
    );
    if (exists.rowCount) {
      return res.status(409).json({ error: "User already exists" });
    }

    const hash = await bcrypt.hash(password, 10);
    const insert = await pool.query(
      "INSERT INTO users (username, email, password_hash) VALUES ($1, $2, $3) RETURNING id, username, email",
      [username, email, hash],
    );

    const user = insert.rows[0];
    const token = createToken(user);
    res.json({ token, user });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: "Server error" });
  }
});

app.post("/api/auth/login", async (req, res) => {
  try {
    const fullUrl = getFullUrl(req);
    const { identifier, password } = req.body;
    if (!identifier || !password)
      return res.status(400).json({ error: "Missing fields" });

    const r = await pool.query(
      "SELECT id, username, email, password_hash FROM users WHERE email = $1 OR username = $1",
      [identifier],
    );
    if (!r.rowCount) {
      return res.status(404).json({ error: "User not found" });
    }

    const user = r.rows[0];
    const ok = await bcrypt.compare(password, user.password_hash);
    if (!ok) return res.status(401).json({ error: "Invalid credentials" });

    const token = createToken(user);
    res.json({
      token,
      user: { id: user.id, username: user.username, email: user.email },
      fullUrl,
    });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: "Server error" });
  }
});

const getFullUrl = (req) => {
  const originalUrl = req.headers["x-original-url"];
  if (originalUrl) {
    const url = new URL(originalUrl, `https://${req.headers.host}`);
    return url.toString();
  }
  const url = new URL(req.url, `http://${req.headers.host}`);
  return url.toString();
};

app.get("/api/auth/me", async (req, res) => {
  try {
    const auth = req.headers.authorization;
    if (!auth) return res.status(401).json({ error: "No token" });
    const token = auth.replace("Bearer ", "");
    const payload = jwt.verify(token, JWT_SECRET);
    const user = await getUserById(payload.userId);
    res.json(user);
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: "Server error" });
  }
});

/* -------------------------------------------------------------
   Middleware – requireAuth
   ------------------------------------------------------------- */
function requireAuth(req, res, next) {
  try {
    const auth = req.headers.authorization;
    if (!auth) return res.status(401).json({ error: "No token" });
    const token = auth.replace("Bearer ", "");
    const payload = jwt.verify(token, JWT_SECRET);
    req.userId = payload.userId;
    next();
  } catch (e) {
    return res.status(401).json({ error: "Invalid token" });
  }
}

/* -------------------------------------------------------------
   Save / Load routes (minified JSON for maximal compression)
   ------------------------------------------------------------- */
app.post("/api/auth/save", requireAuth, async (req, res) => {
  try {
    const userId = req.userId;
    if (!req.body) return res.status(400).json({ error: "Missing save body" });

    // 1️⃣ Minify JSON (maximal compression but still readable in SQL)
    const saveData = JSON.stringify(req.body);

    // 2️⃣ Save to database
    await pool.query(
      `INSERT INTO saves (user_id, data, updated_at)
       VALUES ($1, $2, now())
       ON CONFLICT (user_id) DO UPDATE SET data = $2, updated_at = now()`,
      [userId, saveData],
    );

    // 3️⃣ Update leaderboard
    let allTimePotatoes = req.body.allTimePotatoes;
    if (!allTimePotatoes && req.body.stats) {
      allTimePotatoes = req.body.stats.allTimePotatoes;
    }

    if (allTimePotatoes !== undefined) {
      const user = await getUserById(userId);
      await pool.query(
        `INSERT INTO leaderboard (user_id, username, all_time_potatoes, updated_at)
         VALUES ($1, $2, $3, now())
         ON CONFLICT (user_id) DO UPDATE SET all_time_potatoes = $3, updated_at = now()`,
        [userId, user.username, Math.floor(allTimePotatoes)],
      );
    }

    res.json({ ok: true });
  } catch (e) {
    console.error("save error", e);
    res.status(500).json({ error: "Server error" });
  }
});

app.get("/api/auth/load", requireAuth, async (req, res) => {
  try {
    const userId = req.userId;
    const r = await pool.query("SELECT data FROM saves WHERE user_id = $1", [
      userId,
    ]);
    if (!r.rowCount) return res.json(null);

    // Parse minified JSON back into JS object
    res.json(JSON.parse(r.rows[0].data));
  } catch (e) {
    console.error("load error", e);
    res.status(500).json({ error: "Server error" });
  }
});

/* -------------------------------------------------------------
   Leaderboard route – includes `equippedSkin`
   ------------------------------------------------------------- */
app.get("/api/leaderboard", async (req, res) => {
  try {
    const topResult = await pool.query(
      `SELECT user_id, username, all_time_potatoes, updated_at
       FROM leaderboard
       ORDER BY all_time_potatoes DESC
       LIMIT 30`,
    );
    const topPlayers = topResult.rows;

    const userIds = topPlayers.map((p) => p.user_id);
    let savesMap = {};
    if (userIds.length) {
      const savesRes = await pool.query(
        `SELECT user_id, data FROM saves WHERE user_id = ANY($1::int[])`,
        [userIds],
      );
      savesRes.rows.forEach((row) => {
        savesMap[row.user_id] = JSON.parse(row.data);
      });
    }

    topPlayers.forEach((p) => {
      const save = savesMap[p.user_id];
      p.equippedSkin = getEquippedSkin(save);
      delete p.user_id;
    });

    let userRank = null;
    const auth = req.headers.authorization;
    if (auth) {
      try {
        const token = auth.replace("Bearer ", "");
        const payload = jwt.verify(token, JWT_SECRET);
        const userId = payload.userId;

        const rankQuery = await pool.query(
          `SELECT
             (SELECT COUNT(*) + 1 FROM leaderboard WHERE all_time_potatoes > l.all_time_potatoes) AS rank,
             username,
             all_time_potatoes,
             l.user_id
           FROM leaderboard l
           WHERE user_id = $1`,
          [userId],
        );

        if (rankQuery.rowCount > 0) {
          const info = rankQuery.rows[0];
          if (info.rank > 10) {
            const saveRes = await pool.query(
              `SELECT data FROM saves WHERE user_id = $1`,
              [userId],
            );
            const saveData = saveRes.rowCount ? JSON.parse(saveRes.rows[0].data) : null;
            info.equippedSkin = getEquippedSkin(saveData);
            delete info.user_id;
            userRank = info;
          }
        }
      } catch (e) {
        console.log("Could not get user rank:", e.message);
      }
    }

    res.json({ topPlayers, userRank });
  } catch (e) {
    console.error("leaderboard error", e);
    res.status(500).json({ error: "Server error" });
  }
});

/* -------------------------------------------------------------
   Server start
   ------------------------------------------------------------- */
const PORT = process.env.PORT || 8000;
app.listen(PORT, () => {
  console.log(`Auth server listening on ${PORT}`);
});
