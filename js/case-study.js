(async function () {
  const { load, asset, escapeHtml } = window.CaseStudies;
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

  if (!study) {
    root.innerHTML = `
      <section class="section">
        <div class="container screen study-missing">
          <p class="prompt"><span>~</span> $ cat case-studies/${escapeHtml(id)}/README.md</p>
          <h1>${failed ? "Couldn't load" : "Not found"}</h1>
          <p>${failed
            ? "The case study couldn't load right now. Try again in a minute."
            : "There's no case study with that name."}</p>
          <div class="buttons">
            <a class="btn btn-primary" href="index.html#case-studies"><kbd>A</kbd>All case studies</a>
          </div>
        </div>
      </section>`;
    return;
  }

  document.title = `${study.title} · Case study · Matteo Babini`;

  function figure(image) {
    const img = `<img src="${asset(study, image.file)}" alt="${escapeHtml(image.alt || "")}" width="${image.width}" height="${image.height}" loading="lazy" decoding="async">`;
    if (image.scroll) {
      return `<figure class="study-scroll" style="--w:${image.width}" tabindex="0" aria-label="${escapeHtml(image.alt || "")}, scrollable">${img}</figure>`;
    }
    return `<figure class="study-figure">${img}</figure>`;
  }

  const meta = (study.meta || [])
    .map(([key, value]) => `<dt>${escapeHtml(key)}</dt><dd>${escapeHtml(value)}</dd>`)
    .join("");
  const tags = (study.tags || []).map((tag) => `<li>${escapeHtml(tag)}</li>`).join("");

  const hero = `
    <section class="section">
      <div class="container screen study-hero">
        <p class="prompt"><span>~</span> $ cat case-studies/${escapeHtml(study.id)}/README.md</p>
        <p class="case-kind">${escapeHtml(study.kind || "")}${study.year ? ` · ${escapeHtml(study.year)}` : ""}</p>
        <h1>${escapeHtml(study.title)}</h1>
        <p class="study-summary">${escapeHtml(study.summary || "")}</p>
        ${tags ? `<ul class="tags">${tags}</ul>` : ""}
        ${meta ? `<dl class="neofetch study-meta">${meta}</dl>` : ""}
      </div>
    </section>`;

  const sections = (study.sections || []).map((section, i) => {
    const text = (section.text || []).map((p) => `<p>${escapeHtml(p)}</p>`).join("");
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
            <h2>${escapeHtml(section.heading)}</h2>
            ${text}
          </div>
          ${images ? `<div class="study-images">${images}</div>` : ""}
        </div>
      </section>`;
  }).join("");

  const outro = `
    <section class="section">
      <div class="container screen contact study-outro">
        <p class="prompt"><span>~</span> $ ./contact --continue</p>
        <h2>Want one like this?</h2>
        <p>I design and build websites for restaurants, shops and small businesses. Email is the fastest way to reach me.</p>
        ${study.note ? `<p class="study-note">${escapeHtml(study.note)}</p>` : ""}
        <div class="buttons">
          <a class="btn btn-primary" href="mailto:${escapeHtml(SITE.email)}"><kbd>A</kbd>Email me</a>
          <a class="btn btn-secondary" href="index.html#case-studies"><kbd>B</kbd>All case studies</a>
        </div>
      </div>
    </section>`;

  root.innerHTML = hero + sections + outro;
})();
