const SITE = {
  github: "theflyinghedgehog",
  email: "msttro.babini@gmail.com",

  hideRepos: [],

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
      what: "An operations tool for a port terminal that replaces a shared Excel file for logging container moves: shipper, operation type, storage and container number.",
      why: "Several office PCs needed the same live data, and a spreadsheet wasn't built for that.",
      stack: ["JavaScript", "SQL", "Local web app"],
    },
    {
      repo: "obsidian-notion-db",
      name: "Notion-style databases for Obsidian",
      what: "An Obsidian plugin that adds Notion-like tables with properties. Each row can stay a simple entry or open as a full note.",
      why: "I run my life in Obsidian but missed Notion's databases.",
      stack: ["TypeScript", "Obsidian API"],
    },
    {
      repo: "excel-desktop",
      name: "excel-desktop fork",
      what: "My fork of an Electron wrapper for Excel Online, adjusted so it renders sharply on Hyprland.",
      why: "The original looked blurry on my setup.",
      stack: ["Electron", "JavaScript", "Hyprland"],
    },
    {
      repo: "dotfiles",
      name: "Dotfiles",
      what: "My Arch setup: Hyprland with the Serpantinum shell, and a Neovim config built on lazy.nvim.",
      why: "So I can rebuild my desktop on any machine in minutes.",
      stack: ["Lua", "Bash", "Hyprland", "Neovim"],
    },
  ],
};
