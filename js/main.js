(function () {
  const githubUrl = `https://github.com/${SITE.github}`;

  function escapeHtml(text) {
    return String(text).replace(/[&<>"]/g, (char) => ({
      "&": "&amp;",
      "<": "&lt;",
      ">": "&gt;",
      '"': "&quot;",
    })[char]);
  }

  function drawLaptopKeys() {
    const keys = document.getElementById("laptop-keys");
    let rects = "";

    for (let x = 3; x <= 15; x += 2) {
      rects += `<rect x="${x}" y="11" width="1" height="1"/>`;
    }
    for (let x = 4; x <= 16; x += 2) {
      if (x !== 10) rects += `<rect x="${x}" y="12" width="1" height="1"/>`;
    }

    keys.innerHTML = rects;
  }

  function fillLinks() {
    document.querySelectorAll(".js-github-link").forEach((link) => {
      link.href = githubUrl;
    });

    document.getElementById("email-link").href = `mailto:${SITE.email}`;

    document.getElementById("contact-details").innerHTML =
      `<span>${escapeHtml(SITE.email)}</span> <span>github.com/${escapeHtml(SITE.github)}</span>`;

    document.getElementById("year").textContent = new Date().getFullYear();
  }

  function renderInventory() {
    document.getElementById("inventory").innerHTML = SITE.skills
      .map((skill) => `<li><b>${escapeHtml(skill)}</b><small>equipped</small></li>`)
      .join("");
  }

  const grid = document.getElementById("project-grid");
  const swipeHint = document.getElementById("swipe-hint");
  const CACHE_KEY = `gh-repos:${SITE.github}`;
  const CACHE_MS = 30 * 60 * 1000;

  const LANG_COLORS = {
    JavaScript: "#e5c890", TypeScript: "#8caaee", Python: "#85c1dc",
    Lua: "#babbf1", Shell: "#a6d189", HTML: "#ef9f76", CSS: "#ca9ee6",
    Vue: "#81c8be", Rust: "#ea999c", Go: "#99d1db", C: "#949cbb",
    "C++": "#f4b8e4", Java: "#e78284", Kotlin: "#ca9ee6", Swift: "#ef9f76",
  };

  const notesByRepo = Object.fromEntries(
    SITE.projects.filter((p) => p.repo).map((p) => [p.repo.toLowerCase(), p])
  );

  function prettyName(name) {
    const words = name.replace(/[-_.]+/g, " ").trim();
    return words.charAt(0).toUpperCase() + words.slice(1);
  }

  function timeAgo(iso) {
    const days = Math.floor((Date.now() - new Date(iso)) / 86400000);
    if (days < 1) return "today";
    if (days === 1) return "yesterday";
    if (days < 30) return `${days} days ago`;
    const months = Math.floor(days / 30);
    if (months < 12) return months === 1 ? "a month ago" : `${months} months ago`;
    const years = Math.floor(months / 12);
    return years === 1 ? "a year ago" : `${years} years ago`;
  }

  function fromRepo(repo) {
    const note = notesByRepo[repo.name.toLowerCase()] || {};
    const topics = (repo.topics || []).filter((t) => t !== "portfolio");
    return {
      repo: repo.name,
      name: note.name || prettyName(repo.name),
      what: note.what || repo.description || "No description yet.",
      why: note.why || "",
      stack: note.stack || (topics.length ? topics : [repo.language].filter(Boolean)),
      language: repo.language,
      stars: repo.stargazers_count,
      homepage: repo.homepage,
      updated: repo.pushed_at,
    };
  }

  function pickRepos(repos) {
    const hidden = new Set((SITE.hideRepos || []).map((n) => n.toLowerCase()));
    const usable = repos.filter((r) =>
      !r.fork && !r.archived && !r.private &&
      r.name.toLowerCase() !== SITE.github.toLowerCase() &&
      !hidden.has(r.name.toLowerCase())
    );
    const tagged = usable.filter((r) => (r.topics || []).includes("portfolio"));
    return (tagged.length ? tagged : usable)
      .sort((a, b) => new Date(b.pushed_at) - new Date(a.pushed_at));
  }

  async function fetchRepos() {
    let cached = null;
    try {
      cached = JSON.parse(localStorage.getItem(CACHE_KEY));
    } catch (error) {
    }
    if (cached && Date.now() - cached.at < CACHE_MS) return cached.repos;

    try {
      const res = await fetch(
        `https://api.github.com/users/${encodeURIComponent(SITE.github)}/repos?per_page=100&sort=pushed`,
        { headers: { Accept: "application/vnd.github+json" } }
      );
      if (!res.ok) throw new Error(`GitHub ${res.status}`);
      const repos = await res.json();
      try {
        localStorage.setItem(CACHE_KEY, JSON.stringify({ at: Date.now(), repos }));
      } catch (error) {
      }
      return repos;
    } catch (error) {
      if (cached) return cached.repos;
      throw error;
    }
  }

  function projectCard(project) {
    const tags = project.stack.map((tag) => `<li>${escapeHtml(tag)}</li>`).join("");
    const lang = project.language
      ? `<span class="lang"><i style="background:${LANG_COLORS[project.language] || "#949cbb"}"></i>${escapeHtml(project.language)}</span>`
      : "";
    const meta = [
      project.stars ? `★ ${project.stars}` : "",
      project.updated ? `updated ${timeAgo(project.updated)}` : "",
    ].filter(Boolean).join(" · ");
    const live = project.homepage
      ? `<a class="repo-link" href="${escapeHtml(project.homepage)}" target="_blank" rel="noopener">Live site</a>`
      : "";

    return `
      <article class="project-card">
        <div class="project-card-tab">
          <code>~/projects/${escapeHtml(project.repo)}/</code>
          ${lang}
        </div>
        <div class="project-card-body">
          <h3>${escapeHtml(project.name)}</h3>
          <p>${escapeHtml(project.what)}</p>
          ${project.why ? `<p class="project-why">${escapeHtml(project.why)}</p>` : ""}
          ${tags ? `<ul class="tags">${tags}</ul>` : ""}
          ${meta ? `<p class="project-meta">${meta}</p>` : ""}
          <div class="project-links">
            <a class="repo-link" href="${githubUrl}/${encodeURIComponent(project.repo)}" target="_blank" rel="noopener">View code</a>
            ${live}
          </div>
        </div>
      </article>`;
  }

  function renderProjects(projects) {
    grid.removeAttribute("aria-busy");
    grid.innerHTML = projects.length
      ? projects.map(projectCard).join("")
      : `<p class="empty-state">No public repositories yet.</p>`;

    grid.querySelectorAll(".project-card").forEach((card, i) => card.style.setProperty("--i", i));
    grid.scrollLeft = 0;
    updateSwipeHint();
  }

  function renderSkeletons() {
    grid.setAttribute("aria-busy", "true");
    grid.innerHTML = Array.from({ length: 3 }, () => `
      <article class="project-card is-skeleton" aria-hidden="true">
        <div class="project-card-tab"><code>~/projects/loading…</code></div>
        <div class="project-card-body"><i></i><i></i><i></i><i></i></div>
      </article>`).join("");
  }

  async function loadProjects() {
    renderSkeletons();
    let projects = [];
    try {
      projects = pickRepos(await fetchRepos()).map(fromRepo);
    } catch (error) {
    }
    if (!projects.length) {
      projects = SITE.projects.filter((p) => p.repo).map((p) => ({ ...p, stack: p.stack || [] }));
    }
    renderProjects(projects);
    renderGithub(projects);
  }

  function updateSwipeHint() {
    const cards = grid.querySelectorAll(".project-card");

    if (cards.length < 2) {
      swipeHint.textContent = "";
      return;
    }

    const cardWidth = cards[0].offsetWidth + 14;
    const current = Math.min(cards.length, Math.round(grid.scrollLeft / cardWidth) + 1);
    swipeHint.textContent = `${current} of ${cards.length} · swipe for more`;
  }

  grid.addEventListener("scroll", () => requestAnimationFrame(updateSwipeHint), { passive: true });

  function renderGithub(projects) {
    const lines = projects.slice(0, 8).map((project, index, list) => {
      const branch = index === list.length - 1 ? "└──" : "├──";
      const note = project.language ? `  <span class="comment"># ${escapeHtml(project.language.toLowerCase())}</span>` : "";
      return `${branch} <span class="dir">${escapeHtml(project.repo)}/</span>${note}`;
    });
    if (projects.length > 8) lines.push(`    <span class="comment">… and ${projects.length - 8} more</span>`);

    const all = [`<span class="comment">github.com/</span><span class="dir">${escapeHtml(SITE.github)}/</span>`, ...lines];
    document.getElementById("repo-tree").innerHTML = all
      .map((line, i) => `<span class="tree-line" style="--i:${i}">${line}</span>`)
      .join("\n");
  }

  document.getElementById("copy-button").addEventListener("click", async (event) => {
    const button = event.currentTarget;
    try {
      await navigator.clipboard.writeText(document.getElementById("clone-command").textContent.trim());
      button.textContent = "Copied";
    } catch (error) {
      button.textContent = "Select it";
    }
    setTimeout(() => (button.textContent = "Copy"), 1600);
  });

  function startClock() {
    const clock = document.getElementById("clock");
    const tick = () => {
      clock.textContent = new Date().toLocaleTimeString("it-IT", { hour: "2-digit", minute: "2-digit" });
    };
    tick();
    setInterval(tick, 30000);

    const cpu = document.getElementById("cpu");
    setInterval(() => {
      const load = Math.random() < 0.15 ? 18 + Math.random() * 20 : 2 + Math.random() * 7;
      cpu.textContent = `${Math.round(load)}%`;
    }, 2000);
  }

  function typeCommand() {
    const target = document.getElementById("typed-command");
    const command = "whoami";
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    if (reduceMotion) {
      target.textContent = command;
      return;
    }

    let i = 0;
    const timer = setInterval(() => {
      i += 1;
      target.textContent = command.slice(0, i);
      if (i >= command.length) clearInterval(timer);
    }, 120);
  }

  function trackSections() {
    const links = [...document.querySelectorAll("#workspaces a")];

    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;

        const id = entry.target.id;
        links.forEach((link) => link.classList.toggle("active", link.getAttribute("href") === `#${id}`));
      });
    }, { rootMargin: "-45% 0px -50% 0px" });

    ["home", "about", "projects", "github", "contact"].forEach((id) => {
      observer.observe(document.getElementById(id));
    });
  }

  function setStagger(parent) {
    [...parent.children].forEach((child, i) => child.style.setProperty("--i", i));
  }

  function startReveals() {
    const hero = document.querySelector(".hero");
    setStagger(hero);
    hero.querySelectorAll(".neofetch, .color-blocks").forEach(setStagger);
    const heroInfo = hero.querySelector(".hero-content > div:last-child");
    heroInfo.querySelector(".color-blocks").style.setProperty("--i", 10);
    heroInfo.querySelector(".buttons").style.setProperty("--i", 11);

    setStagger(document.getElementById("inventory"));

    const targets = document.querySelectorAll(
      ".section:not(#home) .screen, .section-head, #project-grid"
    );
    if (!("IntersectionObserver" in window)) return;

    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add("is-visible");
        observer.unobserve(entry.target);
      });
    }, { rootMargin: "0px 0px -12% 0px" });

    targets.forEach((el) => {
      el.classList.add("reveal");
      observer.observe(el);
    });
  }

  drawLaptopKeys();
  fillLinks();
  renderInventory();
  loadProjects();
  startClock();
  typeCommand();
  trackSections();
  startReveals();
})();
