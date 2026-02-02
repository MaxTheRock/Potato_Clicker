(() => {
  const AUTH_API_BASE = "/api/auth";
  const tokenKey = "pc_auth_token";
  const LOCAL_SAVE_KEY = "potatoFarmSave";

  function setToken(t) {
    if (t) localStorage.setItem(tokenKey, t);
    else localStorage.removeItem(tokenKey);
  }
  function getToken() {
    return localStorage.getItem(tokenKey);
  }

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

  async function signup(username, email, password) {
    return apiFetch("/signup", { method: "POST", body: JSON.stringify({ username, email, password }) });
  }
  async function login(identifier, password) {
    return apiFetch("/login", { method: "POST", body: JSON.stringify({ identifier, password }) });
  }
  async function me() {
    return apiFetch("/me", { method: "GET" });
  }

  // Save game to remote - expects save object from script.js
  async function saveRemote(saveObj) {
    return apiFetch("/save", { method: "POST", body: JSON.stringify(saveObj) });
  }
  
  // Load game from remote
  async function loadRemote() {
    return apiFetch("/load", { method: "GET" });
  }

  // Update account display
  async function updateAccountUI() {
    const el = document.getElementById("accountName");
    const farm_name = document.getElementById("nameInput");
    if (!el) return;

    const token = getToken();
    if (!token) {
      el.textContent = "Not signed in";
      farm_name.value = "Guest";
      await loadGame(); // load localStorage save
      return;
    }

    try {
      const user = await me();
      el.textContent = user.username || user.email || "Account";
      farm_name.value = `${user.username || "Player"}'s Potato Farm`;
      await loadGame(); // load backend save
    } catch (e) {
      el.textContent = "Not signed in";
      farm_name.value = "Guest";
      setToken(null);
      await loadGame(); // fallback to localStorage
    }
  }

  document.addEventListener("DOMContentLoaded", () => {
    const lUser = document.getElementById("loginUsername");
    const lPass = document.getElementById("loginPassword");
    const lBtn = document.getElementById("loginButton");
    const loginStatus = document.getElementById("loginStatus");

    function setStatus(el, msg, type = "error") {
      if (!el) return;
      el.textContent = msg;
      el.classList.toggle("success", type === "success");
      el.classList.toggle("error", type === "error");
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
        await updateAccountUI();
      } catch (e) {
        let msg = "Login failed";
        if (e.error) {
          if (e.error.toLowerCase().includes("user not found")) msg = "Username/email not found.";
          else if (e.error.toLowerCase().includes("invalid credentials")) msg = "Password incorrect. Please check and try again.";
          else msg = e.error;
        }
        setStatus(loginStatus, msg, "error");
        console.error("login error", e);
      }
    });

    // auto-load on page load
    updateAccountUI();

    const sUser = document.getElementById("signupUsername");
    const sEmail = document.getElementById("signupEmail");
    const sPass = document.getElementById("signupPassword");
    const sBtn = document.getElementById("signupButton");
    const signupStatus = document.getElementById("signupStatus");

    sBtn && sBtn.addEventListener("click", async () => {
      setStatus(signupStatus, "");
      const username = sUser.value.trim();
      const email = sEmail.value.trim();
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
        await updateAccountUI();
      } catch (e) {
        let msg = "Sign up failed";
        if (e.error) {
          if (e.error.toLowerCase().includes("already exists")) msg = "Username or email already exists.";
          else if (e.error.toLowerCase().includes("invalid email")) msg = "Please enter a valid email address.";
          else msg = e.error;
        }
        setStatus(signupStatus, msg, "error");
        console.error("signup error", e);
      }
    });
  });

  // Expose API for other scripts
  window.authApi = {
    signup,
    login,
    me,
    save: saveRemote,  // script.js will pass the full save object
    load: loadRemote,
    setToken,
    getToken,
    updateAccountUI,
  };
})();