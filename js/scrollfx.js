(function () {
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

  const root = document.documentElement;
  const hero = document.getElementById("home");
  const sections = [...document.querySelectorAll(".section")];
  const heads = [...document.querySelectorAll(".section-head")];
  const SP_ITEMS = ".project-card, .inventory li, .about-text > p, .clone-box, .contact .buttons";
  let queued = false;

  function update() {
    queued = false;
    const vh = window.innerHeight;
    const max = root.scrollHeight - vh;
    root.style.setProperty("--scroll", max > 0 ? (window.scrollY / max).toFixed(4) : 0);

    const heroOut = Math.min(1, Math.max(0, window.scrollY / (hero.offsetHeight * 0.9)));
    hero.style.setProperty("--hero-out", heroOut.toFixed(4));

    for (const section of sections) {
      const r = section.getBoundingClientRect();
      if (r.bottom < -vh || r.top > vh * 2) continue;
      const center = r.top + r.height / 2;
      const p = Math.max(-1, Math.min(1, (vh / 2 - center) / (vh / 2 + r.height / 2)));
      section.style.setProperty("--p", p.toFixed(4));
    }

    document.querySelectorAll(SP_ITEMS).forEach((el) => {
      const r = el.getBoundingClientRect();
      if (r.bottom < -100 || r.top > vh + 100) return;
      const sp = Math.max(-1, Math.min(1, (vh / 2 - (r.top + r.height / 2)) / (vh / 2)));
      el.style.setProperty("--sp", sp.toFixed(3));
    });

    for (const head of heads) {
      const r = head.getBoundingClientRect();
      if (r.bottom < -vh || r.top > vh * 2) continue;
      const hp = Math.max(-1, Math.min(1, (vh / 2 - (r.top + r.height / 2)) / (vh / 2)));
      head.style.setProperty("--hp", hp.toFixed(4));
    }
  }

  function queue() {
    if (queued) return;
    queued = true;
    requestAnimationFrame(update);
  }

  window.addEventListener("scroll", queue, { passive: true });
  window.addEventListener("resize", queue);
  root.classList.add("scrollfx");
  update();
})();
