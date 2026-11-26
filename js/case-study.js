(async function () {
  const { load, asset, escapeHtml } = window.CaseStudies;
  const { t, L } = window.I18N;
  const root = document.getElementById("study");
  const id = new URLSearchParams(location.search).get("id") || "";

  document.getElementById("year").textContent = new Date().getFullYear();

  let study = null;
  let failed = false;
  try {
    study = (await load()).find((s) => s.id === id) || null;
  } catch (error) {
    failed = true;
  }

  function missing() {
    document.title = `${t(failed ? "study.loadFailed" : "study.notFound")} · Matteo Babini`;
    root.innerHTML = `
      <section class="section">
        <div class="container screen study-missing">
          <p class="prompt"><span>~</span> $ cat case-studies/${escapeHtml(id)}/README.md</p>
          <h1>${escapeHtml(t(failed ? "study.loadFailed" : "study.notFound"))}</h1>
          <p>${escapeHtml(t(failed ? "study.loadFailedText" : "study.notFoundText"))}</p>
          <div class="buttons">
            <a class="btn btn-primary" href="index.html#case-studies"><kbd>A</kbd>${escapeHtml(t("study.all"))}</a>
          </div>
        </div>
      </section>`;
  }

  function figure(image) {
    const alt = L(image.alt) || "";
    const img = `<img src="${asset(study, image.file)}" alt="${escapeHtml(alt)}" width="${image.width}" height="${image.height}" loading="lazy" decoding="async">`;
    if (image.scroll) {
      return `<figure class="study-scroll" style="--w:${image.width}" tabindex="0" aria-label="${escapeHtml(alt)}, ${escapeHtml(t("study.scrollable"))}">${img}</figure>`;
    }
    return `<figure class="study-figure">${img}</figure>`;
  }

  function render() {
    if (!study) {
      missing();
      return;
    }

    const title = L(study.title);
    document.title = t("study.pageTitle", { title });

    const meta = (study.meta || [])
      .map(([key, value]) => `<dt>${escapeHtml(L(key))}</dt><dd>${escapeHtml(L(value))}</dd>`)
      .join("");
    const tags = (L(study.tags) || []).map((tag) => `<li>${escapeHtml(tag)}</li>`).join("");

    const hero = `
      <section class="section">
        <div class="container screen study-hero">
          <p class="prompt"><span>~</span> $ cat case-studies/${escapeHtml(study.id)}/README.md</p>
          <p class="case-kind">${escapeHtml(L(study.kind) || "")}${study.year ? ` · ${escapeHtml(study.year)}` : ""}</p>
          <h1>${escapeHtml(title)}</h1>
          <p class="study-summary">${escapeHtml(L(study.summary) || "")}</p>
          ${tags ? `<ul class="tags">${tags}</ul>` : ""}
          ${meta ? `<dl class="neofetch study-meta">${meta}</dl>` : ""}
        </div>
      </section>`;

    const sections = (study.sections || []).map((section, i) => {
      const text = (L(section.text) || []).map((p) => `<p>${escapeHtml(p)}</p>`).join("");
      const images = (section.images || []).map(figure).join("");
      const classes = ["container", "screen", "study-block"];
      if (section.wide) classes.push("is-wide");
      else if (!images) classes.push("is-text");
      else if (i % 2 === 0) classes.push("is-flipped");

      return `
        <section class="section">
          <div class="${classes.join(" ")}">
            <div class="study-text">
              <p class="prompt"><span>~</span> $ ${String(i + 1).padStart(2, "0")}</p>
              <h2>${escapeHtml(L(section.heading))}</h2>
              ${text}
            </div>
            ${images ? `<div class="study-images">${images}</div>` : ""}
          </div>
        </section>`;
    }).join("");

    const note = L(study.note);
    const outro = `
      <section class="section">
        <div class="container screen contact study-outro">
          <p class="prompt"><span>~</span> $ ./contact --continue</p>
          <h2>${escapeHtml(t("study.outroTitle"))}</h2>
          <p>${escapeHtml(t("study.outroText"))}</p>
          ${note ? `<p class="study-note">${escapeHtml(note)}</p>` : ""}
          <div class="buttons">
            <a class="btn btn-primary" href="mailto:${escapeHtml(SITE.email)}"><kbd>A</kbd>${escapeHtml(t("study.email"))}</a>
            <a class="btn btn-secondary" href="index.html#case-studies"><kbd>B</kbd>${escapeHtml(t("study.all"))}</a>
          </div>
        </div>
      </section>`;

    root.innerHTML = hero + sections + outro;
  }

  render();
  document.addEventListener("langchange", render);
})();
