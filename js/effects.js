(function () {
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  function onFirstView(els, fn, amount = 0.35) {
    if (reduceMotion || !("IntersectionObserver" in window)) return;
    const io = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        io.unobserve(entry.target);
        fn(entry.target);
      });
    }, { threshold: amount });
    els.forEach((el) => io.observe(el));
  }

  const prompts = [...document.querySelectorAll(".section:not(#home) .prompt")]
    .map((el) => {
      const node = [...el.childNodes].reverse().find((n) => n.nodeType === 3 && n.textContent.includes("$ "));
      if (!node) return null;
      const at = node.textContent.indexOf("$ ") + 2;
      return { el, node, head: node.textContent.slice(0, at), command: node.textContent.slice(at) };
    })
    .filter(Boolean);

  if (!reduceMotion) {
    prompts.forEach((p) => {
      p.node.textContent = p.head;
      p.el.setAttribute("aria-label", p.head + p.command);
    });
  }

  onFirstView(prompts.map((p) => p.el), (el) => {
    const p = prompts.find((x) => x.el === el);
    const cursor = document.createElement("i");
    cursor.className = "cursor";
    cursor.setAttribute("aria-hidden", "true");
    el.appendChild(cursor);
    let i = 0;
    setTimeout(function type() {
      i += 1;
      p.node.textContent = p.head + p.command.slice(0, i);
      if (i < p.command.length) setTimeout(type, 45 + Math.random() * 70);
      else setTimeout(() => cursor.remove(), 900);
    }, 250);
  }, 0.6);

  const GLYPHS = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789#$%&@*+=<>/";

  function scramble(el) {
    const node = [...el.childNodes].find((n) => n.nodeType === 3 && n.textContent.trim());
    if (!node) return;
    const final = node.textContent;
    el.setAttribute("aria-label", el.textContent);
    const settle = [...final].map((_, i) => 120 + (i / final.length) * 500 + Math.random() * 200);
    const t0 = performance.now();
    (function frame(now) {
      const t = now - t0;
      let out = "";
      let done = true;
      for (let i = 0; i < final.length; i++) {
        if (t >= settle[i] || final[i] === " ") out += final[i];
        else {
          done = false;
          out += GLYPHS[Math.floor(Math.random() * GLYPHS.length)];
        }
      }
      node.textContent = out;
      if (!done) requestAnimationFrame(frame);
      else el.removeAttribute("aria-label");
    })(t0);
  }

  onFirstView(document.querySelectorAll(".section-head h2, .github h2, .contact h2"), scramble, 0.8);

  const tree = document.getElementById("repo-tree");
  if (tree) onFirstView([tree], () => tree.classList.add("is-printing"), 0.4);

  const HEART = [
    "..XXX...XXX..",
    ".XXXXX.XXXXX.",
    "XXXXXXXXXXXXX",
    "XXXXXXXXXXXXX",
    "XXXXXXXXXXXXX",
    ".XXXXXXXXXXX.",
    "..XXXXXXXXX..",
    "...XXXXXXX...",
    "....XXXXX....",
    ".....XXX.....",
    "......X......",
  ];
  const CRACK = [6, 6, 6, 5, 6, 7, 6, 5, 6, 6, 6];

  function brokenHeartSvg() {
    let left = "";
    let right = "";
    HEART.forEach((row, y) => {
      [...row].forEach((cell, x) => {
        if (cell !== "X" || x === CRACK[y]) return;
        const shine = (x === 2 && y === 2) || (x === 3 && y === 2) || (x === 2 && y === 3);
        const rect = `<rect x="${x}" y="${y}" width="1" height="1"${shine ? ' fill="#f2d5cf"' : ""}/>`;
        if (x < CRACK[y]) left += rect;
        else right += rect;
      });
    });
    return `<svg class="broken-heart" viewBox="-1 -1 15 13" role="img" aria-label="Broken heart: no continues left">
      <g class="half half-left">${left}</g><g class="half half-right">${right}</g></svg>`;
  }

  const count = document.getElementById("countdown");
  const resetBtn = document.getElementById("countdown-reset");
  if (count && !reduceMotion && "IntersectionObserver" in window) {
    let n = 9;
    let timer = null;
    let visible = false;
    let over = false;

    const pop = () => {
      count.classList.remove("tick");
      void count.offsetWidth;
      count.classList.add("tick");
    };

    const tick = () => {
      n -= 1;
      count.textContent = n;
      pop();
      if (n > 0) timer = setTimeout(tick, 1000);
      else timer = setTimeout(gameOver, 900);
    };

    function gameOver() {
      over = true;
      count.classList.remove("tick");
      count.innerHTML = brokenHeartSvg();
      count.classList.add("is-broken");
      if (resetBtn) {
        resetBtn.hidden = false;
        resetBtn.classList.add("is-shown");
      }
    }

    function reset() {
      clearTimeout(timer);
      over = false;
      n = 9;
      count.classList.remove("is-broken");
      count.textContent = n;
      pop();
      if (resetBtn) {
        resetBtn.hidden = true;
        resetBtn.classList.remove("is-shown");
      }
      if (visible) timer = setTimeout(tick, 1000);
    }

    if (resetBtn) resetBtn.addEventListener("click", reset);

    new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting;
      clearTimeout(timer);
      if (visible && !over) timer = setTimeout(tick, 1000);
    }, { threshold: 0.5 }).observe(count);
  }

  const grid = document.getElementById("project-grid");
  if (grid && !reduceMotion && window.matchMedia("(hover: hover)").matches) {
    grid.addEventListener("pointermove", (e) => {
      const card = e.target.closest(".project-card");
      if (!card) return;
      const r = card.getBoundingClientRect();
      const x = (e.clientX - r.left) / r.width - 0.5;
      const y = (e.clientY - r.top) / r.height - 0.5;
      card.style.setProperty("--tilt-x", `${(x * 8).toFixed(2)}deg`);
      card.style.setProperty("--tilt-y", `${(-y * 8).toFixed(2)}deg`);
      card.style.setProperty("--glow-x", `${((x + 0.5) * 100).toFixed(1)}%`);
      card.style.setProperty("--glow-y", `${((y + 0.5) * 100).toFixed(1)}%`);
    });
    grid.addEventListener("pointerout", (e) => {
      const card = e.target.closest(".project-card");
      if (card && !card.contains(e.relatedTarget)) {
        card.style.removeProperty("--tilt-x");
        card.style.removeProperty("--tilt-y");
      }
    });
  }
})();
