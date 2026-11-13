// Small motion layer for cykielabs.com. Everything is visible without it.
(() => {
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;

  // Header gets a soft shadow once the page scrolls.
  const top = document.querySelector(".top");
  const onScroll = () => top && top.classList.toggle("scrolled", scrollY > 8);
  addEventListener("scroll", onScroll, { passive: true });
  onScroll();

  if (reduce) return;

  // Reveal blocks as they scroll into view, siblings a beat apart.
  const groups = [
    ".pillars a", ".app-grid > *", ".head-row", ".block .kicker + h2", ".band .wrap > *", ".rules li",
    ".about .wrap > *", "article.app", ".feature-grid > div", ".service-grid > div", ".steps li",
    ".sup-card", ".faq details", ".contact-grid a", ".next-card", ".panel", ".ticks li", ".prose > *",
  ];
  const els = [];
  groups.forEach(sel => document.querySelectorAll(sel).forEach(el => {
    if (el.closest(".hero, .page-head, .app-hero") || els.includes(el)) return;
    const i = [...el.parentElement.children].indexOf(el);
    el.style.setProperty("--d", Math.min(i, 6) * 0.07 + "s");
    el.classList.add("reveal");
    els.push(el);
  }));
  // Show each block once its top is inside the window.
  let pending = els;
  const check = () => {
    const line = innerHeight * 0.92;
    pending = pending.filter(el => {
      if (el.getBoundingClientRect().top < line) { el.classList.add("in"); return false; }
      return true;
    });
    if (!pending.length) { removeEventListener("scroll", check); removeEventListener("resize", check); clearInterval(timer); }
  };
  const timer = setInterval(check, 350); // backup for browsers that batch scroll events
  addEventListener("scroll", check, { passive: true });
  addEventListener("resize", check);
  check();

  // Count numbers up (167 scenes, 26 templates...).
  document.querySelectorAll("[data-count]").forEach(el => {
    const end = +el.dataset.count, t0 = performance.now() + 500, dur = 1100;
    el.textContent = "0";
    const step = now => {
      const p = Math.min(Math.max((now - t0) / dur, 0), 1);
      el.textContent = Math.round(end * (1 - Math.pow(1 - p, 3)));
      if (p < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
    setTimeout(() => { el.textContent = end; }, 2500); // in case frames are paused
  });
})();
