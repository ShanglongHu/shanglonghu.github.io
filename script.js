(() => {
  "use strict";

  const root = document.documentElement;
  const THEME_KEY = "shl_theme";
  const darkQuery = window.matchMedia("(prefers-color-scheme: dark)");

  /* ---------- Theme toggle ---------- */

  const effectiveTheme = () =>
    root.getAttribute("data-theme") || (darkQuery.matches ? "dark" : "light");

  const toggle = document.querySelector(".theme-toggle");
  const syncToggleLabel = () => {
    if (!toggle) return;
    const next = effectiveTheme() === "dark" ? "light" : "dark";
    toggle.setAttribute("aria-label", `Switch to ${next} theme`);
    toggle.setAttribute("title", `Switch to ${next} theme`);
  };

  if (toggle) {
    toggle.addEventListener("click", () => {
      const next = effectiveTheme() === "dark" ? "light" : "dark";
      root.setAttribute("data-theme", next);
      try { localStorage.setItem(THEME_KEY, next); } catch (e) { /* storage unavailable */ }
      syncToggleLabel();
    });
    darkQuery.addEventListener?.("change", syncToggleLabel);
    syncToggleLabel();
  }

  /* ---------- Top bar border once the page scrolls ---------- */

  const topbar = document.querySelector(".topbar");
  const onScroll = () => topbar?.classList.toggle("is-scrolled", window.scrollY > 8);
  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();

  /* ---------- Highlight the section being read ---------- */

  const navLinks = [...document.querySelectorAll(".topnav a[href^='#']")];
  const sections = navLinks
    .map((link) => document.querySelector(link.getAttribute("href")))
    .filter(Boolean);

  const setActive = (id) => {
    navLinks.forEach((link) => {
      const active = link.getAttribute("href") === `#${id}`;
      link.classList.toggle("is-active", active);
      if (active) link.setAttribute("aria-current", "true");
      else link.removeAttribute("aria-current");
    });
  };

  if (sections.length) {
    const updateActive = () => {
      const marker = window.innerHeight * 0.35;
      let current = sections[0].id;
      for (const section of sections) {
        if (section.getBoundingClientRect().top <= marker) current = section.id;
      }
      // At the very bottom, the last section is the one being read.
      if (window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 4) {
        current = sections[sections.length - 1].id;
      }
      setActive(current);
    };
    let ticking = false;
    window.addEventListener("scroll", () => {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(() => { updateActive(); ticking = false; });
    }, { passive: true });
    window.addEventListener("resize", updateActive);
    updateActive();
  }

  /* ---------- Gentle reveal on scroll ---------- */

  const revealItems = document.querySelectorAll(".reveal");
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  if (!("IntersectionObserver" in window) || reduceMotion) {
    revealItems.forEach((el) => el.classList.add("is-visible"));
  } else {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add("is-visible");
        observer.unobserve(entry.target);
      });
    }, { rootMargin: "0px 0px -8% 0px", threshold: 0.08 });
    revealItems.forEach((el, i) => {
      el.style.transitionDelay = `${Math.min(i % 3, 2) * 70}ms`;
      observer.observe(el);
    });
    // Safety net: never leave content hidden.
    window.addEventListener("load", () => {
      setTimeout(() => revealItems.forEach((el) => {
        if (el.getBoundingClientRect().top < window.innerHeight) el.classList.add("is-visible");
      }), 300);
    });
  }

  /* ---------- Copy BibTeX ---------- */

  document.querySelectorAll(".copy-btn").forEach((button) => {
    button.addEventListener("click", async () => {
      const target = document.getElementById(button.dataset.copyTarget || "");
      if (!target) return;
      const text = target.textContent.trim();
      let ok = false;
      try {
        await navigator.clipboard.writeText(text);
        ok = true;
      } catch (e) {
        const area = document.createElement("textarea");
        area.value = text;
        area.setAttribute("readonly", "");
        area.style.position = "fixed";
        area.style.opacity = "0";
        document.body.appendChild(area);
        area.select();
        try { ok = document.execCommand("copy"); } catch (err) { ok = false; }
        area.remove();
      }
      button.textContent = ok ? "Copied ✓" : "Press Ctrl+C";
      setTimeout(() => { button.textContent = "Copy"; }, 1800);
    });
  });
})();
