(() => {
  const AUTH_API_BASE = "/api/auth";
  const tokenKey = "auth_token";
  const LOCAL_SAVE_KEY = "potatoFarmSave";

  /* --------------------------------------------------------------
     Token helpers
     -------------------------------------------------------------- */
  function setToken(t) {
    if (t) localStorage.setItem(tokenKey, t);
    else localStorage.removeItem(tokenKey);
  }
  function getToken() {
    return localStorage.getItem(tokenKey);
  }

  /* --------------------------------------------------------------
     Generic API wrapper
     -------------------------------------------------------------- */
  async function apiFetch(path, opts = {}) {
    opts.headers = opts.headers || {};
    opts.headers["Content-Type"] = "application/json";
    const token = getToken();
    if (token) opts.headers["Authorization"] = `Bearer ${token}`;
    const res = await fetch(AUTH_API_BASE + path, opts);
    if (!res.ok) {
      const body = await res.json().catch(() => ({}));
      throw body;
    }
    return res.json().catch(() => ({}));
  }

  /* --------------------------------------------------------------
     Auth endpoints
     -------------------------------------------------------------- */
  async function signup(username, email, password) {
    return apiFetch("/signup", {
      method: "POST",
      body: JSON.stringify({ username, email, password }),
    });
  }
  async function login(identifier, password) {
    return apiFetch("/login", {
      method: "POST",
      body: JSON.stringify({ identifier, password }),
    });
  }
  async function me() {
    return apiFetch("/me", { method: "GET" });
  }

  /* --------------------------------------------------------------
     Remote save / load
     -------------------------------------------------------------- */
  async function saveRemote(saveObj) {
    return apiFetch("/save", { method: "POST", body: JSON.stringify(saveObj) });
  }
  async function loadRemote() {
    return apiFetch("/load", { method: "GET" });
  }

  /* --------------------------------------------------------------
     Leaderboard helpers
     -------------------------------------------------------------- */
  async function fetchLeaderboard() {
    try {
      const headers = { "Content-Type": "application/json" };
      const token = getToken();
      if (token) headers["Authorization"] = `Bearer ${token}`;

      const res = await fetch("/api/leaderboard", { method: "GET", headers });
      if (!res.ok) throw new Error("Failed to fetch leaderboard");
      return res.json();
    } catch (e) {
      console.error("leaderboard fetch error", e);
      return { topPlayers: [], userRank: null };
    }
  }

  async function updateLeaderboardUI() {
    const leaderboardContainer = document.querySelector(".leaderboard");
    if (!leaderboardContainer) return;

    const data = await fetchLeaderboard();
    const topPlayers = data.topPlayers || [];
    const userRank = data.userRank;

    if (!topPlayers.length) {
      leaderboardContainer.innerHTML =
        '<div class="other"><div class="place">—</div><div class="username">No players yet</div><div class="score">0 potatoes</div></div>';
      return;
    }

    function formatScore(num) {
      const units = [
        { value: 1e33, label: "decillion" },
        { value: 1e30, label: "nonillion" },
        { value: 1e27, label: "octillion" },
        { value: 1e24, label: "septillion" },
        { value: 1e21, label: "sextillion" },
        { value: 1e18, label: "quintillion" },
        { value: 1e15, label: "quadrillion" },
        { value: 1e12, label: "trillion" },
        { value: 1e9, label: "billion" },
        { value: 1e6, label: "million" },
      ];
      for (const u of units) {
        if (num >= u.value) {
          return (
            (num / u.value).toFixed(2).replace(/\.?0+$/, "") + " " + u.label
          );
        }
      }
      return num.toLocaleString();
    }

    const getRankSuffix = (r) => {
      const j = r % 10,
        k = r % 100;
      if (j === 1 && k !== 11) return r + "st";
      if (j === 2 && k !== 12) return r + "nd";
      if (j === 3 && k !== 13) return r + "rd";
      return r + "th";
    };

    let html = "";

    topPlayers.forEach((entry, idx) => {
      const rank = idx + 1;
      const skinId = entry.equippedSkin || "default";
      let cls = "other";
      if (rank === 1) cls = "first";
      else if (rank === 2) cls = "second";
      else if (rank === 3) cls = "third";

      html += `
        <div class="${cls}">
          <div class="place">${getRankSuffix(rank)}</div>
          <div class="username">${entry.username}</div>
          <div class="score">
            ${formatScore(entry.all_time_potatoes)}
            <img src="assets/variants/${skinId}.png"
                alt="Potato"
                class="leaderboard-potato">
          </div>
        </div>`;
    });

    if (userRank) {
      const userSkin = userRank.equippedSkin || "default";
      html += `
        <div class="other" style="margin-top:10px;border-top:2px solid rgba(255,255,255,0.2);padding-top:10px;">
          <div class="place">${getRankSuffix(userRank.rank)}</div>
          <div class="username">${userRank.username} (You)</div>
          <div class="score">
            ${formatScore(userRank.all_time_potatoes)}
            <img src="assets/variants/${userSkin}.png"
                alt="Potato"
                class="leaderboard-potato">
          </div>
        </div>`;
    }

    leaderboardContainer.innerHTML = html;
  }

  /* --------------------------------------------------------------
     Core merge helper – single source of truth for combining saves.
     Takes two save objects (either can be null) and returns a merged
     object that always keeps the LARGEST numeric values and the UNION
     of all collection keys.
     -------------------------------------------------------------- */
  function mergeSaves(a, b) {
    const merged = { ...a, ...b };

    // Always keep the largest numeric counters
    const numericKeys = ["potatoes", "allTimePotatoes"];
    numericKeys.forEach((key) => {
      merged[key] = Math.max(Number(a?.[key]) || 0, Number(b?.[key]) || 0);
    });

    // Union of all collection keys (remote wins on conflicts within a key,
    // but we keep any key that exists in either save)
    const collectionKeys = ["buildings", "upgrades", "skins"];
    collectionKeys.forEach((col) => {
      merged[col] = { ...(a?.[col] || {}), ...(b?.[col] || {}) };
    });

    return merged;
  }

  /* --------------------------------------------------------------
     Persist a save object to both localStorage and (if logged in)
     the remote server.  Returns the save object for convenience.
     -------------------------------------------------------------- */
  async function persistSave(saveObj) {
    localStorage.setItem(LOCAL_SAVE_KEY, JSON.stringify(saveObj));
    // Keep the legacy standalone key in sync
    localStorage.setItem("allTimePotatoes", saveObj.allTimePotatoes || 0);

    const token = getToken();
    if (token) {
      try {
        await saveRemote(saveObj);
      } catch (e) {
        console.warn("Remote save failed – progress is safe locally", e);
      }
    }

    return saveObj;
  }

  /* --------------------------------------------------------------
     Apply a save object to the global game state.
     -------------------------------------------------------------- */
  function applyToGlobals(saveObj) {
    window.potatoes        = saveObj.potatoes        || 0;
    window.allTimePotatoes = saveObj.allTimePotatoes || 0;
    window.buildings       = saveObj.buildings       || {};
    window.upgrades        = saveObj.upgrades        || {};
    window.skins           = saveObj.skins           || {};
    if (saveObj.equippedSkin !== undefined) {
      window.equippedSkin  = saveObj.equippedSkin;
    }
  }

  /* --------------------------------------------------------------
     Read whatever is in localStorage (returns null if nothing / corrupt).
     -------------------------------------------------------------- */
  function readLocalSave() {
    const raw = localStorage.getItem(LOCAL_SAVE_KEY);
    if (!raw) return null;
    try {
      const parsed = JSON.parse(raw);
      // Reconcile the legacy standalone allTimePotatoes key
      const legacyAllTime = Number(localStorage.getItem("allTimePotatoes")) || 0;
      parsed.allTimePotatoes = Math.max(
        Number(parsed.allTimePotatoes) || 0,
        legacyAllTime
      );
      return parsed;
    } catch (_) {
      console.warn("Corrupt local save – ignoring");
      return null;
    }
  }

  /* --------------------------------------------------------------
     LOAD GAME
     ──────────────────────────────────────────────────────────────
     Strategy:
       1. Read local save immediately (never lost, even offline).
       2. If logged in, also fetch the remote save.
       3. Merge both – largest numeric values win, collections are
          unioned.  This means progress is NEVER lost from either
          source.
       4. Persist the merged result back to both stores so they stay
          in sync going forward.
       5. Apply to globals.

     This replaces BOTH the old loadGame and mergeAndPersist so
     there is only one code path for loading.
     -------------------------------------------------------------- */
  async function loadGame() {
    const localSave = readLocalSave();

    let remoteSave = null;
    const token = getToken();
    if (token) {
      try {
        remoteSave = await loadRemote();
      } catch (e) {
        console.warn("Remote load failed – using local save only", e);
      }
    }

    // Merge: local is the base so we never lose offline progress,
    // remote is overlaid so we never lose cloud progress either.
    const merged = mergeSaves(localSave, remoteSave);

    // Persist the merged result so both stores agree
    await persistSave(merged);

    // Wire up globals for the rest of the game
    applyToGlobals(merged);
  }

  /* --------------------------------------------------------------
     SAVE GAME
     Snapshot current globals → persist locally + remotely.
     -------------------------------------------------------------- */
  function saveGame() {
    const saveObj = {
      potatoes:        window.potatoes        || 0,
      allTimePotatoes: window.allTimePotatoes || 0,
      buildings:       window.buildings       || {},
      upgrades:        window.upgrades        || {},
      skins:           window.skins           || {},
      equippedSkin:    window.equippedSkin    || "default",
    };

    // Fire-and-forget – errors are logged inside persistSave
    persistSave(saveObj);
  }

  /* --------------------------------------------------------------
     mergeAndPersist – kept for any external callers, now just
     delegates to the unified helpers above.
     -------------------------------------------------------------- */
  async function mergeAndPersist(remoteSave) {
    const localSave = readLocalSave();
    const merged = mergeSaves(localSave, remoteSave);
    await persistSave(merged);
    applyToGlobals(merged);
  }

  /* --------------------------------------------------------------
     Account UI
     ──────────────────────────────────────────────────────────────
     Important: loadGame() is called ONCE here on page load.
     Do NOT call it again from DOMContentLoaded or anywhere else
     on startup – duplicate calls can race and overwrite progress.
     -------------------------------------------------------------- */
  async function updateAccountUI() {
    const el        = document.getElementById("accountName");
    const farm_name = document.getElementById("nameInput");

    const token = getToken();

    if (!token) {
      if (el)        el.textContent  = "Not signed in";
      if (farm_name) farm_name.value = "Guest";
      await loadGame();
      return;
    }

    try {
      const user = await me();
      if (el)        el.textContent  = user.username || user.email || "Account";
      if (farm_name) farm_name.value = `${user.username || "Player"}'s Potato Farm`;
      await loadGame();
    } catch (e) {
      if (el)        el.textContent  = "Not signed in";
      if (farm_name) farm_name.value = "Guest";
      setToken(null);
      await loadGame();
    }
  }

  /* --------------------------------------------------------------
     DOM ready – login / signup wiring
     -------------------------------------------------------------- */
  document.addEventListener("DOMContentLoaded", () => {
    const lUser       = document.getElementById("loginUsername");
    const lPass       = document.getElementById("loginPassword");
    const lBtn        = document.getElementById("loginButton");
    const loginStatus = document.getElementById("loginStatus");

    function setStatus(el, msg, type = "error") {
      if (!el) return;
      el.textContent = msg;
      el.classList.toggle("success", type === "success");
      el.classList.toggle("error",   type === "error");
    }

    lBtn && lBtn.addEventListener("click", async () => {
      setStatus(loginStatus, "");
      const username = lUser.value.trim();
      const password = lPass.value;

      if (!username || !password) {
        setStatus(loginStatus, "Please enter both username/email and password.", "error");
        return;
      }

      try {
        const res = await login(username, password);
        setToken(res.token);
        setStatus(loginStatus, "Logged in successfully!", "success");

        // loadGame is called inside updateAccountUI – no need to call it twice
        await updateAccountUI();
        await updateLeaderboardUI();
      } catch (e) {
        let msg = "Login failed";
        if (e.error) {
          const err = e.error.toLowerCase();
          if (err.includes("user not found"))       msg = "Username/email not found.";
          else if (err.includes("invalid credentials")) msg = "Password incorrect. Please check and try again.";
          else msg = e.error;
        }
        setStatus(loginStatus, msg, "error");
        console.error("login error", e);
      }
    });

    // Single startup load – updateAccountUI handles loadGame internally
    updateAccountUI();
    updateLeaderboardUI();

    const sUser        = document.getElementById("signupUsername");
    const sEmail       = document.getElementById("signupEmail");
    const sPass        = document.getElementById("signupPassword");
    const sBtn         = document.getElementById("signupButton");
    const signupStatus = document.getElementById("signupStatus");

    sBtn && sBtn.addEventListener("click", async () => {
      setStatus(signupStatus, "");
      const username = sUser.value.trim();
      const email    = sEmail.value.trim();
      const password = sPass.value;

      if (!username || !email || !password) {
        setStatus(signupStatus, "Please fill in all fields.", "error");
        return;
      }

      try {
        const res = await signup(username, email, password);
        setToken(res.token);
        setStatus(signupStatus, "Account created successfully!", "success");
        sUser.value = "";
        sEmail.value = "";
        sPass.value = "";

        // loadGame is called inside updateAccountUI – no need to call it twice
        await updateAccountUI();
        await updateLeaderboardUI();
      } catch (e) {
        let msg = "Sign up failed";
        if (e.error) {
          const err = e.error.toLowerCase();
          if (err.includes("already exists")) msg = "Username or email already exists.";
          else if (err.includes("invalid email")) msg = "Please enter a valid email address.";
          else msg = e.error;
        }
        setStatus(signupStatus, msg, "error");
        console.error("signup error", e);
      }
    });
  });

  /* --------------------------------------------------------------
     Public API
     -------------------------------------------------------------- */
  window.authApi = {
    signup,
    login,
    me,
    save: saveRemote,
    load: loadRemote,
    setToken,
    getToken,
    updateAccountUI,
    fetchLeaderboard,
    updateLeaderboardUI,
    loadGame,
    saveGame,
    mergeAndPersist,
  };
})();