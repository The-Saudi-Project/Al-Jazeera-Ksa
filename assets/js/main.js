/*==========================================================
  Al Jazeera Service Contracting Co. — Main Script

  Vanilla JavaScript only. Every feature is written to be
  optional: if the element it targets is not on the page, the
  initialiser exits quietly. That keeps a single shared script
  safe to load on all seven pages.

  CONTENTS
  01. Bootstrapping
  02. Sticky Navigation
  03. Active Nav Link
  04. Mobile Menu Behaviour
  05. Animated Counters
  06. Project Filtering
  07. Form Validation
  08. Scroll To Top
  09. Footer Year
  10. AOS Initialisation
  11. Scroll Progress Bar
  12. Client Marquee Controls
==========================================================*/

(function () {
  "use strict";

  /* Respecting the OS motion preference is checked once and
     reused; several features degrade rather than animate. */
  var prefersReducedMotion = window.matchMedia(
    "(prefers-reduced-motion: reduce)"
  ).matches;

  // ==========================================================
  // 01. BOOTSTRAPPING
  // A single DOMContentLoaded listener runs every initialiser,
  // so the script stays cheap and the order stays explicit.
  // ==========================================================
  document.addEventListener("DOMContentLoaded", function () {
    initStickyNav();
    initActiveNavLink();
    initMobileMenu();
    initCounters();
    initProjectFilter();
    initFormValidation();
    initScrollTopButton();
    initScrollProgress();
    initFooterYear();
    initMarquee();
    initAos();
  });

  // ==========================================================
  // 02. STICKY NAVIGATION
  // Two header modes are supported:
  //
  //   Overlay  (home page) — the header sits ON the hero and is
  //            already out of document flow, so it only has to
  //            switch to fixed + solid once the hero is passed.
  //            No spacer is needed; nothing can shift.
  //
  //   Standard (inner pages) — the header is in normal flow, so
  //            going fixed removes its height from the page and
  //            a spacer must replace it or the content jumps up.
  // ==========================================================
  function initStickyNav() {
    var overlayHeader = document.querySelector(".ajs-header--overlay");
    if (overlayHeader) {
      initOverlayHeader(overlayHeader);
      return;
    }

    var navbar = document.querySelector(".ajs-navbar");
    if (!navbar) return;

    var spacer = document.createElement("div");
    spacer.setAttribute("aria-hidden", "true");
    spacer.style.display = "none";
    navbar.parentNode.insertBefore(spacer, navbar.nextSibling);

    /* Trigger point is the navbar's natural offset from the top
       of the document, recalculated on resize because the top
       bar's height changes between breakpoints. */
    var triggerPoint = 0;

    function measure() {
      var wasStuck = navbar.classList.contains("is-stuck");
      if (wasStuck) navbar.classList.remove("is-stuck");
      triggerPoint = navbar.getBoundingClientRect().top + window.pageYOffset;
      spacer.style.height = navbar.offsetHeight + "px";
      if (wasStuck) navbar.classList.add("is-stuck");
    }

    function onScroll() {
      var shouldStick = window.pageYOffset > triggerPoint;
      navbar.classList.toggle("is-stuck", shouldStick);
      spacer.style.display = shouldStick ? "block" : "none";
    }

    measure();
    onScroll();

    /* Scroll fires very frequently; the work is deferred to the
       next animation frame so layout is read at most once per
       painted frame. */
    var ticking = false;
    window.addEventListener(
      "scroll",
      function () {
        if (ticking) return;
        ticking = true;
        window.requestAnimationFrame(function () {
          onScroll();
          ticking = false;
        });
      },
      { passive: true }
    );

    window.addEventListener("resize", debounce(function () {
      measure();
      onScroll();
    }, 200));
  }

  /**
   * Overlay header (home page).
   * Swaps the transparent-over-hero header for the solid fixed bar
   * once the visitor scrolls past the utility bar. The threshold is
   * deliberately small — waiting for the whole hero would leave the
   * header transparent over white content for a moment.
   */
  function initOverlayHeader(header) {
    var threshold = 90;

    function onScroll() {
      header.classList.toggle("is-stuck", window.pageYOffset > threshold);
    }

    onScroll();

    var ticking = false;
    window.addEventListener(
      "scroll",
      function () {
        if (ticking) return;
        ticking = true;
        window.requestAnimationFrame(function () {
          onScroll();
          ticking = false;
        });
      },
      { passive: true }
    );
  }

  // ==========================================================
  // 03. ACTIVE NAV LINK
  // Marking the current page is done in script rather than by
  // hand-editing each HTML file, which removes a whole class of
  // copy-paste mistakes when pages are added later.
  // ==========================================================
  function initActiveNavLink() {
    /* Covers both the desktop bar and the offcanvas panel, which on
       the home page holds a second copy of the same links. */
    var links = document.querySelectorAll(".ajs-navbar .nav-link, .ajs-offcanvas .nav-link");
    if (!links.length) return;

    /* Treat a bare directory URL as index.html so the home link
       highlights correctly whether the URL ends in "/" or not. */
    var current = window.location.pathname.split("/").pop() || "index.html";

    Array.prototype.forEach.call(links, function (link) {
      var target = link.getAttribute("href");
      if (!target) return;

      var isMatch = target.split("/").pop() === current;
      link.classList.toggle("active", isMatch);

      if (isMatch) {
        link.setAttribute("aria-current", "page");
      } else {
        link.removeAttribute("aria-current");
      }
    });
  }

  // ==========================================================
  // 04. MOBILE MENU BEHAVIOUR
  // Closes the menu after a link is tapped, so the panel never
  // covers the content the visitor just navigated to.
  //
  // Handles both markup styles: the offcanvas panel used on the
  // home page and the inline collapse used on inner pages.
  // Bootstrap already handles Escape and focus return for the
  // offcanvas, so that is only implemented for the collapse.
  // ==========================================================
  function initMobileMenu() {
    var offcanvasEl = document.getElementById("ajsMenu");
    if (offcanvasEl) {
      offcanvasEl.addEventListener("click", function (event) {
        if (!event.target.closest(".nav-link, .btn")) return;
        if (!window.bootstrap || !window.bootstrap.Offcanvas) return;
        window.bootstrap.Offcanvas.getOrCreateInstance(offcanvasEl).hide();
      });
      return;
    }

    var collapseEl = document.getElementById("ajsNav");
    var toggler = document.querySelector(".ajs-toggler");
    if (!collapseEl || !toggler) return;

    function closeMenu() {
      if (!collapseEl.classList.contains("show")) return;
      /* Reuse Bootstrap's own instance when available so the
         toggler's aria-expanded state stays in sync. */
      if (window.bootstrap && window.bootstrap.Collapse) {
        var instance = window.bootstrap.Collapse.getOrCreateInstance(collapseEl, {
          toggle: false
        });
        instance.hide();
      } else {
        collapseEl.classList.remove("show");
        toggler.setAttribute("aria-expanded", "false");
      }
    }

    collapseEl.addEventListener("click", function (event) {
      if (event.target.closest(".nav-link, .btn")) closeMenu();
    });

    document.addEventListener("keydown", function (event) {
      if (event.key !== "Escape") return;
      if (!collapseEl.classList.contains("show")) return;
      closeMenu();
      toggler.focus(); // Return focus to the control that opened it.
    });
  }

  // ==========================================================
  // 05. ANIMATED COUNTERS
  // Statistics only count up once they are actually on screen —
  // animating them while off-screen wastes the effect entirely.
  // ==========================================================
  function initCounters() {
    var counters = document.querySelectorAll("[data-count-to]");
    if (!counters.length) return;

    /* Without IntersectionObserver support (or with reduced
       motion requested) the final values are written straight
       away, so the information is never lost. */
    if (!("IntersectionObserver" in window) || prefersReducedMotion) {
      Array.prototype.forEach.call(counters, function (el) {
        el.textContent = formatNumber(Number(el.getAttribute("data-count-to")));
      });
      return;
    }

    var observer = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (!entry.isIntersecting) return;
          animateCounter(entry.target);
          observer.unobserve(entry.target); // Run once per element.
        });
      },
      { threshold: 0.4 }
    );

    Array.prototype.forEach.call(counters, function (el) {
      el.textContent = "0";
      observer.observe(el);
    });
  }

  /**
   * Counts an element from 0 to its data-count-to value.
   * Uses requestAnimationFrame with an ease-out curve so the
   * number decelerates as it lands, which reads as deliberate
   * rather than mechanical.
   */
  function animateCounter(el) {
    var target = Number(el.getAttribute("data-count-to")) || 0;
    var duration = Number(el.getAttribute("data-count-duration")) || 1800;
    var start = null;

    function step(timestamp) {
      if (start === null) start = timestamp;
      var progress = Math.min((timestamp - start) / duration, 1);
      var eased = 1 - Math.pow(1 - progress, 3); // easeOutCubic
      el.textContent = formatNumber(Math.floor(eased * target));
      if (progress < 1) {
        window.requestAnimationFrame(step);
      } else {
        el.textContent = formatNumber(target); // Guarantee an exact landing.
      }
    }

    window.requestAnimationFrame(step);
  }

  /**
   * Adds thousands separators. Large figures such as workforce
   * counts are far easier to read as "1,200" than "1200".
   */
  function formatNumber(value) {
    return value.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  }

  // ==========================================================
  // 06. PROJECT FILTERING
  // Category filter on the projects page. Filtering is done by
  // toggling a class rather than removing nodes, so the DOM (and
  // anything indexing it) stays intact.
  // ==========================================================
  function initProjectFilter() {
    var filterBar = document.querySelector("[data-filter-bar]");
    if (!filterBar) return;

    var buttons = filterBar.querySelectorAll(".ajs-filter-btn");
    var items = document.querySelectorAll("[data-category]");
    var emptyState = document.querySelector("[data-filter-empty]");

    filterBar.addEventListener("click", function (event) {
      var button = event.target.closest(".ajs-filter-btn");
      if (!button) return;

      var filter = button.getAttribute("data-filter");
      var visibleCount = 0;

      Array.prototype.forEach.call(buttons, function (btn) {
        var isActive = btn === button;
        btn.classList.toggle("is-active", isActive);
        btn.setAttribute("aria-pressed", isActive ? "true" : "false");
      });

      Array.prototype.forEach.call(items, function (item) {
        var categories = item.getAttribute("data-category") || "";
        var isVisible = filter === "all" || categories.split(" ").indexOf(filter) !== -1;
        item.classList.toggle("ajs-filter-hidden", !isVisible);
        if (isVisible) visibleCount++;
      });

      if (emptyState) {
        emptyState.classList.toggle("d-none", visibleCount > 0);
      }
    });
  }

  // ==========================================================
  // 07. FORM SUBMISSION
  // Forms POST to Formspree over fetch rather than a native submit,
  // so the visitor stays on the page and gets an inline result
  // instead of being redirected to a third-party thank-you screen.
  //
  // Both outcomes are reported. The previous version showed a
  // confirmation on any valid submit, which would have told someone
  // their enquiry had been received even if it never sent.
  // ==========================================================

  /* Attachment limits. Formspree accepts the upload; these are the
     limits we advertise on the form, enforced before the request so
     the visitor gets an instant, specific message rather than a
     generic failure after a long upload. */
  var MAX_UPLOAD_BYTES = 5 * 1024 * 1024; // 5 MB
  var ALLOWED_UPLOAD_TYPES = [".pdf", ".doc", ".docx", ".jpg", ".jpeg", ".png"];

  /* Phone length bounds, counted in digits only so formatting the
     visitor types — spaces, brackets, hyphens — never counts against
     them. 15 is the international maximum defined by E.164; 9 is the
     shortest a Saudi number can be without a country code. */
  var PHONE_MIN_DIGITS = 9;
  var PHONE_MAX_DIGITS = 15;

  /**
   * Finds the result panel for a form.
   *
   * The panel sits INSIDE the newsletter forms but ABOVE the form
   * element on the contact, careers and homepage forms. Looking only
   * inside the form therefore found nothing on exactly the three
   * forms that matter, and no result was ever shown for them.
   * Falls back to the surrounding panel, scoped so it cannot pick up
   * a different form's status box.
   */
  function getStatusPanel(form) {
    var inside = form.querySelector("[data-form-status]");
    if (inside) return inside;

    var scope = form.closest(".ajs-form-panel") || form.parentElement;
    return scope ? scope.querySelector("[data-form-status]") : null;
  }

  /**
   * Validates every phone field by digit count.
   *
   * The HTML pattern attribute constrains the allowed characters,
   * but cannot count digits while also permitting spaces and
   * brackets — so the precise check lives here. Returns an error
   * string, or null when everything passes.
   */
  function validatePhones(form) {
    var inputs = form.querySelectorAll('input[type="tel"]');
    var error = null;

    Array.prototype.forEach.call(inputs, function (input) {
      if (error || !input.value.trim()) return;

      var digits = input.value.replace(/\D/g, "").length;

      if (digits < PHONE_MIN_DIGITS || digits > PHONE_MAX_DIGITS) {
        error = "Please enter a valid phone number — it should contain " +
                PHONE_MIN_DIGITS + " to " + PHONE_MAX_DIGITS +
                " digits. Example: +966 13 842 2350";
        /* Mark the field so it turns red alongside the message. */
        input.setCustomValidity(error);
        input.reportValidity();
      } else {
        input.setCustomValidity("");
      }
    });

    return error;
  }

  function initFormValidation() {
    var forms = document.querySelectorAll("[data-validate]");
    if (!forms.length) return;

    Array.prototype.forEach.call(forms, function (form) {
      /* The success wording is authored per form in the markup.
         Stash it before anything can overwrite it, so a retry after
         a failure restores the right message rather than leaving the
         error text in a green panel. */
      var panel = getStatusPanel(form);
      var successText = panel ? panel.querySelector("span") : null;
      if (successText && !panel.getAttribute("data-success-text")) {
        panel.setAttribute("data-success-text", successText.textContent.trim());
      }

      form.addEventListener("submit", function (event) {
        event.preventDefault();
        event.stopPropagation();

        /* Honeypot. Formspree discards these server-side too, but
           bailing here saves the request entirely. */
        var trap = form.querySelector('input[name="_gotcha"]');
        if (trap && trap.value) return;

        /* Clear any stale custom message before re-checking, or a
           corrected field would stay marked invalid. */
        Array.prototype.forEach.call(
          form.querySelectorAll('input[type="tel"]'),
          function (i) { i.setCustomValidity(""); }
        );

        if (!form.checkValidity()) {
          form.classList.add("was-validated");
          var firstInvalid = form.querySelector(":invalid");
          if (firstInvalid) firstInvalid.focus();
          return;
        }

        var phoneError = validatePhones(form);
        if (phoneError) {
          form.classList.add("was-validated");
          return;
        }

        var uploadError = validateUploads(form);
        if (uploadError) {
          showFormStatus(form, "error", uploadError);
          return;
        }

        form.classList.remove("was-validated");
        sendForm(form);
      });
    });
  }

  /**
   * Checks every file input in a form against the size and type
   * limits. Returns an error string, or null when everything passes.
   */
  function validateUploads(form) {
    var inputs = form.querySelectorAll('input[type="file"]');
    var error = null;

    Array.prototype.forEach.call(inputs, function (input) {
      if (error || !input.files) return;

      Array.prototype.forEach.call(input.files, function (file) {
        if (error) return;

        if (file.size > MAX_UPLOAD_BYTES) {
          var mb = (file.size / 1024 / 1024).toFixed(1);
          error = "“" + file.name + "” is " + mb +
                  " MB. Please attach a file of 5 MB or less.";
          return;
        }

        var dot = file.name.lastIndexOf(".");
        var ext = dot === -1 ? "" : file.name.slice(dot).toLowerCase();
        if (ALLOWED_UPLOAD_TYPES.indexOf(ext) === -1) {
          error = "“" + file.name + "” is not an accepted file type. " +
                  "Please attach a PDF, Word document or image.";
        }
      });
    });

    return error;
  }

  /**
   * Posts the form to its action URL and reports the outcome.
   * FormData is used rather than JSON so file uploads are carried
   * in the same request as the text fields.
   */
  function sendForm(form) {
    var button = form.querySelector('[type="submit"]');
    var originalLabel = button ? button.innerHTML : "";

    if (button) {
      button.classList.add("is-sending");
      button.disabled = true;
      button.innerHTML = "Sending…";
    }

    function restoreButton() {
      if (!button) return;
      button.classList.remove("is-sending");
      button.disabled = false;
      button.innerHTML = originalLabel;
    }

    /* The Accept header is what makes Formspree answer with JSON
       instead of redirecting to its own hosted thank-you page. */
    fetch(form.action, {
      method: "POST",
      body: new FormData(form),
      headers: { Accept: "application/json" }
    })
      .then(function (response) {
        if (response.ok) {
          form.reset();
          showFormStatus(form, "success");
        } else {
          /* Surface Formspree's own message where it gives one —
             it names the actual problem, e.g. an upload over the
             plan's size cap. */
          return response.json().then(function (data) {
            var detail = data && data.errors && data.errors.length
              ? data.errors.map(function (e) { return e.message; }).join(" ")
              : "";
            showFormStatus(form, "error", detail);
          });
        }
      })
      .catch(function () {
        showFormStatus(form, "error",
          "We could not reach the server. Please check your connection and try again.");
      })
      .then(restoreButton);
  }

  /**
   * Shows the inline result panel above a form.
   * The success panel already exists in the markup; the error panel
   * is created on demand so every form does not have to carry one.
   */
  function showFormStatus(form, type, message) {
    var panel = getStatusPanel(form);
    if (!panel) return;

    var isError = type === "error";

    panel.classList.toggle("ajs-form-status--error", isError);
    panel.classList.toggle("ajs-form-status--success", !isError);

    var icon = panel.querySelector("i");
    if (icon) {
      icon.className = isError
        ? "bi bi-exclamation-triangle-fill"
        : "bi bi-check-circle-fill";
    }

    var text = panel.querySelector("span");
    if (text) {
      text.textContent = isError
        ? (message ||
           "Something went wrong sending your message. Please try again, or email us directly at info@aljazeeraksa.com.")
        : (panel.getAttribute("data-success-text") || text.textContent);
    }

    panel.classList.add("is-visible");
    panel.scrollIntoView({
      behavior: prefersReducedMotion ? "auto" : "smooth",
      block: "center"
    });
  }

  // ==========================================================
  // 08. SCROLL TO TOP
  // Appears after roughly one viewport of scrolling — early
  // enough to be useful, late enough not to clutter the hero.
  // ==========================================================
  function initScrollTopButton() {
    var button = document.querySelector(".ajs-to-top");
    if (!button) return;

    function toggleVisibility() {
      button.classList.toggle("is-visible", window.pageYOffset > 500);
    }

    toggleVisibility();
    window.addEventListener("scroll", toggleVisibility, { passive: true });

    button.addEventListener("click", function () {
      window.scrollTo({
        top: 0,
        behavior: prefersReducedMotion ? "auto" : "smooth"
      });
    });
  }

  // ==========================================================
  // 09. FOOTER YEAR
  // Keeps the copyright current without anyone editing seven
  // files each January.
  // ==========================================================
  function initFooterYear() {
    var targets = document.querySelectorAll("[data-current-year]");
    var year = new Date().getFullYear();
    Array.prototype.forEach.call(targets, function (el) {
      el.textContent = year;
    });
  }

  // ==========================================================
  // 10. AOS INITIALISATION
  // Scroll reveals are disabled entirely under reduced-motion
  // and on touch devices, where they delay content the visitor
  // has already scrolled to.
  // ==========================================================
  function initAos() {
    if (typeof window.AOS === "undefined") return;

    window.AOS.init({
      duration: 800,       // Within the 600-900ms house range.
      easing: "ease-out-cubic",
      once: true,          // Reveal a section once, not on every pass.
      offset: 60,
      /* Disabled only on the narrowest screens, where reveals delay
         content the visitor has already scrolled to. */
      disable: function () {
        return prefersReducedMotion || window.innerWidth < 576;
      }
    });
  }

  // ==========================================================
  // 11. SCROLL PROGRESS BAR
  // Dynamically injects a thin gold/green progress indicator at
  // the top of the viewport tracking current scroll depth.
  // ==========================================================
  function initScrollProgress() {
    var progressBar = document.createElement("div");
    progressBar.className = "ajs-scroll-progress";
    progressBar.setAttribute("aria-hidden", "true");
    document.body.appendChild(progressBar);

    function updateProgress() {
      var scrollTop = window.pageYOffset || document.documentElement.scrollTop;
      var docHeight = document.documentElement.scrollHeight - document.documentElement.clientHeight;
      var scrollPercent = docHeight > 0 ? (scrollTop / docHeight) * 100 : 0;
      progressBar.style.width = Math.min(100, Math.max(0, scrollPercent)) + "%";
    }

    updateProgress();

    var ticking = false;
    window.addEventListener("scroll", function () {
      if (ticking) return;
      ticking = true;
      window.requestAnimationFrame(function () {
        updateProgress();
        ticking = false;
      });
    }, { passive: true });
  }

  // ==========================================================
  // 12. CLIENT MARQUEE CONTROLS
  // The row auto-scrolls from a CSS keyframe by default, so it still
  // moves with JS disabled. When this initialiser runs it adds
  // .is-interactive, which switches that keyframe off and turns the
  // row into a real scroll container, then drives it from here.
  // Having a single mechanism is the whole point: the buttons, the
  // arrow keys, the trackpad and touch then all agree on where the
  // row actually is. A CSS transform and a scroll offset moving the
  // same element do not.
  // ==========================================================
  function initMarquee() {
    var wrap = document.querySelector(".ajs-marquee-wrap");
    if (!wrap) return;

    var viewport = wrap.querySelector(".ajs-marquee");
    var track = wrap.querySelector(".ajs-marquee-track");
    if (!viewport || !track) return;

    wrap.classList.add("is-interactive");

    /* A seamless loop needs the list present twice, so the track can
       move exactly one list-width and land on an identical tile.
       That duplicate is built HERE rather than written into the
       markup, because a hand-maintained second copy is a standing
       trap: the two halves drifted apart twice during this build —
       a logo swapped in one copy and not the other — and the symptom
       is a row that visibly jumps once per cycle, which reads as a
       rendering bug rather than as missing markup.

       The author now maintains ONE set of tiles. Clones are marked
       aria-hidden so screen readers still announce each client once.
       Guarded so it cannot double again on a re-init. */
    if (!track.hasAttribute("data-cloned")) {
      var originals = track.querySelectorAll(".ajs-client-chip");
      Array.prototype.forEach.call(originals, function (chip) {
        var copy = chip.cloneNode(true);
        copy.setAttribute("aria-hidden", "true");
        /* A cloned logo must not be announced a second time, and an
           alt on an aria-hidden node is inconsistent rather than
           harmful — clear it so the two agree. */
        var img = copy.querySelector("img");
        if (img) img.setAttribute("alt", "");
        track.appendChild(copy);
      });
      track.setAttribute("data-cloned", "true");
    }

    /* With the list doubled, one half-width is a full cycle. Measured
       on demand rather than cached: web fonts and lazily-loaded logos
       both change it after first paint. */
    function halfWidth() {
      return track.scrollWidth / 2;
    }

    /* RTL scroll offsets run negative in spec-compliant engines.
       Folding that into a sign keeps the wrap maths below written in
       plain "distance travelled" terms in both directions. */
    var sign = document.documentElement.getAttribute("dir") === "rtl" ? -1 : 1;

    function position() {
      return viewport.scrollLeft * sign;
    }

    function setPosition(px) {
      viewport.scrollLeft = px * sign;
    }

    /* Once past the first copy, jump back by exactly one half-width.
       Both halves hold identical tiles, so the jump is invisible. */
    function wrapAround() {
      var half = halfWidth();
      if (half <= 0) return;
      var x = position();
      if (x >= half) setPosition(x - half);
      else if (x < 0) setPosition(x + half);
    }

    var AUTO_SPEED = 0.5;
    var RESUME_DELAY = 2500;
    var paused = false;
    var resumeTimer = null;

    function pause() {
      paused = true;
      if (resumeTimer) window.clearTimeout(resumeTimer);
    }

    function resumeLater() {
      if (resumeTimer) window.clearTimeout(resumeTimer);
      resumeTimer = window.setTimeout(function () {
        paused = false;
      }, RESUME_DELAY);
    }

    function tick() {
      if (!paused) {
        setPosition(position() + AUTO_SPEED);
        wrapAround();
      }
      window.requestAnimationFrame(tick);
    }

    /* One tile per press. The distance is measured off a real tile
       rather than hardcoded, so it stays correct if the tile size or
       its trailing margin is ever retuned in the stylesheet. */
    function step(direction) {
      var tile = track.querySelector(".ajs-client-chip");
      if (!tile) return;
      var gap = parseFloat(window.getComputedStyle(tile).marginRight) || 0;
      var distance = tile.getBoundingClientRect().width + gap;

      pause();
      /* Normalise first, so a press near the end of the first copy
         always has runway and cannot hit the scroll limit and stall. */
      wrapAround();
      viewport.scrollBy({
        left: direction * distance * sign,
        behavior: prefersReducedMotion ? "auto" : "smooth"
      });
      resumeLater();
    }

    var prevBtn = wrap.querySelector(".ajs-marquee-btn--prev");
    var nextBtn = wrap.querySelector(".ajs-marquee-btn--next");

    if (prevBtn) {
      prevBtn.addEventListener("click", function () { step(-1); });
    }
    if (nextBtn) {
      nextBtn.addEventListener("click", function () { step(1); });
    }

    viewport.addEventListener("keydown", function (event) {
      if (event.key === "ArrowLeft") {
        event.preventDefault();
        step(-1);
      } else if (event.key === "ArrowRight") {
        event.preventDefault();
        step(1);
      }
    });

    /* Hovering or tabbing into the row means someone is reading it. */
    wrap.addEventListener("mouseenter", pause);
    wrap.addEventListener("mouseleave", resumeLater);
    wrap.addEventListener("focusin", pause);
    wrap.addEventListener("focusout", resumeLater);

    /* Trackpad and touch scrolling count as taking over too. Passive:
       neither listener calls preventDefault. */
    viewport.addEventListener("wheel", function () {
      pause();
      resumeLater();
    }, { passive: true });
    viewport.addEventListener("touchstart", pause, { passive: true });
    viewport.addEventListener("touchend", resumeLater, { passive: true });

    /* Under reduced motion the row never moves by itself. The buttons
       and arrow keys still work, so every client stays reachable —
       stopping the loop must not cost access to the content. */
    if (!prefersReducedMotion) {
      window.requestAnimationFrame(tick);
    }
  }

  // ==========================================================
  // UTILITY: debounce
  // Delays a callback until events stop firing, used for resize
  // handlers that trigger layout measurement.
  // ==========================================================
  function debounce(fn, wait) {
    var timeout;
    return function () {
      var context = this;
      var args = arguments;
      clearTimeout(timeout);
      timeout = setTimeout(function () {
        fn.apply(context, args);
      }, wait);
    };
  }
})();

