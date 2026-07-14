/* ============================================================
   TWÓJ PRAWNIK — logika strony
   1. i18n: auto-detekcja języka przeglądarki + przełącznik
   2. Header: stan po przewinięciu, menu mobilne
   3. Animacje: scroll reveal (IntersectionObserver)
   4. Formularz kontaktowy (mailto)
   ============================================================ */

(function () {
  "use strict";

  var SUPPORTED = ["pl", "uk", "en", "de"];
  var STORAGE_KEY = "tp-lang";
  var LANG_LABEL = { pl: "PL", uk: "UA", en: "EN", de: "DE" };

  /* ---------- 1. i18n ---------- */

  function detectLang() {
    var saved = null;
    try { saved = localStorage.getItem(STORAGE_KEY); } catch (e) { /* tryb prywatny */ }
    if (saved && SUPPORTED.indexOf(saved) !== -1) return saved;

    var candidates = navigator.languages || [navigator.language || "pl"];
    for (var i = 0; i < candidates.length; i++) {
      var code = String(candidates[i]).toLowerCase().slice(0, 2);
      if (code === "ua") code = "uk";
      if (code === "ru") code = "uk"; // rosyjskojęzyczni → wersja ukraińska
      if (SUPPORTED.indexOf(code) !== -1) return code;
    }
    return "pl";
  }

  function applyLang(lang) {
    var dict = I18N[lang];
    if (!dict) return;

    document.querySelectorAll("[data-i18n]").forEach(function (el) {
      var key = el.getAttribute("data-i18n");
      if (dict[key] != null) el.textContent = dict[key];
    });

    document.querySelectorAll("[data-i18n-html]").forEach(function (el) {
      var key = el.getAttribute("data-i18n-html");
      if (dict[key] != null) el.innerHTML = dict[key];
    });

    document.documentElement.lang = lang;
    document.title = dict["meta.title"] || document.title;
    var metaDesc = document.querySelector('meta[name="description"]');
    if (metaDesc && dict["meta.desc"]) metaDesc.setAttribute("content", dict["meta.desc"]);

    var current = document.getElementById("langCurrent");
    if (current) current.textContent = LANG_LABEL[lang];

    document.querySelectorAll(".lang-menu [data-lang]").forEach(function (btn) {
      btn.setAttribute("aria-selected", btn.getAttribute("data-lang") === lang ? "true" : "false");
    });

    try { localStorage.setItem(STORAGE_KEY, lang); } catch (e) { /* ignoruj */ }
  }

  var currentLang = detectLang();
  applyLang(currentLang);

  /* Przełącznik języka */
  var langSwitch = document.getElementById("langSwitch");
  var langBtn = document.getElementById("langBtn");
  var langMenu = document.getElementById("langMenu");

  function closeLangMenu() {
    langSwitch.classList.remove("open");
    langBtn.setAttribute("aria-expanded", "false");
  }

  langBtn.addEventListener("click", function (e) {
    e.stopPropagation();
    var open = langSwitch.classList.toggle("open");
    langBtn.setAttribute("aria-expanded", open ? "true" : "false");
  });

  langMenu.addEventListener("click", function (e) {
    var btn = e.target.closest("[data-lang]");
    if (!btn) return;
    currentLang = btn.getAttribute("data-lang");
    applyLang(currentLang);
    closeLangMenu();
  });

  document.addEventListener("click", function (e) {
    if (!langSwitch.contains(e.target)) closeLangMenu();
  });

  document.addEventListener("keydown", function (e) {
    if (e.key === "Escape") closeLangMenu();
  });

  /* ---------- 2. Header ---------- */

  var header = document.querySelector(".site-header");
  var lastScrolled = false;

  function onScroll() {
    var scrolled = window.scrollY > 12;
    if (scrolled !== lastScrolled) {
      header.classList.toggle("scrolled", scrolled);
      lastScrolled = scrolled;
    }
  }
  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();

  /* Menu mobilne */
  var menuToggle = document.getElementById("menuToggle");
  var mainNav = document.getElementById("mainNav");

  menuToggle.addEventListener("click", function () {
    var open = mainNav.classList.toggle("open");
    menuToggle.setAttribute("aria-expanded", open ? "true" : "false");
  });

  mainNav.addEventListener("click", function (e) {
    if (e.target.closest("a")) {
      mainNav.classList.remove("open");
      menuToggle.setAttribute("aria-expanded", "false");
    }
  });

  /* ---------- 3. Scroll reveal ---------- */

  var reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var revealEls = document.querySelectorAll(".reveal");

  if (reduceMotion || !("IntersectionObserver" in window)) {
    revealEls.forEach(function (el) { el.classList.add("in-view"); });
  } else {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add("in-view");
          io.unobserve(entry.target);
        }
      });
    }, { threshold: 0.15, rootMargin: "0px 0px -8% 0px" });

    revealEls.forEach(function (el) { io.observe(el); });
  }

  /* ---------- 4. Formularz (mailto) ---------- */

  var form = document.getElementById("contactForm");
  var status = document.getElementById("formStatus");

  form.addEventListener("submit", function (e) {
    e.preventDefault();
    var dict = I18N[currentLang];

    var name = form.elements.name.value.trim();
    var contact = form.elements.contact.value.trim();
    var message = form.elements.message.value.trim();

    var valid = true;
    [form.elements.name, form.elements.contact, form.elements.message].forEach(function (field) {
      var empty = !field.value.trim();
      field.classList.toggle("invalid", empty);
      if (empty) valid = false;
    });

    if (!valid) {
      status.textContent = dict["form.err"];
      status.className = "form-status error";
      var firstInvalid = form.querySelector(".invalid");
      if (firstInvalid) firstInvalid.focus();
      return;
    }

    status.textContent = dict["form.ok"];
    status.className = "form-status ok";

    var subject = encodeURIComponent("Zapytanie ze strony — " + name);
    var body = encodeURIComponent(
      message + "\n\n---\n" + name + "\n" + contact
    );
    window.location.href = "mailto:twojprawnik.lodz@gmail.com?subject=" + subject + "&body=" + body;
  });

  /* ---------- Rok w stopce ---------- */
  var year = document.getElementById("year");
  if (year) year.textContent = String(new Date().getFullYear());
})();
