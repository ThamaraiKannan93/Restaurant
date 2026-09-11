/* ==========================================================================
   SAFFRON & SAGE — main.js
   Vanilla JavaScript (no libraries). Each interaction is a small, self-
   contained module, initialised at the bottom. Preferred approach: plain
   ES6 + IntersectionObserver for performant scroll work.
   Modules: header · mobileNav · scrollSpy · reveal · counters · menuFilter
            · carousel · testimonials · lightbox · reserveForm · newsletter
            · backToTop · misc
   ========================================================================== */
(function () {
  "use strict";

  const prefersReducedMotion =
    window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  const $  = (sel, ctx = document) => ctx.querySelector(sel);
  const $$ = (sel, ctx = document) => Array.from(ctx.querySelectorAll(sel));

  /* Simple, reusable scroll-lock that counts how many things want it open */
  const scrollLock = (() => {
    let count = 0;
    return {
      on()  { count++; document.body.classList.add("is-locked"); },
      off() { count = Math.max(0, count - 1); if (count === 0) document.body.classList.remove("is-locked"); }
    };
  })();

  /* ------------------------------------------------------------------ *
   * 01. Header — add a solid background once the user scrolls
   * ------------------------------------------------------------------ */
  function initHeader() {
    const header = $("[data-header]");
    if (!header) return;
    const onScroll = () => header.classList.toggle("is-scrolled", window.scrollY > 40);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
  }

  /* ------------------------------------------------------------------ *
   * 02. Mobile navigation (hamburger drawer)
   * ------------------------------------------------------------------ */
  function initMobileNav() {
    const btn     = $("[data-hamburger]");
    const nav     = $("#primaryNav");
    const overlay = $("[data-nav-overlay]");
    if (!btn || !nav) return;

    const open = () => {
      nav.classList.add("is-open");
      btn.classList.add("is-active");
      btn.setAttribute("aria-expanded", "true");
      btn.setAttribute("aria-label", "Close menu");
      if (overlay) { overlay.hidden = false; requestAnimationFrame(() => overlay.classList.add("is-visible")); }
      scrollLock.on();
    };
    const close = () => {
      nav.classList.remove("is-open");
      btn.classList.remove("is-active");
      btn.setAttribute("aria-expanded", "false");
      btn.setAttribute("aria-label", "Open menu");
      if (overlay) {
        overlay.classList.remove("is-visible");
        overlay.addEventListener("transitionend", () => { overlay.hidden = true; }, { once: true });
      }
      scrollLock.off();
    };
    const toggle = () => (nav.classList.contains("is-open") ? close() : open());

    btn.addEventListener("click", toggle);
    if (overlay) overlay.addEventListener("click", close);
    // Close after tapping any nav link (they scroll to a section)
    $$(".nav__link, [data-nav-cta]", nav).forEach((a) =>
      a.addEventListener("click", () => { if (nav.classList.contains("is-open")) close(); })
    );
    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape" && nav.classList.contains("is-open")) close();
    });
    // If resized up to desktop while open, reset state
    window.addEventListener("resize", () => {
      if (window.innerWidth >= 992 && nav.classList.contains("is-open")) close();
    });
  }

  /* ------------------------------------------------------------------ *
   * 03. Scroll-spy — highlight the nav link for the section in view
   * ------------------------------------------------------------------ */
  function initScrollSpy() {
    const links = $$(".nav__link");
    const map = new Map();
    links.forEach((link) => {
      const id = link.getAttribute("href");
      if (id && id.startsWith("#")) {
        const section = document.querySelector(id);
        if (section) map.set(section, link);
      }
    });
    if (!map.size) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            links.forEach((l) => l.classList.remove("is-active"));
            const active = map.get(entry.target);
            if (active) active.classList.add("is-active");
          }
        });
      },
      { rootMargin: "-45% 0px -50% 0px", threshold: 0 }
    );
    map.forEach((_, section) => observer.observe(section));
  }

  /* ------------------------------------------------------------------ *
   * 04. Scroll-reveal animations
   * ------------------------------------------------------------------ */
  function initReveal() {
    const items = $$("[data-reveal]");
    if (!items.length) return;
    if (prefersReducedMotion || !("IntersectionObserver" in window)) {
      items.forEach((el) => el.classList.add("is-visible"));
      return;
    }
    const observer = new IntersectionObserver(
      (entries, obs) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-visible");
            obs.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.12, rootMargin: "0px 0px -8% 0px" }
    );
    items.forEach((el) => observer.observe(el));
  }

  /* ------------------------------------------------------------------ *
   * 05. Animated counters (stats)
   * ------------------------------------------------------------------ */
  function initCounters() {
    const nums = $$("[data-count]");
    if (!nums.length) return;

    const run = (el) => {
      const target = parseInt(el.dataset.count, 10) || 0;
      if (prefersReducedMotion) { el.textContent = target; return; }
      const duration = 1400;
      const start = performance.now();
      const tick = (now) => {
        const p = Math.min((now - start) / duration, 1);
        const eased = 1 - Math.pow(1 - p, 3); // easeOutCubic
        el.textContent = Math.round(eased * target);
        if (p < 1) requestAnimationFrame(tick);
      };
      requestAnimationFrame(tick);
    };

    const observer = new IntersectionObserver(
      (entries, obs) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) { run(entry.target); obs.unobserve(entry.target); }
        });
      },
      { threshold: 0.6 }
    );
    nums.forEach((el) => observer.observe(el));
  }

  /* ------------------------------------------------------------------ *
   * 06. Menu filter
   * ------------------------------------------------------------------ */
  function initMenuFilter() {
    const buttons = $$(".filters__btn");
    const dishes  = $$("#menuGrid .dish");
    if (!buttons.length || !dishes.length) return;

    buttons.forEach((btn) => {
      btn.addEventListener("click", () => {
        buttons.forEach((b) => { b.classList.remove("is-active"); b.setAttribute("aria-pressed", "false"); });
        btn.classList.add("is-active");
        btn.setAttribute("aria-pressed", "true");

        const filter = btn.dataset.filter;
        dishes.forEach((dish) => {
          const match = filter === "all" || dish.dataset.category === filter;
          dish.classList.remove("is-enter");
          if (match) {
            dish.classList.remove("is-hidden");
            // retrigger the entrance animation
            void dish.offsetWidth;
            dish.classList.add("is-enter");
          } else {
            dish.classList.add("is-hidden");
          }
        });
      });
    });
  }

  /* ------------------------------------------------------------------ *
   * 07. Specials carousel
   * ------------------------------------------------------------------ */
  function initCarousel() {
    const root = $("[data-carousel]");
    if (!root) return;
    const track = $("[data-carousel-track]", root);
    const slides = $$(".slide", track);
    const prevBtn = $("[data-carousel-prev]", root);
    const nextBtn = $("[data-carousel-next]", root);
    const dotsWrap = $("[data-carousel-dots]", root);
    const pauseBtn = $("[data-carousel-pause]", root);
    if (slides.length < 2) return;

    let index = 0;
    let timer = null;
    let paused = false;
    const INTERVAL = 5500;

    // Build dots
    const dots = slides.map((_, i) => {
      const dot = document.createElement("button");
      dot.className = "carousel__dot" + (i === 0 ? " is-active" : "");
      dot.setAttribute("aria-label", `Go to special ${i + 1}`);
      dot.addEventListener("click", () => { goTo(i); restart(); });
      dotsWrap.appendChild(dot);
      return dot;
    });

    function goTo(i) {
      index = (i + slides.length) % slides.length;
      track.style.transform = `translateX(-${index * 100}%)`;
      dots.forEach((d, di) => d.classList.toggle("is-active", di === index));
    }
    const next = () => goTo(index + 1);
    const prev = () => goTo(index - 1);

    function start() {
      if (prefersReducedMotion || paused) return;
      stop();
      timer = setInterval(next, INTERVAL);
    }
    function stop() { if (timer) { clearInterval(timer); timer = null; } }
    function restart() { stop(); start(); }

    nextBtn.addEventListener("click", () => { next(); restart(); });
    prevBtn.addEventListener("click", () => { prev(); restart(); });

    // Manual pause / play — required for auto-rotating content (WCAG 2.2.2)
    if (pauseBtn) {
      pauseBtn.addEventListener("click", () => {
        paused = !paused;
        pauseBtn.classList.toggle("is-paused", paused);
        pauseBtn.setAttribute("aria-pressed", String(paused));
        pauseBtn.setAttribute("aria-label", paused ? "Play specials slideshow" : "Pause specials slideshow");
        if (paused) stop(); else start();
      });
    }

    // Pause on hover / focus within
    root.addEventListener("mouseenter", stop);
    root.addEventListener("mouseleave", start);
    root.addEventListener("focusin", stop);
    root.addEventListener("focusout", start);

    // Pause when the tab is hidden
    document.addEventListener("visibilitychange", () => (document.hidden ? stop() : start()));

    // Touch / swipe support
    let startX = 0, dragging = false;
    track.addEventListener("touchstart", (e) => { startX = e.touches[0].clientX; dragging = true; stop(); }, { passive: true });
    track.addEventListener("touchend", (e) => {
      if (!dragging) return;
      const dx = e.changedTouches[0].clientX - startX;
      if (Math.abs(dx) > 45) (dx < 0 ? next() : prev());
      dragging = false;
      restart();
    });

    goTo(0);
    start();
  }

  /* ------------------------------------------------------------------ *
   * 08. Testimonials (cross-fade rotator)
   * ------------------------------------------------------------------ */
  function initTestimonials() {
    const root = $("[data-quotes]");
    if (!root) return;
    const quotes = $$(".quote", root);
    const dotsWrap = $("[data-quotes-dots]", root);
    const pauseBtn = $("[data-quotes-pause]", root);
    if (quotes.length < 2) return;

    let index = 0, timer = null, paused = false;
    const dots = quotes.map((_, i) => {
      const dot = document.createElement("button");
      dot.className = "quotes__dot" + (i === 0 ? " is-active" : "");
      dot.setAttribute("aria-label", `Testimonial ${i + 1}`);
      dot.addEventListener("click", () => { show(i); restart(); });
      dotsWrap.appendChild(dot);
      return dot;
    });

    function show(i) {
      index = (i + quotes.length) % quotes.length;
      quotes.forEach((q, qi) => q.classList.toggle("is-active", qi === index));
      dots.forEach((d, di) => d.classList.toggle("is-active", di === index));
    }
    const advance = () => show(index + 1);
    function start() { if (prefersReducedMotion || paused) return; stop(); timer = setInterval(advance, 6000); }
    function stop() { if (timer) clearInterval(timer); }
    function restart() { stop(); start(); }

    root.addEventListener("mouseenter", stop);
    root.addEventListener("mouseleave", start);

    if (pauseBtn) {
      pauseBtn.addEventListener("click", () => {
        paused = !paused;
        pauseBtn.classList.toggle("is-paused", paused);
        pauseBtn.setAttribute("aria-pressed", String(paused));
        pauseBtn.setAttribute("aria-label", paused ? "Play testimonials slideshow" : "Pause testimonials slideshow");
        if (paused) stop(); else start();
      });
    }

    start();
  }

  /* ------------------------------------------------------------------ *
   * 09. Gallery lightbox modal
   * ------------------------------------------------------------------ */
  function initLightbox() {
    const items = $$("[data-gallery-item]");
    const box   = $("[data-lightbox]");
    if (!items.length || !box) return;

    const imgEl     = $("[data-lightbox-img]", box);
    const captionEl = $("[data-lightbox-caption]", box);
    const closeBtn  = $("[data-lightbox-close]", box);
    const prevBtn   = $("[data-lightbox-prev]", box);
    const nextBtn   = $("[data-lightbox-next]", box);

    const sources = items.map((btn) => ({
      full: btn.dataset.full,
      caption: btn.dataset.caption || "",
      alt: (btn.querySelector("img") || {}).alt || ""
    }));

    let current = 0;
    let lastFocused = null;

    function render(i) {
      current = (i + sources.length) % sources.length;
      const s = sources[current];
      imgEl.src = s.full;
      imgEl.alt = s.alt;
      captionEl.textContent = s.caption;
    }
    function open(i) {
      lastFocused = document.activeElement;
      render(i);
      box.hidden = false;
      requestAnimationFrame(() => box.classList.add("is-open"));
      scrollLock.on();
      closeBtn.focus();
    }
    function close() {
      box.classList.remove("is-open");
      const done = () => { box.hidden = true; box.removeEventListener("transitionend", done); };
      box.addEventListener("transitionend", done);
      scrollLock.off();
      if (lastFocused) lastFocused.focus();
    }

    items.forEach((btn, i) => btn.addEventListener("click", () => open(i)));
    closeBtn.addEventListener("click", close);
    prevBtn.addEventListener("click", () => render(current - 1));
    nextBtn.addEventListener("click", () => render(current + 1));
    // Click on the dark backdrop (but not the image) closes
    box.addEventListener("click", (e) => { if (e.target === box) close(); });

    document.addEventListener("keydown", (e) => {
      if (box.hidden) return;
      if (e.key === "Escape") close();
      else if (e.key === "ArrowRight") render(current + 1);
      else if (e.key === "ArrowLeft") render(current - 1);
      else if (e.key === "Tab") {
        // Keep focus on the lightbox's own controls
        const f = [closeBtn, prevBtn, nextBtn];
        const i = f.indexOf(document.activeElement);
        e.preventDefault();
        f[(i + (e.shiftKey ? -1 : 1) + f.length) % f.length].focus();
      }
    });
  }

  /* ------------------------------------------------------------------ *
   * 10. Reservation form — validation + confirmation modal
   * ------------------------------------------------------------------ */
  function initReserveForm() {
    const form = $("#reserveForm");
    const modal = $("#confirmModal");
    if (!form || !modal) return;

    const dialog   = $(".modal__dialog", modal);
    const confirmText = $("[data-confirm-text]", modal);
    const dateInput = $("#rDate", form);

    // No past dates
    if (dateInput) {
      const today = new Date().toISOString().split("T")[0];
      dateInput.min = today;
      dateInput.value = today;
    }

    const setError = (input, message) => {
      const field = input.closest(".field");
      const err = field ? field.querySelector(".field__error") : null;
      field && field.classList.toggle("has-error", !!message);
      input.setAttribute("aria-invalid", message ? "true" : "false");
      if (err) err.textContent = message || "";
      return !message;
    };

    const validators = {
      rName:  (v) => (v.trim().length >= 2 ? "" : "Please tell us your name."),
      rDate:  (v) => (v ? "" : "Choose a date."),
      rTime:  (v) => (v ? "" : "Choose a time."),
      rGuests:(v) => (v ? "" : "How many guests?"),
      rPhone: (v) => (/[0-9]{6,}/.test(v.replace(/\D/g, "")) ? "" : "Enter a valid phone number.")
    };

    // Live validation once a field has been touched
    Object.keys(validators).forEach((id) => {
      const input = $("#" + id, form);
      if (!input) return;
      input.addEventListener("blur", () => setError(input, validators[id](input.value)));
      input.addEventListener("input", () => {
        if (input.closest(".field").classList.contains("has-error"))
          setError(input, validators[id](input.value));
      });
    });

    // Modal helpers
    let lastFocused = null;
    const openModal = () => {
      lastFocused = document.activeElement;
      modal.hidden = false;
      requestAnimationFrame(() => modal.classList.add("is-open"));
      scrollLock.on();
      dialog.focus();
    };
    const closeModal = () => {
      modal.classList.remove("is-open");
      modal.addEventListener("transitionend", function done() { modal.hidden = true; modal.removeEventListener("transitionend", done); });
      scrollLock.off();
      if (lastFocused && lastFocused.focus) lastFocused.focus();
    };
    $$("[data-modal-close]", modal).forEach((el) => el.addEventListener("click", closeModal));
    document.addEventListener("keydown", (e) => {
      if (modal.hidden) return;
      if (e.key === "Escape") { closeModal(); return; }
      if (e.key === "Tab") {
        // Trap focus inside the dialog
        const f = $$('button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])', dialog)
          .filter((el) => !el.disabled && el.offsetParent !== null);
        if (!f.length) return;
        const first = f[0], last = f[f.length - 1];
        if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
        else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
      }
    });

    form.addEventListener("submit", (e) => {
      e.preventDefault();
      let valid = true;
      let firstInvalid = null;
      Object.keys(validators).forEach((id) => {
        const input = $("#" + id, form);
        const ok = setError(input, validators[id](input.value));
        if (!ok) { valid = false; firstInvalid = firstInvalid || input; }
      });
      if (!valid) { firstInvalid && firstInvalid.focus(); return; }

      // Build a friendly confirmation message
      const name = $("#rName", form).value.trim().split(" ")[0];
      const guests = $("#rGuests", form).value;
      const date = new Date($("#rDate", form).value + "T00:00");
      const dateStr = isNaN(date) ? $("#rDate", form).value
        : date.toLocaleDateString(undefined, { weekday: "long", month: "long", day: "numeric" });
      const time = $("#rTime", form).value;

      confirmText.innerHTML =
        `Thanks, <strong>${name}</strong> — we've pencilled in a table for ` +
        `<strong>${guests}</strong> on <strong>${dateStr}</strong> at <strong>${time}</strong>. ` +
        `We'll confirm shortly.`;

      form.reset();
      if (dateInput) dateInput.value = dateInput.min;
      openModal();
    });
  }

  /* ------------------------------------------------------------------ *
   * 11. Newsletter (footer) — lightweight inline feedback
   * ------------------------------------------------------------------ */
  function initNewsletter() {
    const form = $("#newsletterForm");
    if (!form) return;
    const msg = $("[data-newsletter-msg]");
    const input = $("#nlEmail", form);
    form.addEventListener("submit", (e) => {
      e.preventDefault();
      const valid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(input.value.trim());
      if (!valid) { if (msg) msg.textContent = "Please enter a valid email."; return; }
      if (msg) msg.textContent = "You're on the list — welcome to the table!";
      form.reset();
    });
  }

  /* ------------------------------------------------------------------ *
   * 12. Back-to-top button
   * ------------------------------------------------------------------ */
  function initBackToTop() {
    const btn = $("[data-to-top]");
    if (!btn) return;
    const onScroll = () => btn.classList.toggle("is-visible", window.scrollY > 600);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    btn.addEventListener("click", () =>
      window.scrollTo({ top: 0, behavior: prefersReducedMotion ? "auto" : "smooth" })
    );
  }

  /* ------------------------------------------------------------------ *
   * 13. Misc — dynamic footer year
   * ------------------------------------------------------------------ */
  function initMisc() {
    const yearEl = $("[data-year]");
    if (yearEl) yearEl.textContent = new Date().getFullYear();
  }

  /* ------------------------------------------------------------------ *
   * Boot
   * ------------------------------------------------------------------ */
  function init() {
    initHeader();
    initMobileNav();
    initScrollSpy();
    initReveal();
    initCounters();
    initMenuFilter();
    initCarousel();
    initTestimonials();
    initLightbox();
    initReserveForm();
    initNewsletter();
    initBackToTop();
    initMisc();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
