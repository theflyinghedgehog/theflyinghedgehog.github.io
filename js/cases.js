(function () {
  const local = ["localhost", "127.0.0.1"].includes(location.hostname);
  const base = local ? "case-studies/" : SITE.caseStudies;
  let pending = null;

  function escapeHtml(text) {
    return String(text).replace(/[&<>"]/g, (char) => ({
      "&": "&amp;",
      "<": "&lt;",
      ">": "&gt;",
      '"': "&quot;",
    })[char]);
  }

  function load() {
    if (!pending) {
      pending = fetch(`${base}case-studies.json`, { cache: "no-cache" })
        .then((res) => {
          if (!res.ok) throw new Error(`case studies ${res.status}`);
          return res.json();
        })
        .then((data) => data.studies || [])
        .catch((error) => {
          pending = null;
          throw error;
        });
    }
    return pending;
  }

  function asset(study, file) {
    return base + encodeURI(study.folder + file);
  }

  function studyUrl(study) {
    return `case-study.html?id=${encodeURIComponent(study.id)}`;
  }

  function card(study) {
    const tags = (study.tags || []).map((tag) => `<li>${escapeHtml(tag)}</li>`).join("");
    const cover = study.card
      ? `<a class="case-card-cover" href="${studyUrl(study)}" tabindex="-1" aria-hidden="true">
           <img src="${asset(study, study.card.file)}" alt="" width="${study.card.width}" height="${study.card.height}" loading="lazy" decoding="async">
         </a>`
      : "";

    return `
      <article class="project-card case-card">
        <div class="project-card-tab">
          <code>~/case-studies/${escapeHtml(study.id)}/</code>
          ${study.concept ? `<span class="lang"><i style="background:var(--ctp-peach)"></i>concept</span>` : ""}
        </div>
        <div class="case-card-main">
          ${cover}
          <div class="project-card-body">
            <p class="case-kind">${escapeHtml(study.kind || "")}</p>
            <h3>${escapeHtml(study.title)}</h3>
            <p>${escapeHtml(study.summary || "")}</p>
            ${tags ? `<ul class="tags">${tags}</ul>` : ""}
            <div class="project-links">
              <a class="repo-link" href="${studyUrl(study)}">Read the case study →</a>
            </div>
          </div>
        </div>
      </article>`;
  }

  async function renderGrid() {
    const grid = document.getElementById("case-grid");
    if (!grid) return;

    grid.setAttribute("aria-busy", "true");
    grid.innerHTML = `
      <article class="project-card case-card is-skeleton" aria-hidden="true">
        <div class="project-card-tab"><code>~/case-studies/loading…</code></div>
        <div class="project-card-body"><i></i><i></i><i></i><i></i></div>
      </article>`;

    let studies = [];
    try {
      studies = await load();
    } catch (error) {
    }

    grid.removeAttribute("aria-busy");
    grid.innerHTML = studies.length
      ? studies.map(card).join("")
      : `<p class="empty-state">The case studies couldn't load right now. Try again in a minute.</p>`;
    grid.querySelectorAll(".project-card").forEach((el, i) => el.style.setProperty("--i", i));
  }

  window.CaseStudies = { load, asset, escapeHtml };
  renderGrid();
})();
