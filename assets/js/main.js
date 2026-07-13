/* Site orchestration: wire navigation, scroll-spy, scroll-reveal, and the
   BibTeX copy button. Mirrors the TerraZero site's behavior, trimmed to the
   features this page uses. */
(function () {
  "use strict";

  // ---- navigation ----------------------------------------------------------
  function initNav() {
    var toggle = document.querySelector(".nav-toggle");
    var nav = document.getElementById("nav");
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

    // scroll-spy
    var links = Array.prototype.slice.call(document.querySelectorAll("#nav a"));
    var map = {};
    links.forEach(function (a) {
      var id = a.getAttribute("href").slice(1);
      var sec = document.getElementById(id);
      if (sec) map[id] = a;
    });
    var sections = Object.keys(map).map(function (id) { return document.getElementById(id); });
    if (!("IntersectionObserver" in window) || !sections.length) return;
    var obs = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting) {
          links.forEach(function (l) { l.classList.remove("active"); });
          var a = map[e.target.id];
          if (a) a.classList.add("active");
        }
      });
    }, { rootMargin: "-45% 0px -50% 0px", threshold: 0 });
    sections.forEach(function (s) { obs.observe(s); });
  }

  // ---- scroll reveal -------------------------------------------------------
  function initReveal() {
    var items = document.querySelectorAll(".reveal");
    if (!("IntersectionObserver" in window)) {
      items.forEach(function (i) { i.classList.add("in"); });
      return;
    }
    var obs = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting) { e.target.classList.add("in"); obs.unobserve(e.target); }
      });
    }, { rootMargin: "0px 0px -10% 0px", threshold: 0.05 });
    items.forEach(function (i) { obs.observe(i); });
  }

  // ---- BibTeX copy ---------------------------------------------------------
  function initBibtexCopy() {
    var btn = document.querySelector(".bibtex .copy-btn");
    if (!btn) return;
    var pre = document.querySelector(".bibtex pre");
    if (!pre) return;
    btn.addEventListener("click", function () {
      var text = pre.innerText;
      var done = function () {
        var label = btn.getAttribute("data-label") || btn.textContent;
        btn.setAttribute("data-label", label);
        btn.textContent = "Copied";
        setTimeout(function () { btn.textContent = label; }, 1500);
      };
      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(text).then(done).catch(function () {});
      } else {
        var sel = window.getSelection();
        var range = document.createRange();
        range.selectNodeContents(pre);
        sel.removeAllRanges();
        sel.addRange(range);
        try { document.execCommand("copy"); done(); } catch (e) { /* ignore */ }
        sel.removeAllRanges();
      }
    });
  }

  // ---- integrations showcase -----------------------------------------------
  // A flat tablist: clicking a tab activates it, reveals its panel, hides the
  // others, and pauses the off-screen videos so only the visible one plays.
  // Left/right arrows move focus and selection between tabs.
  function initIntegrations() {
    var root = document.getElementById("integrations-widget");
    if (!root) return;
    var tabs = Array.prototype.slice.call(root.querySelectorAll(".intg-tab"));
    if (!tabs.length) return;
    var slider = root.querySelector(".intg-slider");
    var current = 0;
    // videos hold off until the widget is scrolled into view (no autoplay attr)
    var inView = false;

    // slide the thumb behind the active tab, matching its size and position
    function moveSlider(idx) {
      if (!slider) return;
      var tab = tabs[idx];
      slider.style.width = tab.offsetWidth + "px";
      slider.style.height = tab.offsetHeight + "px";
      slider.style.transform = "translate(" + tab.offsetLeft + "px," + tab.offsetTop + "px)";
    }

    // a panel may hold several videos (e.g. the SPACeR 3-up comparison); play
    // only the active panel's videos, and only while the widget is on screen.
    function syncVideos() {
      tabs.forEach(function (tab, i) {
        var panel = document.getElementById(tab.getAttribute("aria-controls"));
        if (!panel) return;
        panel.querySelectorAll("video").forEach(function (video) {
          if (i === current && inView) {
            var p = video.play(); if (p && p.catch) p.catch(function () {});
          } else {
            video.pause();
          }
        });
      });
    }

    function select(idx) {
      current = idx;
      tabs.forEach(function (tab, i) {
        var active = i === idx;
        tab.classList.toggle("is-active", active);
        tab.setAttribute("aria-selected", active ? "true" : "false");
        tab.tabIndex = active ? 0 : -1;
        var panel = document.getElementById(tab.getAttribute("aria-controls"));
        if (panel) panel.hidden = !active;
      });
      syncVideos();
      moveSlider(idx);
    }

    tabs.forEach(function (tab, i) {
      tab.addEventListener("click", function () { select(i); });
      tab.addEventListener("keydown", function (e) {
        var dir = e.key === "ArrowRight" ? 1 : e.key === "ArrowLeft" ? -1 : 0;
        if (!dir) return;
        e.preventDefault();
        var next = (i + dir + tabs.length) % tabs.length;
        tabs[next].focus();
        select(next);
      });
    });

    // honor the markup's initial active tab (default to the first)
    var start = tabs.findIndex(function (t) { return t.classList.contains("is-active"); });
    start = start < 0 ? 0 : start;
    // place the thumb without animating in from the corner on first paint
    if (slider) slider.style.transition = "none";
    select(start);
    if (slider) {
      // force reflow, then restore the animated transition for later clicks
      void slider.offsetWidth;
      slider.style.transition = "";
    }
    // keep the thumb aligned if the layout reflows (resize, font load)
    window.addEventListener("resize", function () { moveSlider(current); });

    // gate playback on visibility: start the active video when the widget
    // scrolls into view, pause everything when it leaves
    if ("IntersectionObserver" in window) {
      var io = new IntersectionObserver(function (entries) {
        entries.forEach(function (e) { inView = e.isIntersecting; });
        syncVideos();
      }, { threshold: 0.2 });
      io.observe(root);
    } else {
      inView = true;
      syncVideos();
    }
  }

  // ---- boot ----------------------------------------------------------------
  function boot() {
    initNav();
    initReveal();
    initBibtexCopy();
    initIntegrations();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", boot);
  } else {
    boot();
  }
})();
