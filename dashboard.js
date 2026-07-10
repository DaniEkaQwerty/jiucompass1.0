/* JIUCompass — logged-in app (prototype, no backend) */
(function () {
  "use strict";

  /* ---------- toast (disabled — popup removed per request) ---------- */
  function toast() {}
  document.addEventListener("click", function (e) {
    var t = e.target.closest("[data-toast]");
    if (t) toast(t.getAttribute("data-toast"));
  });

  var esc = function (s) {
    return String(s).replace(/[&<>"]/g, function (c) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c];
    });
  };
  var initials = function (n) {
    var p = n.trim().split(/\s+/);
    return (p.length === 1 ? p[0].slice(0, 2) : p[0][0] + p[p.length - 1][0]).toUpperCase();
  };
  var $ = function (id) { return document.getElementById(id); };

  /* ---------- Load current user from localStorage (set by auth/register) ---------- */
  var me = (function () {
    try {
      var stored = JSON.parse(localStorage.getItem("jiuUser") || "{}");
      return {
        name: stored.name || "You",
        email: stored.email || "you@jiu.ac.id",
        emailHandle: stored.emailHandle || "you",
        major: stored.major || "IT",
        batch: stored.batch || "2026",
        birthday: stored.birthday || "",
        interests: Array.isArray(stored.interests) && stored.interests.length ? stored.interests : ["interests"]
      };
    } catch (e) {
      return { name: "You", email: "you@jiu.ac.id", emailHandle: "you", major: "IT", batch: "2026", birthday: "", interests: ["interests"] };
    }
  })();

  /* derive a consistent hue from any name string for avatar background */
  function nameColor(name) {
    var palette = [
      "#5c6bc0","#26a69a","#ef5350","#ab47bc","#42a5f5",
      "#66bb6a","#ffa726","#ec407a","#78909c","#8d6e63"
    ];
    var hash = 0;
    for (var i = 0; i < name.length; i++) hash = (hash + name.charCodeAt(i) * (i + 1)) | 0;
    return palette[Math.abs(hash) % palette.length];
  }

  /* ---------- example photos (fall back to initials if offline) ---------- */
  var photos = {
    "Sinta Maharani":  "https://randomuser.me/api/portraits/women/44.jpg",
    "Bagas Pratama":   "https://randomuser.me/api/portraits/men/22.jpg",
    "Nadia Kusuma":    "https://randomuser.me/api/portraits/women/68.jpg",
    "Andreas Steven":  "https://avatars.githubusercontent.com/u/219260242?v=4",
    "Alya Rahmawati":  "https://randomuser.me/api/portraits/women/12.jpg",
    "Dimas Nugroho":   "https://randomuser.me/api/portraits/men/64.jpg",
    "Kirana Putri":    "https://randomuser.me/api/portraits/women/33.jpg",
    "Yoga Saputra":    "https://randomuser.me/api/portraits/men/76.jpg",
    "Melati Anggraini":"https://randomuser.me/api/portraits/women/56.jpg",
    "Sinta N.":        "https://randomuser.me/api/portraits/women/44.jpg",
    "Budi Santoso":    "https://randomuser.me/api/portraits/men/11.jpg",
    "Lina Wijaya":     "https://randomuser.me/api/portraits/women/21.jpg",
    "Rian H.":         "https://randomuser.me/api/portraits/men/85.jpg"
  };
  /* photo avatar with initials behind it — if the image fails, initials show */
  var avatar = function (name, cls) {
    var img = photos[name]
      ? '<img src="' + photos[name] + '" alt="" loading="lazy" onerror="this.remove()">'
      : "";
    var color = nameColor(name);
    return '<span class="avatar ' + (cls || "avatar--sm") + ' avatar--v' + (img ? " avatar--img" : "") + '" style="background:' + color + ';--av-bg:' + color + '">' +
      esc(initials(name)) + img + "</span>";
  };

  /* ================= MOCK DATA ================= */
  var people = [
    { name: "Sinta Maharani",  major: "Visual Communication Design", batch: "2026", birthday: "3 April",   tags: ["illustration","typography","coffee"] },
    { name: "Bagas Pratama",   major: "Accounting",                  batch: "2025", birthday: "17 June",   tags: ["startups","football","finance"] },
    { name: "Nadia Kusuma",    major: "English Literature",           batch: "2026", birthday: "21 August", tags: ["podcasts","writing","film"] },
    { name: "Andreas Steven",  major: "IT",                          batch: "2023", birthday: "10 July",   tags: ["basketball","music","coding"], link: "https://wa.me/+6285172041108?text=Hello,%20I%20found%20your%20number%20from%20JIUCompass" },
    { name: "Alya Rahmawati",  major: "Japanese Literature",          batch: "2025", birthday: "30 May",    tags: ["research","volunteering","music"] },
    { name: "Dimas Nugroho",   major: "Information Systems",          batch: "2026", birthday: "12 July",   tags: ["data","gaming","ui/ux"] },
    { name: "Kirana Putri",    major: "English Literature",           batch: "2023", birthday: "5 October", tags: ["debate","reading","tennis"] },
    { name: "Yoga Saputra",    major: "Visual Communication Design", batch: "2025", birthday: "22 February",tags: ["3d","photography","sneakers"] },
    { name: "Melati Anggraini",major: "Accounting",                  batch: "2026", birthday: "14 March",  tags: ["marketing","travel","baking"] }
  ];

  /* Academic Vault materials */
  var totalFiles = 1284;
  var notes = [
    { title: "Calculus 1 Summary — Midterm Prep", course: "MATH101", by: "Sinta N.", up: 118,
      type: "PDF", size: "4.2 MB", when: "Updated 2 days ago", catg: "Core Course", year: "2026", ic: "doc" },
    { title: "Intro to Algorithms Cheat Sheet", course: "CS210", by: "Budi Santoso", up: 84,
      type: "DOCX", size: "1.8 MB", when: "Updated 1 week ago", catg: "Comp Sci", year: "2025", ic: "code" },
    { title: "Microeconomics 101 Lecture Notes", course: "ECON101", by: "Lina Wijaya", up: 203,
      type: "PDF", size: "12.5 MB", when: "Updated 3 days ago", catg: "Business", year: "2026", ic: "book" },
    { title: "Marketing Research Case Studies", course: "BUS230", by: "Rian H.", up: 56,
      type: "PDF", size: "8.1 MB", when: "Updated 1 month ago", catg: "Management", year: "2024", ic: "chart" },
    { title: "Data Structures — full semester summary", course: "CS201", by: "Andreas Steven", up: 128,
      type: "PDF", size: "6.4 MB", when: "Updated 5 days ago", catg: "Comp Sci", year: "2024", ic: "code" },
    { title: "Calculus II past exam + worked answers", course: "MATH102", by: "Dimas Nugroho", up: 96,
      type: "PDF", size: "3.1 MB", when: "Updated 1 week ago", catg: "Core Course", year: "2026", ic: "doc" },
    { title: "Intro to UX — lecture notes wk1–7", course: "DSN110", by: "Sinta Maharani", up: 74,
      type: "PDF", size: "9.8 MB", when: "Updated 2 weeks ago", catg: "Design", year: "2026", ic: "book" },
    { title: "Business Statistics formula pack", course: "BUS201", by: "Bagas Pratama", up: 52,
      type: "PDF", size: "1.2 MB", when: "Updated 3 weeks ago", catg: "Business", year: "2025", ic: "chart" },
    { title: "Constitutional Law — case digests", course: "LAW101", by: "Kirana Putri", up: 39,
      type: "DOCX", size: "2.6 MB", when: "Updated 1 month ago", catg: "Indonesian Law", year: "2023", ic: "doc" }
  ];

  var questions = [
    { q: "How do I access the CS lab computers after hours?", tags: ["campus","cs-dept"], answers: 4, votes: 12, by: "Nadia Kusuma", when: "2h ago", solved: true },
    { q: "Best elective to pair with Data Structures in batch 2026?", tags: ["cs201","electives"], answers: 7, votes: 21, by: "Dimas Nugroho", when: "5h ago", solved: true },
    { q: "Anyone have the MATH102 midterm study group link?", tags: ["math102","study-group"], answers: 2, votes: 6, by: "Dimas Nugroho", when: "1d ago", solved: false },
    { q: "Is the library open during exam week weekends?", tags: ["library","exams"], answers: 3, votes: 9, by: "Alya Rahmawati", when: "1d ago", solved: true },
    { q: "How does credit transfer work if I switch to Info Systems?", tags: ["academics","transfer"], answers: 1, votes: 4, by: "Yoga Saputra", when: "2d ago", solved: false }
  ];

  var market = [
    { title: "Calculus textbook (8th ed)", price: "Rp 85.000", cond: "Good", by: "Bagas P.", ico: "\uD83D\uDCD8",
      img: "https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=600&q=60&auto=format&fit=crop" },
    { title: "Wacom drawing tablet", price: "Rp 420.000", cond: "Like new", by: "Sinta M.", ico: "\uD83D\uDD8A\uFE0F",
      img: "https://images.unsplash.com/photo-1626785774573-4b799315345d?w=600&q=60&auto=format&fit=crop" },
    { title: "Dorm mini fridge", price: "Rp 550.000", cond: "Used", by: "Farrel W.", ico: "\uD83E\uDDCA",
      img: "https://images.unsplash.com/photo-1571175443880-49e1d25b2bc5?w=600&q=60&auto=format&fit=crop" },
    { title: "Scientific calculator", price: "Rp 120.000", cond: "Good", by: "Dimas N.", ico: "\uD83E\uDDEE",
      img: "https://images.unsplash.com/photo-1587145820266-a5951ee6f620?w=600&q=60&auto=format&fit=crop" },
    { title: "Basketball (size 7)", price: "Rp 90.000", cond: "Good", by: "Yoga S.", ico: "\uD83C\uDFC0",
      img: "https://images.unsplash.com/photo-1546519638-68e109498ffc?w=600&q=60&auto=format&fit=crop" },
    { title: "Desk lamp (USB)", price: "Rp 65.000", cond: "Like new", by: "Melati A.", ico: "\uD83D\uDCA1",
      img: "https://images.unsplash.com/photo-1507473885765-e6ed057f782c?w=600&q=60&auto=format&fit=crop" }
  ];

  var channels = [
    { name: "CS Batch 2026", last: "Sinta: anyone starting the DS assignment?", unread: 2,
      msgs: [
        { who: "Nadia Kusuma", t: "Reminder: DSN110 group project due Friday!" },
        { who: "Sinta Maharani", t: "anyone starting the DS assignment? \uD83D\uDE05" },
        { who: "me", t: "starting tonight, wanna pair up?" }
      ] },
    { name: "JIU Basketball", last: "Coach: practice moved to 5pm", unread: 1,
      msgs: [
        { who: "Coach Andi", t: "Practice moved to 5pm tomorrow, court B." },
        { who: "me", t: "noted, I'll be there \uD83C\uDFC0" }
      ] },
    { name: "UI/UX Club", last: "Yoga: figma workshop slides are up", unread: 0,
      msgs: [
        { who: "Yoga Saputra", t: "Figma workshop slides are up in Notes \uD83C\uDFA8" },
        { who: "me", t: "amazing, downloading now" }
      ] },
    { name: "Marketplace Deals", last: "Bagas: selling calc textbook cheap", unread: 0,
      msgs: [ { who: "Bagas Pratama", t: "Selling my calc textbook cheap, DM me" } ] },
    { name: "Freshman Help", last: "Alya: how to register for electives?", unread: 0,
      msgs: [ { who: "Alya Rahmawati", t: "How do we register for electives again?" } ] }
  ];

  var updates = [
    { org: "Student Affairs", ico: "\uD83C\uDF93", cat: "academic", cls: "cat--acad", date: "Today \u00B7 09:00",
      place: "Academic Portal", pinned: true,
      title: "Course add/drop closes this Friday \u23F3",
      body: "Last call! Final day to adjust your semester schedule is Friday 5 PM. Late changes need faculty approval \u2014 don't wait for the queue.",
      action: "Open the portal" },
    { org: "JIU Tech Society", ico: "\u26A1", cat: "event", cls: "cat--event", date: "In 3 days",
      place: "Innovation Hall",
      title: "Hack the Campus 2026 \u2014 48h hackathon \uD83D\uDE80",
      body: "Teams of up to 4, all batches welcome. Rp 10 jt prize pool, free midnight nasi goreng, and mentor sessions with industry engineers. Registration closes Sunday.",
      action: "Register your team" },
    { org: "Library Services", ico: "\uD83D\uDCDA", cat: "facility", cls: "cat--org", date: "This week",
      place: "Main Library",
      title: "Finals mode: open until midnight \uD83C\uDF19",
      body: "Weekdays until 00.00 and weekends until 20.00 throughout the exam period. Floors 3\u20134 are silent zones; group rooms are bookable through JIUCompass." },
    { org: "Career Center", ico: "\uD83D\uDCBC", cat: "event", cls: "cat--event", date: "Next Monday",
      place: "Sports Hall",
      title: "Internship Fair \u2014 30+ companies on campus",
      body: "Bring a printed CV and your student ID. Verified JIUCompass profiles can pre-register for priority interview slots.",
      action: "Pre-register" },
    { org: "Student Council", ico: "\uD83E\uDD1D", cat: "community", cls: "cat--org", date: "In 2 weeks",
      place: "Central Court",
      title: "Welcome Day + campus clean-up \uD83C\uDF31",
      body: "Help welcome Batch 2026! Volunteers earn the Contributor badge and free merch. Sign up through your org's group chat." },
    { org: "International Office", ico: "\u2708\uFE0F", cat: "academic", cls: "cat--acad", date: "Apps open",
      place: "Room B-204",
      title: "Exchange semester: 12 partner universities",
      body: "Korea, Japan, the Netherlands and more. Info session Thursday 4 PM \u2014 GPA 3.0+ recommended. Two scholarship slots available.",
      action: "See destinations" }
  ];

  /* ================= HOME ================= */
  function renderHome() {
    /* trending notes: top 3 by upvotes */
    var top = notes.slice().sort(function (a, b) { return b.up - a.up; }).slice(0, 3);
    $("homeNotes").innerHTML = top.map(function (n) {
      return '<button class="hrow" type="button" data-view="notes">' +
        '<span class="fic fic--' + n.ic + '">' + ficSvg() + "</span>" +
        '<span class="hrow__main"><b>' + esc(n.title) + "</b><span>" + esc(n.course) + " \u00B7 by " + esc(n.by) + "</span></span>" +
        '<span class="rate rate--sm">\uD83D\uDC4D ' + n.up + "</span></button>";
    }).join("");

    /* recent Q&A: first 3 */
    $("homeQA").innerHTML = questions.slice(0, 3).map(function (x) {
      return '<button class="hrow" type="button" data-view="qa">' +
        '<span class="hrow__main"><b>' + esc(x.q) + "</b><span>" +
        x.answers + " answer" + (x.answers === 1 ? "" : "s") + " \u00B7 " + esc(x.when) +
        (x.solved ? ' \u00B7 <i class="hrow__ok">\u2713 solved</i>' : "") + "</span></span></button>";
    }).join("");

    /* latest announcements: first 2 */
    $("homeUpdates").innerHTML = updates.slice(0, 2).map(function (u) {
      return '<button class="hrow" type="button" data-view="updates">' +
        '<span class="hrow__emoji">' + u.ico + "</span>" +
        '<span class="hrow__main"><b>' + esc(u.title) + "</b><span>" + esc(u.org) + " \u00B7 " + esc(u.date) + "</span></span></button>";
    }).join("");

    /* newest marketplace items: first 4 with photos */
    $("homeMarket").innerHTML = market.slice(0, 4).map(function (m) {
      var media = '<span class="hitem__img">' +
        '<span class="hitem__ico">' + m.ico + "</span>" +
        (m.img ? '<img src="' + m.img + '" alt="" loading="lazy" onerror="this.remove()">' : "") + "</span>";
      return '<button class="hitem" type="button" data-view="marketplace">' + media +
        "<b>" + esc(m.title) + "</b><span>" + esc(m.price) + "</span></button>";
    }).join("");
  }

  /* ================= DIRECTORY ================= */
  var dirGrid = $("dirGrid"), dirCount = $("dirCount");
  function renderDirectory() {
    var q = ($("dirSearch").value || "").toLowerCase().trim();
    var mj = $("dirMajor").value;
    var bt = $("dirBatch").value;
    var list = people.filter(function (p) {
      var hay = (p.name + " " + p.major + " " + p.tags.join(" ")).toLowerCase();
      return (!q || hay.indexOf(q) > -1) && (!mj || p.major === mj) && (!bt || p.batch === bt);
    });
    dirCount.textContent = list.length + " student" + (list.length === 1 ? "" : "s");
    dirGrid.innerHTML = list.length ? list.map(function (p) {
      return '<article class="person"><div class="person__head">' + avatar(p.name, "avatar--md") +
        '<div><h3 class="person__name">' + esc(p.name) + '</h3><span class="person__meta">' +
        esc(p.major) + " \u00B7 " + p.batch + "</span></div></div>" +
        '<div class="person__tags">' + p.tags.map(function (t) {
          return '<span class="idcard__tag">' + esc(t) + "</span>"; }).join("") + "</div>" +
        (p.link
          ? '<a class="btn btn--solid" href="' + esc(p.link) + '" target="_blank" rel="noopener">Connect</a>'
          : '<button class="btn btn--solid" data-toast="Connection request sent to ' + esc(p.name) + ' (mock)">Connect</button>') +
        '</article>';
    }).join("") : '<div class="empty">No students match those filters.</div>';
  }

  /* ================= ACADEMIC VAULT (course notes) ================= */
  function ficSvg(ic) {
    if (ic === "code") return '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="4" width="18" height="16" rx="2"/><path d="m8 10 2.5 2L8 14"/><path d="M13 15h4"/></svg>';
    if (ic === "book") return '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M12 6c-1.8-1.6-4.5-2-8-2v14c3.5 0 6.2.4 8 2 1.8-1.6 4.5-2 8-2V4c-3.5 0-6.2.4-8 2z"/><path d="M12 6v14"/></svg>';
    if (ic === "chart") return '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="4" width="18" height="16" rx="2"/><path d="M8 15v-3M12 15V9M16 15v-5"/></svg>';
    return '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><path d="M14 2v6h6"/><path d="M9 13h6M9 17h6"/></svg>';
  }
  function fmtTotal() { return totalFiles.toLocaleString("en-US"); }

  function renderVault() {
    var q = ($("noteSearch").value || "").toLowerCase().trim();
    var mj = $("vaultMajor").value;
    var yr = $("vaultYear").value;
    var list = notes.filter(function (n) {
      var hay = (n.title + " " + n.course + " " + n.by + " " + n.catg).toLowerCase();
      return (!q || hay.indexOf(q) > -1) && (!mj || n.catg === mj) && (!yr || n.year === yr);
    });
    $("vaultBody").innerHTML = list.length ? list.map(function (n) {
      return "<tr>" +
        '<td class="vt-info"><span class="fic fic--' + n.ic + '">' + ficSvg(n.ic) + "</span>" +
        '<div><span class="vt-title" data-toast="Opening preview of \u201C' + esc(n.title) + '\u201D (mock)">' + esc(n.title) + "</span>" +
        '<div class="vt-meta">' + esc(n.type) + " \u00B7 " + esc(n.size) + " \u00B7 " + esc(n.when) +
        ' <span class="vt-cat">' + esc(n.catg).toUpperCase() + "</span></div></div></td>" +
        '<td class="vt-by">' + avatar(n.by, "avatar--xs") + "<span>" + esc(n.by) + "</span></td>" +
        '<td><button class="rate" type="button" data-toast="Upvoted (mock)">\uD83D\uDC4D ' + n.up + "</button></td>" +
        '<td class="ta-r"><button class="vault__dl" type="button" data-toast="Downloading ' + esc(n.title) + ' (mock)">' +
        '<svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 3v12"/><path d="m7 11 5 5 5-5"/><path d="M5 21h14"/></svg>' +
        " Download</button></td></tr>";
    }).join("") : '<tr><td colspan="4"><div class="empty" style="margin:14px 0">No materials match. Try another search.</div></td></tr>';

    $("vaultShowing").textContent = list.length
      ? "Showing 1 to " + list.length + " of " + fmtTotal() + " materials"
      : "0 results \u00B7 " + fmtTotal() + " materials in the Vault";
  }

  /* tag pills fill the search box */
  $("vaultTags").addEventListener("click", function (e) {
    var b = e.target.closest(".vtag");
    if (!b) return;
    var v = b.getAttribute("data-vtag") || "";
    $("noteSearch").value = v;
    document.querySelectorAll(".vtag").forEach(function (t) { t.classList.toggle("is-active", t === b && !!v); });
    renderVault();
    if (!v) toast("Showing all materials");
  });

  /* ================= Q&A ================= */
  function renderQA() {
    $("qaList").innerHTML = questions.map(function (x) {
      return '<article class="qitem"><div class="qstats">' +
        "<div><b>" + x.votes + "</b><span>votes</span></div>" +
        '<div class="' + (x.solved ? "answered" : "") + '"><b>' + x.answers + "</b><span>" +
        (x.solved ? "solved" : "answers") + "</span></div></div>" +
        '<div><h3 class="qtitle">' + esc(x.q) + "</h3>" +
        '<div class="qmeta">' + x.tags.map(function (t) { return '<span class="tag">#' + esc(t) + "</span>"; }).join("") +
        (x.solved ? '<span class="tag tag--gold">\u2713 answered</span>' : "") + "</div>" +
        '<p class="qfoot">Asked by ' + esc(x.by) + " \u00B7 " + x.when + "</p></div></article>";
    }).join("");
  }
  renderQA();

  /* ================= MARKETPLACE ================= */
  function renderMarket() {
    $("marketGrid").innerHTML = market.map(function (m) {
      var media = '<div class="item__img"><span class="item__ico">' + m.ico + "</span>" +
        (m.img ? '<img src="' + m.img + '" alt="' + esc(m.title) + '" loading="lazy" onerror="this.remove()">' : "") + "</div>";
      return '<article class="item">' + media +
        '<div class="item__body"><h3 class="item__title">' + esc(m.title) + "</h3>" +
        '<div class="item__price">' + esc(m.price) + "</div>" +
        '<div class="item__meta"><span class="pill-cond">' + esc(m.cond) + "</span><span>" + esc(m.by) + "</span></div>" +
        '<button class="btn btn--solid btn--block" style="margin-top:12px" data-toast="Contacting seller (mock)">Contact seller</button>' +
        "</div></article>";
    }).join("");
  }
  renderMarket();

  /* ================= CAMPUS UPDATES ================= */
  $("updateList").innerHTML = updates.map(function (u) {
    return '<article class="update' + (u.pinned ? " update--pinned" : "") + '">' +
      '<div class="update__logo">' + u.ico + "</div><div class=\"update__main\">" +
      '<div class="update__top"><span class="update__org">' + esc(u.org) + "</span>" +
      '<span class="cat ' + u.cls + '">' + esc(u.cat) + "</span>" +
      (u.pinned ? '<span class="cat cat--pin">\uD83D\uDCCC pinned</span>' : "") +
      '<span class="update__date">' + esc(u.date) + "</span></div>" +
      '<h3 class="update__title">' + esc(u.title) + "</h3>" +
      '<p class="update__body">' + esc(u.body) + "</p>" +
      '<div class="update__foot"><span class="update__place">\uD83D\uDCCD ' + esc(u.place) + "</span>" +
      (u.action ? '<button class="update__cta" type="button" data-toast="' + esc(u.action) + ' (mock)">' + esc(u.action) + " \u2192</button>" : "") +
      "</div></div></article>";
  }).join("");

  /* ================= CHAT ================= */
  var channelList = $("channelList"), threadHead = $("threadHead"), threadBody = $("threadBody");
  var active = 0;
  function renderChannels() {
    channelList.innerHTML = channels.map(function (c, i) {
      return '<button class="channel' + (i === active ? " is-active" : "") + '" data-ch="' + i + '">' +
        avatar(c.name, "avatar--sm") +
        '<span class="who"><b>' + esc(c.name) + "</b><span>" + esc(c.last) + "</span></span>" +
        (c.unread ? '<span class="unread">' + c.unread + "</span>" : "") + "</button>";
    }).join("");
  }
  function renderThread() {
    var c = channels[active];
    threadHead.innerHTML =
      '<button class="thread__back" type="button" aria-label="Back to chats">\u2190</button>' +
      avatar(c.name, "avatar--sm") + "<div><b>" + esc(c.name) +
      "</b><br><span>" + c.msgs.length + " messages \u00B7 verified members only</span></div>";
    threadBody.innerHTML = c.msgs.map(function (m) {
      var me = m.who === "me";
      return '<div class="msg' + (me ? " msg--me" : "") + '">' + (me ? "" : avatar(m.who, "avatar--sm")) +
        '<div class="msg__bubble"><div class="msg__who">' + esc(me ? "You" : m.who) + "</div>" +
        '<div class="msg__text">' + esc(m.t) + "</div></div></div>";
    }).join("");
    threadBody.scrollTop = threadBody.scrollHeight;
  }
  var chatWrap = document.querySelector(".chat");
  channelList.addEventListener("click", function (e) {
    var b = e.target.closest(".channel");
    if (!b) return;
    active = +b.getAttribute("data-ch");
    channels[active].unread = 0;
    renderChannels(); renderThread();
    chatWrap.classList.add("show-thread"); // on phones this swaps the list for the thread
  });
  threadHead.addEventListener("click", function (e) {
    if (e.target.closest(".thread__back")) chatWrap.classList.remove("show-thread");
  });
  $("composer").addEventListener("submit", function (e) {
    e.preventDefault();
    var input = $("msgInput"), v = input.value.trim();
    if (!v) return;
    channels[active].msgs.push({ who: "me", t: v });
    channels[active].last = "You: " + v;
    input.value = "";
    renderChannels(); renderThread();
  });

  /* ================= FILTER SELECTS ================= */
  (function fillSelects() {
    var uniq = function (a) { return a.filter(function (v, i) { return a.indexOf(v) === i; }); };
    /* directory */
    uniq(people.map(function (p) { return p.major; })).sort().forEach(function (m) {
      $("dirMajor").insertAdjacentHTML("beforeend", '<option value="' + esc(m) + '">' + esc(m) + "</option>");
    });
    uniq(people.map(function (p) { return p.batch; })).sort().reverse().forEach(function (b) {
      $("dirBatch").insertAdjacentHTML("beforeend", '<option value="' + esc(b) + '">Batch ' + esc(b) + "</option>");
    });
    /* vault */
    uniq(notes.map(function (n) { return n.catg; })).sort().forEach(function (m) {
      $("vaultMajor").insertAdjacentHTML("beforeend", '<option value="' + esc(m) + '">' + esc(m) + "</option>");
    });
    uniq(notes.map(function (n) { return n.year; })).sort().reverse().forEach(function (y) {
      $("vaultYear").insertAdjacentHTML("beforeend", '<option value="' + esc(y) + '">' + esc(y) + "</option>");
    });
  })();

  $("dirSearch").addEventListener("input", renderDirectory);
  $("dirMajor").addEventListener("change", renderDirectory);
  $("dirBatch").addEventListener("change", renderDirectory);
  $("noteSearch").addEventListener("input", renderVault);
  $("vaultMajor").addEventListener("change", renderVault);
  $("vaultYear").addEventListener("change", renderVault);

  /* ================= VIEW SWITCHING ================= */
  var meta = {
    home:        ["Home", "Your campus at a glance."],
    directory:   ["Directory", "The heart of JIUCompass \u2014 find classmates by major, batch, or interest."],
    notes:       ["Course Notes", "The Academic Vault: shared summaries, lectures, and past papers."],
    qa:          ["Q&A", "Ask the campus. Answers from real students."],
    marketplace: ["Marketplace", "Buy, sell, and rent between JIU students."],
    chat:        ["Group Chat", "Verified-only groups for your campus life."],
    updates:     ["Campus Updates", "Announcements from faculty and student orgs."],
    profile:     ["My Profile", "Your verified student identity across JIUCompass."]
  };
  var rendered = { home: true, profile: true, qa: true, marketplace: true, updates: true };
  var moreBtn = $("moreBtn");
  function setView(id) {
    document.querySelectorAll(".navitem").forEach(function (n) {
      n.classList.toggle("is-active", n.getAttribute("data-view") === id);
    });
    document.querySelectorAll(".view").forEach(function (v) {
      v.hidden = v.id !== "view-" + id;
    });
    document.body.classList.toggle("theme-light", id === "profile" || id === "chat");
    if (moreBtn) moreBtn.classList.toggle("is-active", id === "notes" || id === "qa" || id === "marketplace" || id === "updates");
    $("pageTitle").textContent = meta[id][0];
    $("pageSub").textContent = meta[id][1];
    if (!rendered[id]) {
      if (id === "directory") renderDirectory();
      if (id === "notes") renderVault();
      if (id === "chat") { renderChannels(); renderThread(); }
      rendered[id] = true;
    }
    if (history.replaceState) history.replaceState(null, "", "#" + id);
    window.scrollTo({ top: 0 });
  }
  /* delegated, so rows rendered later (Home widgets) also switch views */
  document.addEventListener("click", function (e) {
    var b = e.target.closest("[data-view]");
    if (b) setView(b.getAttribute("data-view"));
  });

  /* ---------- "More" nav popup (Course Notes / Marketplace / Campus Updates) ---------- */
  var navMore = $("navMore"), moreMenu = $("moreMenu");
  if (moreBtn && moreMenu && navMore) {
    moreBtn.addEventListener("click", function (e) {
      e.stopPropagation();
      var willOpen = moreMenu.hidden;
      moreMenu.hidden = !willOpen;
      moreBtn.setAttribute("aria-expanded", String(willOpen));
    });
    moreMenu.addEventListener("click", function (e) {
      if (e.target.closest("[data-view]")) {
        moreMenu.hidden = true;
        moreBtn.setAttribute("aria-expanded", "false");
      }
    });
    document.addEventListener("click", function (e) {
      if (!moreMenu.hidden && !navMore.contains(e.target)) {
        moreMenu.hidden = true;
        moreBtn.setAttribute("aria-expanded", "false");
      }
    });
    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape" && !moreMenu.hidden) {
        moreMenu.hidden = true;
        moreBtn.setAttribute("aria-expanded", "false");
      }
    });
  }

  renderHome();
  var start = (location.hash || "").replace("#", "");
  setView(meta[start] ? start : "home");

  /* ================= POPULATE USER UI FROM STORED DATA ================= */
  (function populateUser() {
    var nm = me.name || "You";
    var inits = initials(nm);
    var color = nameColor(nm);
    var firstWord = nm.trim().split(/\s+/)[0];

    /* load saved photo if any */
    var savedPhoto = null;
    try { savedPhoto = localStorage.getItem("jiuUserPhoto") || null; } catch(e) {}

    function applyAvatar(el, size) {
      if (!el) return;
      el.textContent = inits;
      if (savedPhoto) {
        el.style.backgroundImage = "url(" + savedPhoto + ")";
        el.style.backgroundSize = "cover";
        el.style.backgroundPosition = "center";
        el.style.background = "transparent";
        el.style.color = "transparent";
      } else {
        el.style.backgroundImage = "";
        el.style.background = "";   /* fall back to CSS — white + green ring */
        el.style.color = "";
      }
    }

    /* sidebar */
    var sideAv = $("sideAvatar");
    applyAvatar(sideAv);
    var sideNm = $("sideName");
    if (sideNm) sideNm.textContent = nm;
    var sideEm = $("sideEmail");
    if (sideEm) sideEm.textContent = "@" + (me.emailHandle || "you");

    /* top bar */
    applyAvatar($("topAvatar"));

    /* home greeting */
    var hello = $("helloTitle");
    if (hello) hello.textContent = "Welcome back, " + firstWord + "! 👋";

    /* profile card */
    applyAvatar($("profileAvatar"));
    var profNm = $("profileName");
    if (profNm) profNm.textContent = nm;
    var profMeta = $("profileMeta");
    if (profMeta) profMeta.textContent = (me.major || "—") + " · Batch " + (me.batch || "—");
    var profBd = $("profileBirthday");
    if (profBd) profBd.textContent = me.birthday ? "🎂 " + me.birthday : "🎂 —";
    var profTags = $("profileTags");
    if (profTags) {
      profTags.innerHTML = me.interests.map(function(t) {
        return '<span class="idcard__tag">' + esc(t) + "</span>";
      }).join("");
    }

    /* details panel */
    var dEm = $("detailEmail");
    if (dEm) dEm.textContent = me.email || "—";
    var dMj = $("detailMajor");
    if (dMj) dMj.textContent = me.major || "—";
    var dBt = $("detailBatch");
    if (dBt) dBt.textContent = me.batch ? me.batch + " (Freshman)" : "—";
    var dBd = $("detailBirthday");
    if (dBd) dBd.textContent = me.birthday || "—";
    var dIn = $("detailInterests");
    if (dIn) dIn.textContent = me.interests.length ? me.interests.map(function(s){return s.charAt(0).toUpperCase()+s.slice(1);}).join(", ") : "—";

    /* ---- photo upload handler ---- */
    var avatarInput = $("avatarInput");
    if (avatarInput) {
      avatarInput.addEventListener("change", function () {
        var file = this.files[0];
        if (!file) return;
        var reader = new FileReader();
        reader.onload = function (e) {
          savedPhoto = e.target.result;
          try { localStorage.setItem("jiuUserPhoto", savedPhoto); } catch(err) {
            toast("Photo too large to save — will reset on refresh");
          }
          /* apply to all avatar elements */
          applyAvatar($("profileAvatar"));
          applyAvatar($("sideAvatar"));
          applyAvatar($("topAvatar"));
          toast("Profile photo updated!");
        };
        reader.readAsDataURL(file);
      });
    }
  })();

  /* ================= FORM POPUP (upload notes / ask question / sell item) ================= */
  var formModal = $("formModal");
  var lastFocused = null;

  function openForm(which) {
    ["note", "question", "item"].forEach(function (id) {
      $("form-" + id).hidden = id !== which;
    });
    lastFocused = document.activeElement;
    formModal.classList.add("is-open");
    formModal.setAttribute("aria-hidden", "false");
    document.documentElement.style.overflow = "hidden";
    var first = formModal.querySelector(".formmodal__panel:not([hidden]) .input");
    if (first) setTimeout(function () { first.focus(); }, 60);
  }
  function closeForm() {
    formModal.classList.remove("is-open");
    formModal.setAttribute("aria-hidden", "true");
    document.documentElement.style.overflow = "";
    if (lastFocused && lastFocused.focus) lastFocused.focus();
  }
  document.querySelectorAll("[data-open-form]").forEach(function (b) {
    b.addEventListener("click", function () { openForm(b.getAttribute("data-open-form")); });
  });
  document.querySelectorAll("[data-close-form]").forEach(function (b) {
    b.addEventListener("click", closeForm);
  });
  document.addEventListener("keydown", function (e) {
    if (e.key === "Escape" && formModal.classList.contains("is-open")) closeForm();
  });

  /* ----- Upload notes ----- */
  $("noteForm").addEventListener("submit", function (e) {
    e.preventDefault();
    var title = $("nfTitle").value.trim();
    var course = $("nfCourse").value.trim().toUpperCase();
    var pages = parseInt($("nfPages").value, 10);
    if (!title) { toast("Add a title for your notes"); $("nfTitle").focus(); return; }
    if (!course) { toast("Add the course code"); $("nfCourse").focus(); return; }
    if (!pages || pages < 1) { toast("Enter the number of pages"); $("nfPages").focus(); return; }
    if (!$("nfFile").files.length) { toast("Attach a PDF or image file"); return; }
    var file = $("nfFile").files[0];
    var isPdf = /pdf$/i.test(file.name);
    notes.unshift({
      title: title, course: course, by: me.name, up: 0,
      type: isPdf ? "PDF" : "IMG",
      size: (file.size / (1024 * 1024)).toFixed(1) + " MB",
      when: "Updated just now", catg: "Core Course", year: "2026", ic: "doc"
    });
    totalFiles++;
    $("vaultTotal").textContent = fmtTotal();
    renderVault();
    renderHome();
    rendered.notes = true;
    this.reset();
    closeForm();
    setView("notes");
    toast("Notes uploaded to the Vault \u2014 thanks for sharing!");
  });

  /* ----- Ask a question ----- */
  $("questionForm").addEventListener("submit", function (e) {
    e.preventDefault();
    var q = $("qfTitle").value.trim();
    if (!q) { toast("Type your question first"); $("qfTitle").focus(); return; }
    var tags = $("qfTags").value.split(",").map(function (s) {
      return s.trim().toLowerCase().replace(/\s+/g, "-");
    }).filter(Boolean).slice(0, 3);
    questions.unshift({
      q: q, tags: tags.length ? tags : ["general"],
      answers: 0, votes: 0, by: me.name, when: "just now", solved: false
    });
    renderQA();
    renderHome();
    this.reset();
    closeForm();
    setView("qa");
    toast("Question posted to campus!");
  });

  /* ----- Sell an item ----- */
  $("itemForm").addEventListener("submit", function (e) {
    e.preventDefault();
    var title = $("ifTitle").value.trim();
    var price = $("ifPrice").value.trim();
    var cond = $("ifCond").value;
    if (!title) { toast("Name your item"); $("ifTitle").focus(); return; }
    if (!price || +price < 0) { toast("Set a price in Rupiah"); $("ifPrice").focus(); return; }
    if (!cond) { toast("Pick the item condition"); $("ifCond").focus(); return; }
    var form = this;
    function publish(imgUrl) {
      market.unshift({
        title: title,
        price: "Rp " + Number(price).toLocaleString("id-ID"),
        cond: cond, by: initials(me.name).slice(0,1) + esc(me.name.trim().split(/\s+/).pop().slice(0,1)) + ".", ico: "\uD83D\uDECD\uFE0F", img: imgUrl || null
      });
      renderMarket();
      renderHome();
      form.reset();
      closeForm();
      setView("marketplace");
      toast("Listing published!");
    }
    var file = $("ifPhoto").files[0];
    if (file) {
      var reader = new FileReader();
      reader.onload = function () { publish(reader.result); };
      reader.onerror = function () { publish(null); };
      reader.readAsDataURL(file);
    } else {
      publish(null);
    }
  });
})();