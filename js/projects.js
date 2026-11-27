const SITE = {
  github: "theflyinghedgehog",
  email: "msttro.babini@gmail.com",

  hideRepos: ["concept-designs"],

  caseStudies: "https://raw.githubusercontent.com/theflyinghedgehog/concept-designs/main/",

  skills: [
    "UI/UX design",
    "JavaScript",
    "React",
    "React Native",
    "Vue.js",
    "Python",
    "SQL",
    "Electron",
    "Bash",
    "Lua",
    "Git",
    "Linux",
  ],

  projects: [
    {
      repo: "port-terminal-ops",
      name: "Port terminal ops",
      what: {
        en: "An operations tool for a port terminal that replaces a shared Excel file for logging container moves: shipper, operation type, storage and container number.",
        it: "Uno strumento per un terminal portuale che sostituisce il file Excel condiviso dove si registravano i movimenti dei container: spedizioniere, tipo di operazione, deposito e numero del container.",
      },
      why: {
        en: "Several office PCs needed the same live data, and a spreadsheet wasn't built for that.",
        it: "Più PC dell'ufficio dovevano vedere gli stessi dati aggiornati, e un foglio di calcolo non è fatto per quello.",
      },
      stack: ["JavaScript", "SQL", "Local web app"],
    },
    {
      repo: "obsidian-notion-db",
      name: { en: "Notion-style databases for Obsidian", it: "Database in stile Notion per Obsidian" },
      what: {
        en: "An Obsidian plugin that adds Notion-like tables with properties. Each row can stay a simple entry or open as a full note.",
        it: "Un plugin per Obsidian che aggiunge tabelle con proprietà, come quelle di Notion. Ogni riga può restare una voce semplice o aprirsi come nota completa.",
      },
      why: {
        en: "I run my life in Obsidian but missed Notion's databases.",
        it: "Organizzo la mia vita in Obsidian, ma mi mancavano i database di Notion.",
      },
      stack: ["TypeScript", "Obsidian API"],
    },
    {
      repo: "excel-desktop",
      name: { en: "excel-desktop fork", it: "Fork di excel-desktop" },
      what: {
        en: "My fork of an Electron wrapper for Excel Online, adjusted so it renders sharply on Hyprland.",
        it: "Il mio fork di un wrapper Electron per Excel Online, sistemato perché su Hyprland si veda nitido.",
      },
      why: {
        en: "The original looked blurry on my setup.",
        it: "Sul mio setup l'originale era sfocato.",
      },
      stack: ["Electron", "JavaScript", "Hyprland"],
    },
    {
      repo: "dotfiles",
      name: "Dotfiles",
      what: {
        en: "My Arch setup: Hyprland with the Serpantinum shell, and a Neovim config built on lazy.nvim.",
        it: "Il mio setup Arch: Hyprland con la shell Serpantinum e una config di Neovim basata su lazy.nvim.",
      },
      why: {
        en: "So I can rebuild my desktop on any machine in minutes.",
        it: "Così rimetto in piedi il mio desktop su qualsiasi macchina in pochi minuti.",
      },
      stack: ["Lua", "Bash", "Hyprland", "Neovim"],
    },
  ],
};
