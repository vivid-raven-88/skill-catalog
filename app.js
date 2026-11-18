/* skill-catalog — halaman publik: render, cari, salin. Tanpa admin.
   Pola mengikuti sky/prompts: data dari skills.json, filter langsung. */
(function () {
  "use strict";

  var state = { skills: [], query: "", category: "Semua", viewId: null };

  /* ---------- helpers ---------- */
  function $(id) { return document.getElementById(id); }
  function esc(s) {
    return String(s == null ? "" : s)
      .replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;").replace(/'/g, "&#39;");
  }

  var toastTimer = null;
  function toast(msg) {
    var t = $("toast");
    t.textContent = msg;
    t.classList.add("show");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function () { t.classList.remove("show"); }, 2600);
  }

  function copyText(text, btn, doneLabel) {
    function done() {
      if (!btn) return;
      var original = btn.dataset.label || btn.textContent;
      btn.dataset.label = original;
      btn.textContent = doneLabel || "Disalin ✓";
      btn.classList.add("btn-copied");
      setTimeout(function () {
        btn.textContent = original;
        btn.classList.remove("btn-copied");
      }, 1600);
    }
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(text).then(function () { done(); toast("Disalin ke clipboard."); })
        .catch(function () { fallbackCopy(text, done); });
    } else {
      fallbackCopy(text, done);
    }
  }
  function fallbackCopy(text, done) {
    var ta = document.createElement("textarea");
    ta.value = text;
    ta.style.position = "fixed"; ta.style.opacity = "0";
    document.body.appendChild(ta);
    ta.select();
    try { document.execCommand("copy"); done(); toast("Disalin ke clipboard."); }
    catch (e) { toast("Gagal menyalin — salin manual ya."); }
    document.body.removeChild(ta);
  }

  /* ---------- data ---------- */
  function load() {
    fetch("skills.json", { cache: "no-store" })
      .then(function (r) {
        if (!r.ok) throw new Error("HTTP " + r.status);
        return r.json();
      })
      .then(function (data) {
        var list = Array.isArray(data) ? data : data.skills;
        if (!Array.isArray(list)) throw new Error("format skills.json salah");
        state.skills = list;
        $("loadError").hidden = true;
        renderAll();
      })
      .catch(function () {
        $("loadError").hidden = false;
        $("grid").innerHTML = "";
        $("countNum").textContent = "0";
      });
  }

  /* ---------- render ---------- */
  function categories() {
    var seen = {};
    var out = [];
    state.skills.forEach(function (p) {
      var c = (p.category || "Lainnya").trim() || "Lainnya";
      if (!seen[c]) { seen[c] = true; out.push(c); }
    });
    return out.sort(function (a, b) { return a.localeCompare(b); });
  }

  function filtered() {
    var q = state.query.trim().toLowerCase();
    return state.skills.filter(function (p) {
      var catOk = state.category === "Semua" || (p.category || "Lainnya") === state.category;
      if (!catOk) return false;
      if (!q) return true;
      return [p.name, p.description, p.category, p.id].join("\n").toLowerCase().indexOf(q) !== -1;
    });
  }

  function preview(desc) {
    var d = desc || "";
    return d.length > 180 ? d.slice(0, 180) + "…" : d;
  }

  function renderChips() {
    var wrap = $("chips");
    var cats = ["Semua"].concat(categories());
    wrap.innerHTML = cats.map(function (c) {
      return '<button class="chip" type="button" role="tab" aria-selected="' +
        (state.category === c) + '" data-cat="' + esc(c) + '">' + esc(c) + "</button>";
    }).join("");
    wrap.querySelectorAll(".chip").forEach(function (chip) {
      chip.addEventListener("click", function () {
        state.category = chip.dataset.cat;
        renderAll();
      });
    });
  }

  function cardHTML(p, i) {
    var gh = p.github ? '<a class="btn btn-ghost" href="' + esc(p.github) + '" target="_blank" rel="noopener">GitHub ↗</a>' : "";
    return '<article class="card" style="--i:' + i + '">' +
      '<div class="card-top"><span class="badge">' + esc(p.category || "Lainnya") + "</span></div>" +
      '<h3 class="card-title">' + esc(p.name) + "</h3>" +
      '<p class="card-desc">' + esc(preview(p.description)) + "</p>" +
      '<pre class="card-preview">' + esc(p.id) + "/SKILL.md</pre>" +
      '<div class="card-foot">' +
        '<button class="btn btn-primary" type="button" data-copy="' + esc(p.id) + '">Salin deskripsi</button>' +
        '<button class="btn btn-ghost" type="button" data-view="' + esc(p.id) + '">Lihat</button>' + gh +
      "</div></article>";
  }

  function byId(id) {
    for (var i = 0; i < state.skills.length; i++) {
      if (state.skills[i].id === id) return state.skills[i];
    }
    return null;
  }

  function renderAll() {
    renderChips();
    var list = filtered();
    $("countNum").textContent = String(list.length);
    var grid = $("grid");
    grid.innerHTML = list.map(cardHTML).join("");
    $("empty").hidden = list.length !== 0 || state.skills.length === 0;
    grid.querySelectorAll("[data-copy]").forEach(function (b) {
      b.addEventListener("click", function () {
        var p = byId(b.dataset.copy);
        if (p) copyText(p.description || "", b);
      });
    });
    grid.querySelectorAll("[data-view]").forEach(function (b) {
      b.addEventListener("click", function () { openView(b.dataset.view); });
    });
  }

  /* ---------- modal lihat skill ---------- */
  function openModal(id) { $(id).hidden = false; document.body.style.overflow = "hidden"; }
  function closeModal(el) {
    var m = el.closest ? el.closest(".modal") : null;
    if (!m) return;
    m.hidden = true;
    if (!document.querySelector(".modal:not([hidden])")) document.body.style.overflow = "";
  }
  document.querySelectorAll("[data-close]").forEach(function (el) {
    el.addEventListener("click", function () { closeModal(el); });
  });
  document.addEventListener("keydown", function (e) {
    if (e.key === "Escape") {
      document.querySelectorAll(".modal:not([hidden])").forEach(function (m) { m.hidden = true; });
      document.body.style.overflow = "";
    }
  });

  function openView(id) {
    var p = byId(id);
    if (!p) return;
    state.viewId = id;
    $("viewCat").textContent = p.category || "Lainnya";
    $("viewTitle").textContent = p.name;
    $("viewDesc").textContent = p.description || "";
    $("viewPrompt").textContent = "skills/" + p.id + "/SKILL.md";
    var gh = $("viewGhBtn");
    if (p.github) { gh.href = p.github; gh.style.display = ""; }
    else { gh.style.display = "none"; }
    openModal("viewModal");
  }
  $("viewCopyBtn").addEventListener("click", function () {
    var p = byId(state.viewId);
    if (p) copyText(p.description || "", $("viewCopyBtn"));
  });

  /* ---------- search & filter ---------- */
  $("searchInput").addEventListener("input", function () {
    state.query = $("searchInput").value;
    renderAll();
  });
  $("resetFilter").addEventListener("click", function () {
    state.query = "";
    state.category = "Semua";
    $("searchInput").value = "";
    renderAll();
  });

  load();
})();
