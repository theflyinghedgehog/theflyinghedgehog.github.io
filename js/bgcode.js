(function () {
  const canvas = document.getElementById("bg-code");
  if (!canvas) return;
  const ctx = canvas.getContext("2d");
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  const C = {
    text: "#c6d0f5",
    dim: "#737994",
    comment: "#737994",
    keyword: "#ca9ee6",
    string: "#a6d189",
    number: "#ef9f76",
    func: "#8caaee",
    type: "#e5c890",
    prop: "#babbf1",
    punct: "#949cbb",
    prompt: "#81c8be",
    output: "#a5adce",
    cursor: "#f2d5cf",
    tabLine: "#ca9ee6",
    dirty: "#e5c890",
  };

  const words = (s) => new Set(s.split(" "));
  const LANGS = {
    js: { comment: "//", keywords: words("const let var function return export import from if else for while of in new async await class extends this true false null undefined default try catch throw require module") },
    ts: { comment: "//", keywords: words("const let function return export import from if else for of in new async await class extends implements interface type this true false null undefined private public readonly void string number boolean") },
    py: { comment: "#", keywords: words("def class return if elif else for in while import from as with try except raise None True False and or not lambda self yield pass assert") },
    lua: { comment: "--", keywords: words("local function end return if then else elseif for in do while true false nil require and or not") },
    sql: { comment: "--", ci: true, keywords: words("select from where order by limit desc asc join left on as and or not null insert into values create table primary key references integer text real default group count index update set unique if exists") },
    sh: { comment: "#", keywords: words("if then fi for do done in case esac echo export local function while sudo set") },
    conf: { comment: "#", keywords: words("general decoration input bind exec-once monitor animations") },
    json: { comment: null, keywords: words("true false null") },
    css: { comment: "//", keywords: words("var") },
  };

  function highlight(line, lang, terminal) {
    if (terminal) {
      if (line.startsWith("$ ")) return [["$ ", C.prompt], [line.slice(2), C.text]];
      return [[line, C.output]];
    }
    const L = LANGS[lang] || LANGS.js;
    const out = [];

    const trimmed = line.trimStart();
    if (L.comment && trimmed.startsWith(L.comment)) return [[line, C.comment]];
    if (lang === "css" && trimmed.startsWith("/*")) return [[line, C.comment]];

    const re = /("[^"]*"?|'[^']*'?|`[^`]*`?)|(\b\d+(?:\.\d+)?(?:px|ms|s|%)?\b)|([A-Za-z_$@][\w$-]*)|(\s+)|([^\w\s])/g;
    let m;
    while ((m = re.exec(line))) {
      const [tok, str, num, word] = m;
      let color = C.punct;
      if (str) {
        color = lang === "json" && line[m.index + tok.length] === ":" ? C.func : C.string;
      } else if (num) color = C.number;
      else if (word) {
        const kw = L.ci ? word.toLowerCase() : word;
        const next = line.slice(m.index + word.length).trimStart()[0];
        if (L.keywords.has(kw)) color = C.keyword;
        else if (next === "(") color = C.func;
        else if ((lang === "conf" || lang === "css") && (next === "=" || next === ":")) color = C.prop;
        else if (lang === "css" && /^[.#]?[a-z-]+$/.test(word) && next === "{") color = C.func;
        else if (/^[A-Z][a-z]/.test(word)) color = C.type;
        else color = C.text;
      }
      out.push([tok, color]);
    }
    return out;
  }

  const PROJECTS = [
    {
      name: "port-terminal-ops",
      files: [
        {
          path: "db/schema.sql", lang: "sql", lines: [
            "-- one row per container move",
            "CREATE TABLE IF NOT EXISTS moves (",
            "  id INTEGER PRIMARY KEY,",
            "  container TEXT NOT NULL,",
            "  shipper TEXT NOT NULL,",
            "  kind TEXT CHECK (kind IN ('in', 'out')),",
            "  slot TEXT,",
            "  weight_kg REAL,",
            "  logged_at TEXT DEFAULT CURRENT_TIMESTAMP",
            ");",
            "",
            "CREATE INDEX idx_moves_container",
            "  ON moves (container);",
          ],
        },
        {
          path: "src/moves.js", lang: "js", lines: [
            "import { db } from \"./db.js\";",
            "",
            "export function logMove(move) {",
            "  const stmt = db.prepare(`",
            "    INSERT INTO moves (container, shipper, kind, slot)",
            "    VALUES (?, ?, ?, ?)`);",
            "  return stmt.run(move.container, move.shipper,",
            "    move.kind, move.slot);",
            "}",
            "",
            "export function movesFor(container) {",
            "  return db",
            "    .prepare(\"SELECT * FROM moves WHERE container = ?\")",
            "    .all(container);",
            "}",
          ],
        },
        {
          path: "src/server.js", lang: "js", lines: [
            "import express from \"express\";",
            "import { logMove, movesFor } from \"./moves.js\";",
            "",
            "const app = express();",
            "app.use(express.json());",
            "",
            "app.post(\"/moves\", (req, res) => {",
            "  const result = logMove(req.body);",
            "  res.status(201).json({ id: result.lastInsertRowid });",
            "});",
            "",
            "app.listen(3000, () => console.log(\"on :3000\"));",
          ],
        },
        {
          path: "zsh", term: true, lines: [
            "$ npm run dev",
            "> port-terminal-ops@0.4.0 dev",
            "> node --watch src/server.js",
            "on :3000",
            "$ curl -s localhost:3000/moves/MSCU4471230 | jq length",
            "6",
          ],
        },
      ],
    },
    {
      name: "obsidian-notion-db",
      files: [
        {
          path: "manifest.json", lang: "json", lines: [
            "{",
            "  \"id\": \"notion-db\",",
            "  \"name\": \"Notion-style databases\",",
            "  \"version\": \"0.3.1\",",
            "  \"minAppVersion\": \"1.5.0\",",
            "  \"isDesktopOnly\": false",
            "}",
          ],
        },
        {
          path: "src/main.ts", lang: "ts", lines: [
            "import { Plugin } from \"obsidian\";",
            "import { TableView, VIEW_TABLE } from \"./views/TableView\";",
            "",
            "export default class NotionDb extends Plugin {",
            "  async onload() {",
            "    this.registerView(VIEW_TABLE, (leaf) =>",
            "      new TableView(leaf, this));",
            "    this.addCommand({",
            "      id: \"open-table\",",
            "      name: \"Open database as table\",",
            "      callback: () => this.activateView(),",
            "    });",
            "  }",
            "}",
          ],
        },
        {
          path: "src/views/TableView.ts", lang: "ts", lines: [
            "export const VIEW_TABLE = \"notion-db-table\";",
            "",
            "export class TableView extends ItemView {",
            "  private rows: Row[] = [];",
            "",
            "  getViewType(): string {",
            "    return VIEW_TABLE;",
            "  }",
            "",
            "  async render() {",
            "    const table = this.contentEl.createEl(\"table\");",
            "    for (const row of this.rows) {",
            "      this.renderRow(table, row);",
            "    }",
            "  }",
            "}",
          ],
        },
        {
          path: "styles.css", lang: "css", lines: [
            ".notion-db-table {",
            "  width: 100%;",
            "  border-collapse: collapse;",
            "}",
            "",
            ".notion-db-table td {",
            "  padding: 6px 10px;",
            "  border-bottom: 1px solid var(--background-modifier-border);",
            "}",
          ],
        },
      ],
    },
    {
      name: "dotfiles",
      files: [
        {
          path: "nvim/init.lua", lang: "lua", lines: [
            "vim.g.mapleader = \" \"",
            "vim.opt.number = true",
            "vim.opt.relativenumber = true",
            "vim.opt.expandtab = true",
            "vim.opt.shiftwidth = 2",
            "",
            "require(\"config.lazy\")",
          ],
        },
        {
          path: "nvim/lua/plugins/lsp.lua", lang: "lua", lines: [
            "return {",
            "  \"neovim/nvim-lspconfig\",",
            "  event = \"BufReadPre\",",
            "  config = function()",
            "    local lsp = require(\"lspconfig\")",
            "    lsp.ts_ls.setup({})",
            "    lsp.pyright.setup({})",
            "    lsp.lua_ls.setup({})",
            "    vim.keymap.set(\"n\", \"gd\", vim.lsp.buf.definition)",
            "  end,",
            "}",
          ],
        },
        {
          path: "hypr/hyprland.conf", lang: "conf", lines: [
            "# ThinkPad T470 panel",
            "monitor = eDP-1, 1920x1080@60, 0x0, 1",
            "",
            "general {",
            "    gaps_in = 4",
            "    gaps_out = 8",
            "    border_size = 2",
            "    col.active_border = rgb(8caaee) rgb(ca9ee6) 45deg",
            "}",
            "",
            "bind = SUPER, Return, exec, kitty",
            "bind = SUPER, E, exec, nautilus",
          ],
        },
        {
          path: "zsh", term: true, lines: [
            "$ ./scripts/sync.sh",
            "linking nvim -> ~/.config/nvim",
            "linking hypr -> ~/.config/hypr",
            "done in 0.4s",
            "$ hyprctl reload",
            "ok",
          ],
        },
      ],
    },
    {
      name: "finance-tracker",
      files: [
        {
          path: "parser/statements.py", lang: "py", lines: [
            "import csv",
            "from datetime import date",
            "",
            "def read_statement(path):",
            "    with open(path, newline=\"\") as f:",
            "        for row in csv.DictReader(f, delimiter=\";\"):",
            "            yield {",
            "                \"day\": date.fromisoformat(row[\"Data\"]),",
            "                \"amount\": float(row[\"Importo\"]),",
            "                \"memo\": row[\"Descrizione\"].strip(),",
            "            }",
          ],
        },
        {
          path: "budgets.py", lang: "py", lines: [
            "RULES = {",
            "    \"esselunga\": \"groceries\",",
            "    \"trenitalia\": \"travel\",",
            "    \"enel\": \"bills\",",
            "}",
            "",
            "def categorize(memo):",
            "    memo = memo.lower()",
            "    for needle, budget in RULES.items():",
            "        if needle in memo:",
            "            return budget",
            "    return \"other\"",
          ],
        },
        {
          path: "zsh", term: true, lines: [
            "$ python -m pytest -q",
            "........................          [100%]",
            "24 passed in 0.38s",
          ],
        },
      ],
    },
    {
      name: "excel-desktop",
      files: [
        {
          path: "main.js", lang: "js", lines: [
            "const { app, BrowserWindow } = require(\"electron\");",
            "",
            "// sharper text under Hyprland's fractional scaling",
            "app.commandLine.appendSwitch(\"ozone-platform-hint\", \"auto\");",
            "",
            "app.whenReady().then(() => {",
            "  const win = new BrowserWindow({ width: 1280, height: 800 });",
            "  win.loadURL(\"https://www.office.com/launch/excel\");",
            "});",
          ],
        },
        {
          path: "package.json", lang: "json", lines: [
            "{",
            "  \"name\": \"excel-desktop\",",
            "  \"version\": \"1.2.0\",",
            "  \"main\": \"main.js\",",
            "  \"scripts\": { \"start\": \"electron .\" }",
            "}",
          ],
        },
      ],
    },
  ];

  function rand(a, b) { return a + Math.random() * (b - a); }
  function chance(p) { return Math.random() < p; }

  const ROWS = ["qwertyuiop", "asdfghjkl", "zxcvbnm"];
  function neighbour(ch) {
    const lower = ch.toLowerCase();
    for (const row of ROWS) {
      const i = row.indexOf(lower);
      if (i === -1) continue;
      const j = i === 0 ? 1 : i === row.length - 1 ? i - 1 : i + (chance(0.5) ? 1 : -1);
      return ch === lower ? row[j] : row[j].toUpperCase();
    }
    return null;
  }

  function keyDelay(p, ch, prev) {
    let d = (1 / p.cps) * rand(0.55, 1.6);
    if (/[a-z]/i.test(ch) && /[a-z]/i.test(prev)) d *= 0.7;
    if (prev === " ") d *= rand(1.1, 1.6);
    if (/[(){}[\];,.:=]/.test(prev)) d *= rand(1.3, 2.2);
    if (/[A-Z"{}()[\]<>_]/.test(ch)) d *= 1.25;
    if (chance(0.025)) d += rand(0.35, 0.9);
    return d;
  }

  const FONT = 13;
  const LINE = 21;
  const PANE_W = 440;
  const ALPHA = 0.3;
  const TOP = 60;
  const HEAD = 44;
  let charW = FONT * 0.6;
  let width = 0;
  let height = 0;
  let panes = [];

  function makePane(i, count) {
    const w = width / count;
    const project = PROJECTS[i % PROJECTS.length];
    return {
      x: i * w + 18,
      w: w - 36,
      maxChars: Math.floor((w - 70) / charW),
      rows: Math.max(4, Math.floor((height - TOP - HEAD) / LINE)),
      project,
      fileIndex: Math.floor(Math.random() * project.files.length),
      lines: [],
      offset: 0,
      current: "",
      queue: [],
      target: null,
      wait: rand(0.3, 2.5),
      cps: rand(9, 14),
      errors: 0,
      typoTail: 0,
      erase: 0,
      dirty: false,
      toast: "",
      toastT: 0,
      state: "open",
    };
  }

  function file(p) { return p.project.files[p.fileIndex]; }

  function openFile(p) {
    const f = file(p);
    p.lines = [];
    p.offset = 0;
    p.current = "";
    p.queue = f.lines.slice();
    p.target = null;
    p.errors = 0;
    p.typoTail = 0;
    p.erase = 0;
    p.dirty = false;
    p.state = "typing";
  }

  function pushLine(p, line) {
    p.lines.push(line);
    const extra = p.lines.length - (p.rows - 1);
    if (extra > 0) {
      p.lines.splice(0, extra);
      p.offset += extra;
    }
  }

  function act(p) {
    const f = file(p);

    if (p.state === "open") {
      openFile(p);
      return rand(0.4, 1.2);
    }

    if (p.state === "done") {
      if (p.dirty) {
        p.dirty = false;
        if (!f.term) {
          p.toast = `"${f.path.split("/").pop()}" ${f.lines.length}L written`;
          p.toastT = 2.2;
        }
        return rand(1.2, 2.5);
      }
      p.fileIndex = (p.fileIndex + 1) % p.project.files.length;
      p.state = "open";
      return rand(0.2, 0.6);
    }

    if (p.target === null) {
      if (!p.queue.length) {
        p.state = "done";
        return rand(0.8, 1.6);
      }
      p.target = p.queue.shift();
      p.current = "";
      if (f.term && !p.target.startsWith("$ ")) {
        pushLine(p, p.target);
        p.target = null;
        return rand(0.05, 0.4);
      }
      if (f.term) p.current = "$ ";
      else p.current = p.target.match(/^\s*/)[0];
      return chance(0.12) ? rand(0.9, 2.4) : rand(0.08, 0.35);
    }

    if (p.erase > 0) {
      p.current = p.current.slice(0, -1);
      p.erase -= 1;
      if (p.errors > 0) p.errors -= 1;
      return rand(0.045, 0.09);
    }

    const t = p.target;

    if (p.errors > 0) {
      const at = p.current.length;
      if (p.typoTail > 0 && at < t.length) {
        p.current += t[at];
        p.errors += 1;
        p.typoTail -= 1;
        return keyDelay(p, t[at], p.current[at - 1]);
      }
      p.erase = p.errors;
      return rand(0.25, 0.6);
    }

    if (p.current.length >= t.length) {
      pushLine(p, p.current);
      p.target = null;
      return rand(0.1, 0.3);
    }

    const at = p.current.length;
    const ch = t[at];
    const prev = p.current[at - 1] || "";
    if (!f.term) p.dirty = true;

    const wrong = !f.term || at > 2 ? neighbour(ch) : null;
    if (wrong && chance(0.035)) {
      p.current += wrong;
      p.errors = 1;
      p.typoTail = Math.floor(rand(0, 3));
      return keyDelay(p, ch, prev);
    }

    if (ch === " " && chance(0.02)) {
      const word = p.current.match(/[\w.$"]+$/);
      if (word && word[0].length > 3) {
        p.erase = word[0].length;
        return rand(0.4, 0.9);
      }
    }

    p.current += ch;
    return keyDelay(p, ch, prev);
  }

  function step(p, dt, speed) {
    p.wait -= dt * speed;
    if (p.toastT > 0) p.toastT -= dt;
    let guard = 0;
    while (p.wait <= 0 && guard++ < 20) p.wait += act(p);
  }

  function fillStatic(p) {
    openFile(p);
    for (const line of p.queue) pushLine(p, line);
    p.queue = [];
    p.state = "done";
  }

  function clip(line, max) {
    return line.length > max ? line.slice(0, max - 1) + "…" : line;
  }

  function drawLine(text, x, y, f) {
    for (const [tok, color] of highlight(text, f.lang, f.term)) {
      ctx.fillStyle = color;
      ctx.fillText(tok, x, y);
      x += tok.length * charW;
    }
    return x;
  }

  function drawHeader(p) {
    const f = file(p);
    const root = `~/projects/${p.project.name}/`;
    const rest = p.toastT > 0 ? `  ${p.toast}` : f.term ? "  (zsh)" : f.path;
    const room = p.maxChars + 4;
    ctx.globalAlpha = ALPHA * 0.9;
    ctx.fillStyle = C.prompt;
    ctx.fillText(clip(root, room), p.x, TOP);
    if (root.length < room) {
      ctx.globalAlpha = ALPHA * (p.toastT > 0 ? 0.7 : 0.9);
      ctx.fillStyle = p.toastT > 0 ? C.dim : C.text;
      ctx.fillText(clip(rest, room - root.length), p.x + root.length * charW, TOP);
    }

    let x = p.x;
    const y = TOP + 20;
    for (const [i, other] of p.project.files.entries()) {
      const name = other.term ? "zsh" : other.path.split("/").pop();
      const active = i === p.fileIndex;
      const label = active && p.dirty ? `${name} ●` : name;
      if (x + label.length * charW > p.x + p.w) break;
      ctx.globalAlpha = ALPHA * (active ? 1.1 : 0.55);
      ctx.fillStyle = active ? C.text : C.dim;
      ctx.fillText(name, x, y);
      if (active && p.dirty) {
        ctx.fillStyle = C.dirty;
        ctx.fillText(" ●", x + name.length * charW, y);
      }
      if (active) {
        ctx.fillStyle = C.tabLine;
        ctx.fillRect(x, y + FONT + 3, label.length * charW, 2);
      }
      x += (label.length + 3) * charW;
    }
  }

  let blink = 0;

  function draw() {
    ctx.clearRect(0, 0, width, height);
    ctx.font = `400 ${FONT}px "IBM Plex Mono", ui-monospace, monospace`;
    ctx.textBaseline = "top";

    for (const p of panes) {
      const f = file(p);
      drawHeader(p);

      const typing = p.target !== null || p.erase > 0;
      const shown = typing ? [...p.lines, p.current] : p.lines;
      const top = TOP + HEAD;

      shown.forEach((line, r) => {
        const y = top + r * LINE;
        if (!f.term) {
          ctx.globalAlpha = ALPHA * 0.5;
          ctx.fillStyle = C.dim;
          ctx.fillText(String(p.offset + r + 1).padStart(3, " "), p.x, y);
        }
        ctx.globalAlpha = ALPHA;
        const startX = f.term ? p.x : p.x + charW * 4.5;
        const endX = drawLine(clip(line, p.maxChars), startX, y, f);

        if (r === shown.length - 1 && !reduceMotion && (typing || blink < 0.5)) {
          ctx.globalAlpha = ALPHA * 2;
          ctx.fillStyle = C.cursor;
          ctx.fillRect(typing ? endX + 1 : startX, typing ? y + 2 : y + LINE + 2, charW, FONT + 3);
        }
      });
    }
    ctx.globalAlpha = 1;
  }

  function resize() {
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    width = window.innerWidth;
    height = window.innerHeight;
    canvas.width = Math.round(width * dpr);
    canvas.height = Math.round(height * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.font = `400 ${FONT}px "IBM Plex Mono", ui-monospace, monospace`;
    charW = ctx.measureText("M").width;

    const count = Math.max(1, Math.round(width / PANE_W));
    panes = Array.from({ length: count }, (_, i) => makePane(i, count));
    if (reduceMotion) panes.forEach(fillStatic);
    draw();
  }

  let boost = 0;
  let lastScroll = window.scrollY;
  window.addEventListener("scroll", () => {
    const d = Math.abs(window.scrollY - lastScroll);
    lastScroll = window.scrollY;
    boost = Math.min(6, boost + d / 30);
  }, { passive: true });

  let running = false;
  let last = 0;
  let frameAcc = 0;
  function loop(now) {
    if (!running) return;
    const dt = Math.min(0.1, (now - last) / 1000);
    last = now;
    boost *= Math.pow(0.08, dt);
    blink = (blink + dt) % 1;
    for (const p of panes) step(p, dt, 1 + boost);
    frameAcc += dt;
    if (frameAcc > 1 / 30) {
      frameAcc = 0;
      draw();
    }
    requestAnimationFrame(loop);
  }

  function start() {
    if (running || reduceMotion) return;
    running = true;
    last = performance.now();
    requestAnimationFrame(loop);
  }

  let resizeTimer;
  window.addEventListener("resize", () => {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(resize, 150);
  });
  document.addEventListener("visibilitychange", () => {
    if (document.hidden) running = false;
    else start();
  });

  (document.fonts ? document.fonts.load(`400 ${FONT}px "IBM Plex Mono"`) : Promise.resolve())
    .catch(() => {})
    .then(() => {
      resize();
      start();
    });
})();
