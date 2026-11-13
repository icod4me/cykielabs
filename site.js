// cykielabs.com interactions. The site works and shows everything without this file.
(() => {
  const d = document.documentElement;
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const fine = matchMedia("(hover: hover) and (pointer: fine)").matches;
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];

  /* ---------- theme switch ---------- */
  const darkNow = () => d.dataset.theme ? d.dataset.theme === "dark" : matchMedia("(prefers-color-scheme: dark)").matches;
  $(".theme-btn")?.addEventListener("click", () => {
    const next = darkNow() ? "light" : "dark";
    d.classList.add("theme-anim");
    d.dataset.theme = next;
    try { localStorage.setItem("theme", next); } catch (e) {}
    setTimeout(() => d.classList.remove("theme-anim"), 500);
  });

  /* ---------- mobile menu ---------- */
  const menuBtn = $(".menu-btn");
  const setMenu = open => {
    d.classList.toggle("menu-open", open);
    menuBtn?.setAttribute("aria-expanded", open);
  };
  menuBtn?.addEventListener("click", () => setMenu(!d.classList.contains("menu-open")));
  $$("#nav a").forEach(a => a.addEventListener("click", () => setMenu(false)));
  addEventListener("keydown", e => { if (e.key === "Escape") setMenu(false); });

  /* ---------- header shadow, progress bar, back to top ---------- */
  const top = $(".top"), bar = $(".progress"), toTop = $(".to-top");
  const onScroll = () => {
    const y = scrollY, max = document.documentElement.scrollHeight - innerHeight;
    top?.classList.toggle("scrolled", y > 8);
    if (bar) bar.style.transform = `scaleX(${max > 0 ? Math.min(y / max, 1) : 0})`;
    toTop?.classList.toggle("show", y > innerHeight * 0.9);
  };
  addEventListener("scroll", onScroll, { passive: true });
  onScroll();
  toTop?.addEventListener("click", () => scrollTo({ top: 0, behavior: reduce ? "auto" : "smooth" }));

  /* ---------- copy email ---------- */
  const toast = $(".toast");
  let toastTimer;
  const say = msg => {
    if (!toast) return;
    toast.textContent = msg;
    toast.classList.add("show");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => toast.classList.remove("show"), 2200);
  };
  $$("[data-copy]").forEach(btn => btn.addEventListener("click", async () => {
    const text = btn.dataset.copy;
    try { await navigator.clipboard.writeText(text); }
    catch (e) {
      const t = document.createElement("textarea");
      t.value = text; document.body.appendChild(t); t.select();
      try { document.execCommand("copy"); } catch (e2) {}
      t.remove();
    }
    const old = btn.textContent;
    btn.textContent = "Copied ✓"; btn.classList.add("done");
    say(`${text} copied`);
    setTimeout(() => { btn.textContent = old; btn.classList.remove("done"); }, 1800);
  }));

  /* ---------- smooth FAQ open/close ---------- */
  $$(".faq details").forEach(det => {
    const sum = det.querySelector("summary");
    sum.addEventListener("click", e => {
      if (reduce) return;
      e.preventDefault();
      const body = det.querySelector("p");
      if (det.open) {
        const h = body.offsetHeight;
        body.animate([{ height: h + "px", opacity: 1 }, { height: "0px", opacity: 0 }], { duration: 260, easing: "ease" })
          .onfinish = () => { det.open = false; };
        det.classList.remove("opening");
      } else {
        det.open = true;
        const h = body.offsetHeight;
        body.animate([{ height: "0px", opacity: 0 }, { height: h + "px", opacity: 1 }], { duration: 320, easing: "cubic-bezier(.2,.7,.2,1)" });
      }
    });
  });

  if (reduce) return;

  /* ---------- headline words rise one by one ---------- */
  $$(".hero h1, .page-head h1").forEach(h => {
    let i = 0;
    const walk = node => [...node.childNodes].forEach(n => {
      if (n.nodeType === 3) {
        const frag = document.createDocumentFragment();
        n.textContent.split(/(\s+)/).forEach(part => {
          if (!part) return;
          if (/^\s+$/.test(part)) { frag.append(part); return; }
          const w = document.createElement("span");
          w.className = "w";
          const inner = document.createElement("span");
          inner.textContent = part;
          inner.style.animationDelay = (0.12 + i++ * 0.07) + "s";
          w.append(inner);
          frag.append(w);
        });
        n.replaceWith(frag);
      } else if (n.nodeType === 1) walk(n);
    });
    walk(h);
    h.classList.add("split");
  });

  /* ---------- reveal on scroll ---------- */
  const groups = [
    ".pillars a", ".app-grid > *", ".head-row", ".block .kicker + h2", ".band .wrap > *", ".rules li",
    ".about .wrap > *", "article.app", ".feature-grid > div", ".service-grid > div", ".steps li",
    ".sup-card", ".faq details", ".contact-grid a", ".next-card", ".panel", ".ticks li", ".prose > *",
    ".stats .wrap > div", ".peek .marquee",
  ];
  const els = [];
  groups.forEach(sel => $$(sel).forEach(el => {
    if (el.closest(".hero, .page-head, .app-hero") || els.includes(el)) return;
    const i = [...el.parentElement.children].indexOf(el);
    el.style.setProperty("--d", Math.min(i, 6) * 0.07 + "s");
    el.classList.add("reveal");
    els.push(el);
  }));

  // Count numbers up when they come into view.
  const counters = $$("[data-count]");
  const countUp = el => {
    const end = +el.dataset.count;
    if (!end) return;
    const t0 = performance.now(), dur = 1200;
    const step = now => {
      const p = Math.min((now - t0) / dur, 1);
      el.textContent = Math.round(end * (1 - Math.pow(1 - p, 3)));
      if (p < 1) requestAnimationFrame(step);
    };
    el.textContent = "0";
    requestAnimationFrame(step);
    setTimeout(() => { el.textContent = end; }, dur + 600);
  };

  let pending = els.concat(counters);
  const check = () => {
    const line = innerHeight * 0.92;
    pending = pending.filter(el => {
      if (el.getBoundingClientRect().top < line) {
        if (el.dataset.count !== undefined) countUp(el); else el.classList.add("in");
        return false;
      }
      return true;
    });
    if (!pending.length) clearInterval(timer);
  };
  addEventListener("scroll", check, { passive: true });
  addEventListener("resize", check);
  const timer = setInterval(check, 350);
  check();

  if (!fine) return;

  /* ---------- spotlight + tilt on cards ---------- */
  $$(".app-card, .sup-card, .contact-grid a, .panel, .steps li, .pillars a, .service-grid > div, .feature-grid > div").forEach(card => {
    card.classList.add("spot");
    const tilt = card.matches(".app-card, .sup-card, .contact-grid a");
    card.addEventListener("pointermove", e => {
      const r = card.getBoundingClientRect();
      const x = (e.clientX - r.left) / r.width, y = (e.clientY - r.top) / r.height;
      card.style.setProperty("--mx", x * 100 + "%");
      card.style.setProperty("--my", y * 100 + "%");
      if (tilt) card.style.transform = `perspective(900px) rotateX(${(0.5 - y) * 5}deg) rotateY(${(x - 0.5) * 6}deg) translateY(-4px)`;
    });
    card.addEventListener("pointerleave", () => { card.style.transform = ""; });
  });

  /* ---------- magnetic buttons ---------- */
  $$(".btn").forEach(b => {
    b.addEventListener("pointermove", e => {
      const r = b.getBoundingClientRect();
      b.style.transform = `translate(${(e.clientX - r.left - r.width / 2) * 0.18}px, ${(e.clientY - r.top - r.height / 2) * 0.28}px)`;
    });
    b.addEventListener("pointerleave", () => { b.style.transform = ""; });
  });

  /* ---------- hero phones follow the pointer ---------- */
  const fan = $(".fan"), hero = $(".hero");
  if (fan && hero) {
    hero.addEventListener("pointermove", e => {
      const x = e.clientX / innerWidth - 0.5, y = e.clientY / innerHeight - 0.5;
      fan.style.transform = `translate(${x * -18}px, ${y * -14}px) rotateY(${x * 6}deg) rotateX(${y * -4}deg)`;
    });
    hero.addEventListener("pointerleave", () => { fan.style.transform = ""; });
  }
})();
