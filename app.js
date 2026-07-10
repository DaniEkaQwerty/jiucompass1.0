/* JIUCompass — auth popup + form interactions (prototype only, no backend) */
(function () {
  "use strict";

  /* ---------- Toast (disabled — popup removed per request) ---------- */
  window.toast = function () {};

  /* ---------- Tabs (login / register) ---------- */
  var tabLogin = document.getElementById("tab-login");
  var tabReg = document.getElementById("tab-register");
  var panelLogin = document.getElementById("panel-login");
  var panelReg = document.getElementById("panel-register");

  function show(which) {
    if (!tabLogin || !tabReg) return;
    var login = which === "login";
    tabLogin.setAttribute("aria-selected", String(login));
    tabReg.setAttribute("aria-selected", String(!login));
    panelLogin.hidden = !login;
    panelReg.hidden = login;
  }

  if (tabLogin && tabReg) {
    tabLogin.addEventListener("click", function () { show("login"); });
    tabReg.addEventListener("click", function () { show("register"); });
    document.querySelectorAll("[data-goto]").forEach(function (el) {
      el.addEventListener("click", function () { show(el.getAttribute("data-goto")); });
    });
    show("register"); // default panel
  }

  /* ---------- Popup open / close ---------- */
  var modal = document.getElementById("authModal");
  var lastFocused = null;

  function openAuth(which) {
    // fallback: if there's no modal on this page, use the standalone auth page
    if (!modal) {
      location.href = "auth.html" + (which === "login" ? "#login" : "#register");
      return;
    }
    show(which || "register");
    lastFocused = document.activeElement;
    modal.classList.add("is-open");
    modal.setAttribute("aria-hidden", "false");
    document.documentElement.style.overflow = "hidden";
    var first = document.getElementById(which === "login" ? "loginEmail" : "fullName");
    if (first) setTimeout(function () { first.focus(); }, 60);
  }
  function closeAuth() {
    if (!modal) return;
    modal.classList.remove("is-open");
    modal.setAttribute("aria-hidden", "true");
    document.documentElement.style.overflow = "";
    if (lastFocused && lastFocused.focus) lastFocused.focus();
  }

  document.querySelectorAll("[data-open-auth]").forEach(function (b) {
    b.addEventListener("click", function (e) { e.preventDefault(); openAuth(b.getAttribute("data-open-auth")); });
  });
  document.querySelectorAll("[data-close-auth]").forEach(function (b) {
    b.addEventListener("click", closeAuth);
  });
  document.addEventListener("keydown", function (e) {
    if (e.key === "Escape" && modal && modal.classList.contains("is-open")) closeAuth();
  });

  /* ---------- Live student-ID preview ---------- */
  var name = document.getElementById("fullName");
  var email = document.getElementById("regEmail");
  var major = document.getElementById("major");
  var batch = document.getElementById("batch");
  var interests = document.getElementById("interests");
  var birthday = document.getElementById("birthday");

  var pvName = document.getElementById("pvName");
  var pvMeta = document.getElementById("pvMeta");
  var pvAvatar = document.getElementById("pvAvatar");
  var pvTags = document.getElementById("pvTags");
  var pvStatus = document.getElementById("pvStatus");
  var pvBirthday = document.getElementById("pvBirthday");
  var emailHint = document.getElementById("emailHint");

  function initials(full) {
    var parts = full.trim().split(/\s+/).filter(Boolean);
    if (!parts.length) return "?";
    if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  }
  function emailLooksValid(v) { return /^[a-z0-9._-]{2,}$/i.test(v.trim()); }

  function render() {
    if (!pvName) return;
    var nm = (name.value || "").trim();
    pvName.textContent = nm || "Your Name";
    pvAvatar.textContent = initials(nm);
    var bd = (birthday && birthday.value || "").trim();
    pvBirthday.textContent = bd ? "🎂 " + bd : "🎂 —";
    var mj = major.value || "Major";
    var bt = batch.value ? "Batch " + batch.value : "Batch —";
    pvMeta.textContent = mj + " · " + bt;
    var raw = (interests.value || "").split(",").map(function (s) { return s.trim(); }).filter(Boolean).slice(0, 3);
    pvTags.innerHTML = "";
    (raw.length ? raw : ["interests"]).forEach(function (t) {
      var s = document.createElement("span");
      s.className = "idcard__tag";
      s.textContent = t;
      pvTags.appendChild(s);
    });
    var ok = emailLooksValid(email.value);
    if (ok) {
      pvStatus.innerHTML = '<span class="idcard__dot"></span>verified';
      pvStatus.style.color = "#4e7c3b";
      pvStatus.querySelector(".idcard__dot").style.background = "var(--green)";
    } else {
      pvStatus.innerHTML = '<span class="idcard__dot" style="background:#d8dbec"></span>not verified';
      pvStatus.style.color = "#a9adcc";
    }
  }

  [name, email, major, batch, interests, birthday].forEach(function (el) {
    if (el) { el.addEventListener("input", render); el.addEventListener("change", render); }
  });
  render();

  if (email && emailHint) {
    email.addEventListener("input", function () {
      var v = email.value.trim();
      if (!v) { emailHint.className = "hint"; emailHint.textContent = "Only @jiu.ac.id addresses can register."; return; }
      if (emailLooksValid(v)) {
        emailHint.className = "hint hint--ok";
        emailHint.textContent = "Looks good — " + v + "@jiu.ac.id";
      } else {
        emailHint.className = "hint hint--bad";
        emailHint.textContent = "Use just the part before @jiu.ac.id (letters, numbers, dots).";
      }
    });
  }

  /* ---------- Mock submissions ---------- */
  var loginForm = document.getElementById("loginForm");
  if (loginForm) loginForm.addEventListener("submit", function (e) {
    e.preventDefault();
    var handle = document.getElementById("loginEmail").value.trim();
    var pass = document.getElementById("loginPass").value;
    if (!handle) { toast("Enter your campus email"); return; }
    if (!pass) { toast("Enter your password"); return; }

    /* check if a registered account exists in localStorage */
    var stored = null;
    try { stored = JSON.parse(localStorage.getItem("jiuUser") || "null"); } catch(err) {}

    if (stored && stored.emailHandle) {
      /* account found — validate email match */
      if (stored.emailHandle.toLowerCase() !== handle.toLowerCase()) {
        toast("No account found for " + handle + "@jiu.ac.id");
        return;
      }
      /* password check: stored password must match (if saved), otherwise allow */
      if (stored.password && stored.password !== pass) {
        toast("Wrong password — try again");
        return;
      }
    } else {
      /* no registered account — create a minimal session from the email handle */
      try {
        localStorage.setItem("jiuUser", JSON.stringify({
          name: handle.replace(/[._]/g, " ").replace(/\b\w/g, function(c){ return c.toUpperCase(); }),
          email: handle + "@jiu.ac.id",
          emailHandle: handle,
          major: "",
          batch: "",
          birthday: "",
          interests: []
        }));
      } catch(err) {}
    }

    toast("Logged in — opening JIUCompass…");
    setTimeout(function () { location.href = "app.html"; }, 900);
  });

  var registerForm = document.getElementById("registerForm");
  if (registerForm) registerForm.addEventListener("submit", function (e) {
    e.preventDefault();
    if (!name.value.trim()) { toast("Add your full name"); name.focus(); return; }
    if (!emailLooksValid(email.value)) { toast("Enter a valid campus email"); email.focus(); return; }
    if (!major.value) { toast("Pick your major"); major.focus(); return; }
    if (!batch.value) { toast("Pick your batch"); batch.focus(); return; }
    if ((document.getElementById("regPass").value || "").length < 8) { toast("Password needs 8+ characters"); return; }
    /* save user data so app.html can personalise the experience */
    try {
      localStorage.setItem("jiuUser", JSON.stringify({
        name: name.value.trim(),
        email: email.value.trim() + "@jiu.ac.id",
        emailHandle: email.value.trim(),
        major: major.value,
        batch: batch.value,
        birthday: (birthday && birthday.value.trim()) || "",
        interests: (document.getElementById("interests").value || "").split(",").map(function(s){return s.trim();}).filter(Boolean).slice(0,3),
        password: document.getElementById("regPass").value
      }));
    } catch(e) {}
    toast("Verified! Setting up your campus…");
    setTimeout(function () { location.href = "app.html"; }, 1100);
  });
})();
