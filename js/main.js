/* ============================================================
   TWÓJ PRAWNIK — logika strony
   Wersje językowe to osobne statyczne podstrony (/, /ua/, /en/, /de/)
   generowane przez build.py — ten plik nie podmienia treści.
   1. Język: zapamiętanie wyboru + dropdown
   2. Header: stan po przewinięciu, menu mobilne, parallax hero
   3. Animacje: scroll reveal (IntersectionObserver)
   4. Formularz: fetch do backendu (FORM_ENDPOINT) lub mailto
   ============================================================ */

(function () {
  "use strict";

  /* Adres backendu formularza (np. https://formspree.io/f/XXXXXXX).
     Pusty = formularz otwiera program pocztowy (mailto). */
  var FORM_ENDPOINT = "";

  var PAGE_LANG = (document.documentElement.lang || "pl").slice(0, 2);

  var MSG = {
    pl: { err: "Uzupełnij wszystkie pola formularza.", sending: "Wysyłanie…", sent: "Dziękujemy! Wiadomość została wysłana — odpowiemy wkrótce.", fail: "Nie udało się wysłać wiadomości. Zadzwoń: +48 538 369 314.", mailto: "Otwieramy Twój program pocztowy…" },
    uk: { err: "Заповни всі поля форми.", sending: "Надсилання…", sent: "Дякуємо! Повідомлення надіслано — незабаром відповімо.", fail: "Не вдалося надіслати. Зателефонуй: +48 538 369 314.", mailto: "Відкриваємо твою поштову програму…" },
    en: { err: "Please fill in all form fields.", sending: "Sending…", sent: "Thank you! Your message has been sent — we'll reply soon.", fail: "Sending failed. Call us: +48 538 369 314.", mailto: "Opening your e-mail app…" },
    de: { err: "Bitte füllen Sie alle Felder aus.", sending: "Wird gesendet…", sent: "Vielen Dank! Ihre Nachricht wurde gesendet — wir melden uns bald.", fail: "Senden fehlgeschlagen. Rufen Sie an: +48 538 369 314.", mailto: "Ihr E-Mail-Programm wird geöffnet…" }
  };
  var msg = MSG[PAGE_LANG] || MSG.pl;

  /* ---------- 1. Język ---------- */

  /* zapamiętaj język bieżącej podstrony (dla auto-przekierowania na "/") */
  try { localStorage.setItem("tp-lang", PAGE_LANG); } catch (e) { /* tryb prywatny */ }

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

  /* przed nawigacją zapisz wybrany język, żeby "/" nie przekierowało z powrotem */
  langMenu.addEventListener("click", function (e) {
    var link = e.target.closest("[data-lang]");
    if (!link) return;
    try { localStorage.setItem("tp-lang", link.getAttribute("data-lang")); } catch (err) { /* ignoruj */ }
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

  var reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* Delikatny parallax tła hero */
  var heroBg = document.querySelector(".hero-bg");
  if (heroBg && !reduceMotion) {
    var ticking = false;
    window.addEventListener("scroll", function () {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(function () {
        var y = window.scrollY;
        if (y < window.innerHeight * 1.2) {
          heroBg.style.transform = "translate3d(0," + (y * 0.18).toFixed(1) + "px,0)";
        }
        ticking = false;
      });
    }, { passive: true });
  }

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

  /* ---------- 4. Formularz ---------- */

  var form = document.getElementById("contactForm");
  var status = document.getElementById("formStatus");
  var submitBtn = form.querySelector('button[type="submit"]');

  function setStatus(text, cls) {
    status.textContent = text;
    status.className = "form-status" + (cls ? " " + cls : "");
  }

  form.addEventListener("submit", function (e) {
    e.preventDefault();

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
      setStatus(msg.err, "error");
      var firstInvalid = form.querySelector(".invalid");
      if (firstInvalid) firstInvalid.focus();
      return;
    }

    if (FORM_ENDPOINT) {
      submitBtn.disabled = true;
      setStatus(msg.sending, "");
      fetch(FORM_ENDPOINT, {
        method: "POST",
        headers: { "Content-Type": "application/json", "Accept": "application/json" },
        body: JSON.stringify({ name: name, contact: contact, message: message, lang: PAGE_LANG })
      }).then(function (res) {
        if (!res.ok) throw new Error(String(res.status));
        setStatus(msg.sent, "ok");
        form.reset();
      }).catch(function () {
        setStatus(msg.fail, "error");
      }).finally(function () {
        submitBtn.disabled = false;
      });
      return;
    }

    /* fallback: mailto */
    setStatus(msg.mailto, "ok");
    var subject = encodeURIComponent("Zapytanie ze strony — " + name);
    var body = encodeURIComponent(message + "\n\n---\n" + name + "\n" + contact);
    window.location.href = "mailto:twojprawnik.lodz@gmail.com?subject=" + subject + "&body=" + body;
  });

  /* ---------- Rok w stopce ---------- */
  var year = document.getElementById("year");
  if (year) year.textContent = String(new Date().getFullYear());
})();
