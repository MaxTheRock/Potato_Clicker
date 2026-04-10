(() => {
  const AUTH_API_BASE = "/api/auth";
  const tokenKey = "auth_token";

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
     These are thin wrappers — script.js owns the actual save logic.
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
        { value: 1e9,  label: "billion" },
        { value: 1e6,  label: "million" },
      ];
      for (const u of units) {
        if (num >= u.value) {
          return (num / u.value).toFixed(2).replace(/\.?0+$/, "") + " " + u.label;
        }
      }
      return num.toLocaleString();
    }

    const getRankSuffix = (r) => {
      const j = r % 10, k = r % 100;
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
     Account UI — ONLY handles display + triggering script.js's loadGame.
     Does NOT load or merge saves itself.
     -------------------------------------------------------------- */
  async function updateAccountUI() {
    const el        = document.getElementById("accountName");
    const farm_name = document.getElementById("nameInput");
    const token     = getToken();

    if (!token) {
      if (el)        el.textContent  = "Not signed in";
      if (farm_name) farm_name.value = "Guest";
      // Signal to script.js that auth is resolved so it can load
      window._authResolved = true;
      return;
    }

    try {
      const user = await me();
      if (el)        el.textContent  = user.username || user.email || "Account";
      if (farm_name) farm_name.value = `${user.username || "Player"}'s Potato Farm`;
    } catch (e) {
      if (el)        el.textContent  = "Not signed in";
      if (farm_name) farm_name.value = "Guest";
      setToken(null);
    }

    // Signal to script.js that auth is resolved so it can proceed with load
    window._authResolved = true;
  }

  /* --------------------------------------------------------------
     DOM ready — login / signup wiring
     -------------------------------------------------------------- */
  function onDOMReady() {
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

        // After login, reload the game from the remote save via script.js
        if (window.loadGameManual) {
          await window.loadGameManual();
        }

        await updateAccountUI();
        await updateLeaderboardUI();
      } catch (e) {
        let msg = "Login failed";
        if (e.error) {
          const err = e.error.toLowerCase();
          if (err.includes("user not found"))           msg = "Username/email not found.";
          else if (err.includes("invalid credentials")) msg = "Password incorrect. Please check and try again.";
          else msg = e.error;
        }
        setStatus(loginStatus, msg, "error");
        console.error("login error", e);
      }
    });

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
        sUser.value  = "";
        sEmail.value = "";
        sPass.value  = "";

        await updateAccountUI();
        await updateLeaderboardUI();
      } catch (e) {
        let msg = "Sign up failed";
        if (e.error) {
          const err = e.error.toLowerCase();
          if (err.includes("already exists"))  msg = "Username or email already exists.";
          else if (err.includes("invalid email")) msg = "Please enter a valid email address.";
          else msg = e.error;
        }
        setStatus(signupStatus, msg, "error");
        console.error("signup error", e);
      }
    });

    document.getElementById("logoutButton")?.addEventListener("click", () => {
      setToken(null);
      updateAccountUI();
    });

    // Kick off account check — sets window._authResolved when done,
    // which unblocks script.js's startup loader.
    updateAccountUI().finally(() => {
      window._authResolved = true;
    });
    updateLeaderboardUI();
  }

  // Run immediately if DOM is already parsed, otherwise wait for it.
  // This prevents a 5-second timeout in script.js when auth.js loads
  // after DOMContentLoaded has already fired (common in production).
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", onDOMReady);
  } else {
    onDOMReady();
  }

  /* --------------------------------------------------------------
     Public API — only expose what script.js actually needs:
       .save(obj)     → POST to /api/auth/save
       .load()        → GET  from /api/auth/load
       .getToken()    → current JWT string or null
       .me()          → fetch current user info
       .updateLeaderboardUI() → refresh leaderboard HTML
       .fetchLeaderboard()    → raw leaderboard data
       .updateAccountUI()     → refresh account name display
     -------------------------------------------------------------- */
  window.authApi = {
    signup,
    login,
    me,
    save:                saveRemote,
    load:                loadRemote,
    setToken,
    getToken,
    updateAccountUI,
    fetchLeaderboard,
    updateLeaderboardUI,
  };
})();

setTimeout(() => { window._authResolved = true; }, 3000);