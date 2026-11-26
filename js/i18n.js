(function () {
  const STORAGE_KEY = "lang";
  const LANGS = ["en", "it"];

  const STRINGS = {
    en: {
      "meta.title": "Matteo Babini · Developer and designer",
      "meta.description": "Matteo Babini, self-taught developer and designer based in Italy. I design and build web and mobile apps.",
      "lang.label": "Language",
      "btn.copy": "Copy",
      "skill.equipped": "equipped",
      "project.noDescription": "No description yet.",
      "project.updated": "updated {when}",
      "project.viewCode": "View code",
      "project.live": "Live site",
      "project.empty": "No public repositories yet.",
      "time.today": "today",
      "time.yesterday": "yesterday",
      "time.days": "{n} days ago",
      "time.month": "a month ago",
      "time.months": "{n} months ago",
      "time.year": "a year ago",
      "time.years": "{n} years ago",
      "swipe": "{current} of {total} · swipe for more",
      "copy.done": "Copied",
      "copy.fail": "Select it",
      "cases.read": "Read the case study →",
      "cases.concept": "concept",
      "cases.empty": "The case studies couldn't load right now. Try again in a minute.",
      "study.pageTitle": "{title} · Case study · Matteo Babini",
      "study.notFound": "Not found",
      "study.notFoundText": "There's no case study with that name.",
      "study.loadFailed": "Couldn't load",
      "study.loadFailedText": "The case study couldn't load right now. Try again in a minute.",
      "study.all": "All case studies",
      "study.outroTitle": "Want one like this?",
      "study.outroText": "I design and build websites for restaurants, shops and small businesses. Email is the fastest way to reach me.",
      "study.email": "Email me",
      "study.scrollable": "scrollable",
    },
    it: {
      "meta.title": "Matteo Babini · Sviluppatore e designer",
      "meta.description": "Matteo Babini, sviluppatore e designer autodidatta in Italia. Progetto e sviluppo app web e mobile.",
      "lang.label": "Lingua",
      "skill.equipped": "equipaggiato",
      "project.noDescription": "Ancora nessuna descrizione.",
      "project.updated": "aggiornato {when}",
      "project.viewCode": "Vedi il codice",
      "project.live": "Sito online",
      "project.empty": "Ancora nessun repository pubblico.",
      "time.today": "oggi",
      "time.yesterday": "ieri",
      "time.days": "{n} giorni fa",
      "time.month": "un mese fa",
      "time.months": "{n} mesi fa",
      "time.year": "un anno fa",
      "time.years": "{n} anni fa",
      "swipe": "{current} di {total} · scorri per gli altri",
      "copy.done": "Copiato",
      "copy.fail": "Selezionalo",
      "cases.read": "Leggi il caso studio →",
      "cases.concept": "concept",
      "cases.empty": "Non riesco a caricare i casi studio. Riprova tra un minuto.",
      "study.pageTitle": "{title} · Caso studio · Matteo Babini",
      "study.notFound": "Non trovato",
      "study.notFoundText": "Non c'è nessun caso studio con questo nome.",
      "study.loadFailed": "Errore di caricamento",
      "study.loadFailedText": "Non riesco a caricare il caso studio. Riprova tra un minuto.",
      "study.all": "Tutti i casi studio",
      "study.outroTitle": "Ne vuoi uno così?",
      "study.outroText": "Progetto e sviluppo siti per ristoranti, negozi e piccole attività. L'email è il modo più veloce per contattarmi.",
      "study.email": "Scrivimi",
      "study.scrollable": "scorrevole",

      "hero.laptop": "Un portatile che ruota piano, con del codice che si scrive sullo schermo",
      "hero.intro": "Sono uno sviluppatore e designer autodidatta, in Italia. Progetto e sviluppo app web e mobile, dal primo schizzo al codice che funziona.",
      "neo.machine": "Computer",
      "neo.role": "Ruolo",
      "neo.roleValue": "Sviluppatore + designer",
      "neo.builds": "Faccio",
      "neo.buildsValue": "App web e mobile",
      "neo.based": "Base",
      "neo.basedValue": "Italia",
      "btn.projects": "Progetti",
      "btn.openGithub": "Apri il mio GitHub",
      "btn.copy": "Copia",
      "btn.email": "Scrivimi",
      "btn.reset": "Ricomincia",
      "about.title": "Chi sono",
      "about.lead": "Chi sono e con cosa lavoro.",
      "about.p1": "Sono autodidatta: tutto quello che so l'ho imparato costruendo progetti veri. Quasi tutti nascono allo stesso modo. Qualcosa non funziona come dovrebbe, e allora ne costruisco una versione migliore.",
      "about.p2": "Lavoro su tutto lo stack: front end in React e Vue, Python e SQL sul back end, e React Native quando un'app deve stare su un telefono.",
      "about.p3": "Ogni giorno uso Arch Linux con Hyprland e Neovim, su un ThinkPad che continuo ad aggiornare da solo.",
      "about.p4": "Oltre a sviluppare, faccio anche il designer. Prima di scrivere codice decido layout, interfaccia e aspetto, così quello che disegno è proprio quello che va online. Una persona sola per tutte e due le cose.",
      "cases.title": "Casi studio",
      "cases.lead": "Concept che ho progettato per il tipo di attività locali con cui voglio lavorare.",
      "projects.title": "Progetti",
      "projects.lead": "Presi direttamente dal mio GitHub, dal più recente.",
      "github.title": "Tutto il codice è su GitHub",
      "github.lead": "Ogni progetto qui sopra ha il suo repository, con un README che spiega cosa fa e come avviarlo. Dai commit si vede come è nato, errori compresi.",
      "contact.title": "Continua? ",
      "contact.lead": "Hai in mente un sito o un'app? Posso progettarlo e svilupparlo. L'email è il modo più veloce per contattarmi.",
      "footer.built": "fatto in Neovim su Arch",
    },
  };

  function pickInitial() {
    const fromUrl = new URLSearchParams(location.search).get("lang");
    if (LANGS.includes(fromUrl)) return fromUrl;
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (LANGS.includes(saved)) return saved;
    } catch (error) {
    }
    const prefs = navigator.languages || [navigator.language || ""];
    return prefs.some((l) => /^it\b/i.test(l)) ? "it" : "en";
  }

  let lang = pickInitial();

  function mainTextNode(el) {
    return [...el.childNodes].find((n) => n.nodeType === 3 && n.textContent.trim());
  }

  const textEls = [...document.querySelectorAll("[data-i18n]")].map((el) => {
    const node = mainTextNode(el);
    const original = node ? node.textContent : "";
    return {
      el,
      key: el.dataset.i18n,
      original,
      lead: original.match(/^\s*/)[0],
      trail: original.match(/\s*$/)[0],
    };
  });

  const attrEls = [...document.querySelectorAll("[data-i18n-attr]")].flatMap((el) =>
    el.dataset.i18nAttr.split(";").map((pair) => {
      const [attr, key] = pair.split(":").map((s) => s.trim());
      return { el, attr, key, original: el.getAttribute(attr) || "" };
    })
  );

  function t(key, vars) {
    let text = STRINGS[lang][key] ?? STRINGS.en[key] ?? key;
    if (vars) text = text.replace(/\{(\w+)\}/g, (_, name) => (name in vars ? vars[name] : `{${name}}`));
    return text;
  }

  function L(value) {
    if (value && typeof value === "object" && !Array.isArray(value)) return value[lang] ?? value.en;
    return value;
  }

  function apply() {
    document.documentElement.lang = lang;

    textEls.forEach((item) => {
      const node = mainTextNode(item.el);
      if (!node) return;
      const text = lang === "en" || STRINGS[lang][item.key] == null
        ? item.original
        : item.lead + STRINGS[lang][item.key].trim() + item.trail;
      if (node.textContent !== text) node.textContent = text;
    });

    attrEls.forEach((item) => {
      const value = lang === "en" || STRINGS[lang][item.key] == null ? item.original : STRINGS[lang][item.key];
      item.el.setAttribute(item.attr, value);
    });

    const titleKey = document.body.dataset.i18nTitle;
    if (titleKey) {
      document.title = t(titleKey);
      const description = document.querySelector('meta[name="description"]');
      if (description) description.setAttribute("content", t("meta.description"));
    }

    document.querySelectorAll(".lang-toggle").forEach((group) => {
      group.setAttribute("aria-label", t("lang.label"));
      group.querySelectorAll("button[data-lang]").forEach((button) => {
        button.setAttribute("aria-pressed", String(button.dataset.lang === lang));
      });
    });
  }

  function set(next) {
    if (!LANGS.includes(next) || next === lang) return;
    lang = next;
    try {
      localStorage.setItem(STORAGE_KEY, lang);
    } catch (error) {
    }
    const url = new URL(location.href);
    if (url.searchParams.has("lang")) {
      url.searchParams.set("lang", lang);
      history.replaceState(null, "", url);
    }
    apply();
    document.dispatchEvent(new CustomEvent("langchange", { detail: { lang } }));
  }

  document.addEventListener("click", (event) => {
    const button = event.target.closest(".lang-toggle button[data-lang]");
    if (button) set(button.dataset.lang);
  });

  window.I18N = {
    get lang() { return lang; },
    t,
    L,
    set,
  };

  apply();
})();
