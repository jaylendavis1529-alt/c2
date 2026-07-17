/* ============================================================
   QuickShine Auto — script.js
   Header, mobile nav, reveal-on-scroll, counters, tilt,
   parallax, cookie consent (Google Consent Mode v2), form UX
   ============================================================ */
(function () {
  "use strict";

  var prefersReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ---------- Sticky header ---------- */
  var header = document.querySelector(".site-header");
  function onScrollHeader() {
    if (!header) return;
    header.classList.toggle("scrolled", window.scrollY > 24);
  }
  window.addEventListener("scroll", onScrollHeader, { passive: true });
  onScrollHeader();

  /* ---------- Mobile nav ---------- */
  var toggle = document.querySelector(".nav-toggle");
  var nav = document.querySelector(".main-nav");
  if (toggle && nav) {
    toggle.addEventListener("click", function () {
      var open = nav.classList.toggle("open");
      toggle.setAttribute("aria-expanded", open ? "true" : "false");
    });
    nav.querySelectorAll("a").forEach(function (a) {
      a.addEventListener("click", function () {
        nav.classList.remove("open");
        toggle.setAttribute("aria-expanded", "false");
      });
    });
  }

  /* ---------- Reveal on scroll ---------- */
  var revealEls = document.querySelectorAll(".reveal");
  if ("IntersectionObserver" in window && !prefersReduced) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting) {
          e.target.classList.add("in");
          io.unobserve(e.target);
        }
      });
    }, { threshold: 0.14, rootMargin: "0px 0px -40px 0px" });
    revealEls.forEach(function (el) { io.observe(el); });
  } else {
    revealEls.forEach(function (el) { el.classList.add("in"); });
  }

  /* ---------- Counters ---------- */
  function animateCounter(el) {
    var target = parseFloat(el.getAttribute("data-count") || "0");
    var suffix = el.getAttribute("data-suffix") || "";
    var dur = 1600;
    var start = null;
    function tick(ts) {
      if (!start) start = ts;
      var p = Math.min((ts - start) / dur, 1);
      var eased = 1 - Math.pow(1 - p, 3);
      var val = target * eased;
      el.textContent = (target % 1 === 0 ? Math.round(val) : val.toFixed(1)) + suffix;
      if (p < 1) requestAnimationFrame(tick);
    }
    if (prefersReduced) {
      el.textContent = target + suffix;
    } else {
      requestAnimationFrame(tick);
    }
  }
  var counters = document.querySelectorAll("[data-count]");
  if (counters.length && "IntersectionObserver" in window) {
    var cio = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting) {
          animateCounter(e.target);
          cio.unobserve(e.target);
        }
      });
    }, { threshold: 0.5 });
    counters.forEach(function (el) { cio.observe(el); });
  }

  /* ---------- Card tilt (desktop, pointer-fine only) ---------- */
  if (!prefersReduced && window.matchMedia("(pointer: fine)").matches) {
    document.querySelectorAll("[data-tilt]").forEach(function (card) {
      card.addEventListener("mousemove", function (ev) {
        var r = card.getBoundingClientRect();
        var x = (ev.clientX - r.left) / r.width - 0.5;
        var y = (ev.clientY - r.top) / r.height - 0.5;
        card.style.transform =
          "translateY(-6px) rotateX(" + (-y * 5) + "deg) rotateY(" + (x * 5) + "deg)";
      });
      card.addEventListener("mouseleave", function () {
        card.style.transform = "";
      });
    });
  }

  /* ---------- Subtle hero parallax ---------- */
  var heroImg = document.querySelector(".hero-media img");
  if (heroImg && !prefersReduced) {
    window.addEventListener("scroll", function () {
      var y = window.scrollY;
      if (y < window.innerHeight) {
        heroImg.style.translate = "0 " + y * 0.12 + "px";
      }
    }, { passive: true });
  }

  /* ---------- Back to top ---------- */
  var toTop = document.querySelector(".to-top");
  if (toTop) {
    window.addEventListener("scroll", function () {
      toTop.classList.toggle("show", window.scrollY > 600);
    }, { passive: true });
    toTop.addEventListener("click", function () {
      window.scrollTo({ top: 0, behavior: prefersReduced ? "auto" : "smooth" });
    });
  }

  /* ---------- Contact form (validate on blur) ---------- */
  var form = document.getElementById("quote-form");
  if (form) {
    function validateField(field) {
      var input = field.querySelector("input, textarea, select");
      if (!input) return true;
      var ok = input.checkValidity();
      field.classList.toggle("invalid", !ok);
      return ok;
    }
    form.querySelectorAll(".field").forEach(function (field) {
      var input = field.querySelector("input, textarea, select");
      if (input) {
        input.addEventListener("blur", function () { validateField(field); });
        input.addEventListener("input", function () {
          if (field.classList.contains("invalid")) validateField(field);
        });
      }
    });
    form.addEventListener("submit", function (e) {
      e.preventDefault();
      var allOk = true;
      form.querySelectorAll(".field").forEach(function (field) {
        if (!validateField(field)) allOk = false;
      });
      if (!allOk) return;
      var success = form.querySelector(".form-success");
      if (success) success.style.display = "block";
      form.querySelectorAll("input, textarea, select, button").forEach(function (el) {
        el.disabled = true;
      });
      if (typeof gtag === "function") {
        gtag("event", "generate_lead", { form_id: "quote-form" });
      }
    });
  }

  /* ---------- Cookie consent (Google Consent Mode v2) ---------- */
  var CONSENT_KEY = "qsa_cookie_consent";
  var banner = document.querySelector(".cookie-banner");

  function applyConsent(granted) {
    if (typeof gtag === "function") {
      gtag("consent", "update", {
        analytics_storage: granted ? "granted" : "denied",
        ad_storage: granted ? "granted" : "denied",
        ad_user_data: granted ? "granted" : "denied",
        ad_personalization: granted ? "granted" : "denied"
      });
    }
  }

  var stored = null;
  try { stored = localStorage.getItem(CONSENT_KEY); } catch (e) {}

  if (stored === "all") {
    applyConsent(true);
  } else if (stored === "necessary") {
    applyConsent(false);
  } else if (banner) {
    setTimeout(function () { banner.classList.add("show"); }, 1200);
  }

  if (banner) {
    var acceptBtn = banner.querySelector("[data-consent='all']");
    var necessaryBtn = banner.querySelector("[data-consent='necessary']");
    function choose(value) {
      try { localStorage.setItem(CONSENT_KEY, value); } catch (e) {}
      applyConsent(value === "all");
      banner.classList.remove("show");
    }
    if (acceptBtn) acceptBtn.addEventListener("click", function () { choose("all"); });
    if (necessaryBtn) necessaryBtn.addEventListener("click", function () { choose("necessary"); });
  }

  /* ---------- Footer year ---------- */
  var yearEl = document.getElementById("year");
  if (yearEl) yearEl.textContent = new Date().getFullYear();
})();
