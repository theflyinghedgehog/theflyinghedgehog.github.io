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
      name: "lru-cache",
      files: [
        {
          path: "src/lru.ts", lang: "ts", lines: [
            "export class LRUCache<K, V> {",
            "  private map = new Map<K, V>();",
            "  private capacity: number;",
            "",
            "  constructor(capacity: number) {",
            "    this.capacity = capacity;",
            "  }",
            "",
            "  get(key: K): V | undefined {",
            "    if (!this.map.has(key)) return undefined;",
            "    const value = this.map.get(key)!;",
            "    this.map.delete(key);",
            "    this.map.set(key, value);",
            "    return value;",
            "  }",
            "",
            "  set(key: K, value: V): void {",
            "    this.map.delete(key);",
            "    this.map.set(key, value);",
            "    if (this.map.size > this.capacity) {",
            "      const oldest = this.map.keys().next().value;",
            "      this.map.delete(oldest as K);",
            "    }",
            "  }",
            "}",
          ],
        },
        {
          path: "test/lru.test.ts", lang: "ts", lines: [
            "import { test } from \"node:test\";",
            "import assert from \"node:assert/strict\";",
            "import { LRUCache } from \"../src/lru.ts\";",
            "",
            "test(\"evicts the least recently used key\", () => {",
            "  const cache = new LRUCache<string, number>(2);",
            "  cache.set(\"a\", 1);",
            "  cache.set(\"b\", 2);",
            "  cache.get(\"a\");",
            "  cache.set(\"c\", 3);",
            "  assert.equal(cache.get(\"b\"), undefined);",
            "  assert.equal(cache.get(\"a\"), 1);",
            "});",
          ],
        },
        {
          path: "zsh", term: true, lines: [
            "$ node --test test/lru.test.ts",
            "✔ evicts the least recently used key (1.6ms)",
            "ℹ tests 1",
            "ℹ pass 1",
            "ℹ fail 0",
          ],
        },
      ],
    },
    {
      name: "maze-solver",
      files: [
        {
          path: "grid.py", lang: "py", lines: [
            "from collections import deque",
            "",
            "STEPS = ((1, 0), (-1, 0), (0, 1), (0, -1))",
            "",
            "def shortest_path(grid, start, goal):",
            "    rows, cols = len(grid), len(grid[0])",
            "    queue = deque([start])",
            "    came_from = {start: None}",
            "    while queue:",
            "        cell = queue.popleft()",
            "        if cell == goal:",
            "            break",
            "        r, c = cell",
            "        for dr, dc in STEPS:",
            "            nr, nc = r + dr, c + dc",
            "            if not (0 <= nr < rows and 0 <= nc < cols):",
            "                continue",
            "            if grid[nr][nc] == \"#\" or (nr, nc) in came_from:",
            "                continue",
            "            came_from[(nr, nc)] = cell",
            "            queue.append((nr, nc))",
            "    if goal not in came_from:",
            "        return None",
            "    path, cell = [], goal",
            "    while cell is not None:",
            "        path.append(cell)",
            "        cell = came_from[cell]",
            "    return path[::-1]",
          ],
        },
        {
          path: "main.py", lang: "py", lines: [
            "from grid import shortest_path",
            "",
            "MAZE = [",
            "    \"..#.....\",",
            "    \"..#.##..\",",
            "    \"....#...\",",
            "    \"###.#.#.\",",
            "    \"......#.\",",
            "]",
            "",
            "path = shortest_path(MAZE, (0, 0), (4, 7))",
            "print(f\"{len(path) - 1} steps\")",
          ],
        },
        {
          path: "zsh", term: true, lines: [
            "$ python main.py",
            "15 steps",
          ],
        },
      ],
    },
    {
      name: "markdown-lite",
      files: [
        {
          path: "package.json", lang: "json", lines: [
            "{",
            "  \"name\": \"markdown-lite\",",
            "  \"version\": \"0.2.0\",",
            "  \"type\": \"module\",",
            "  \"bin\": { \"mdl\": \"cli.js\" }",
            "}",
          ],
        },
        {
          path: "render.js", lang: "js", lines: [
            "const rules = [",
            "  [/^### (.*)$/gm, \"<h3>$1</h3>\"],",
            "  [/^## (.*)$/gm, \"<h2>$1</h2>\"],",
            "  [/^# (.*)$/gm, \"<h1>$1</h1>\"],",
            "  [/\\*\\*(.+?)\\*\\*/g, \"<strong>$1</strong>\"],",
            "  [/\\*(.+?)\\*/g, \"<em>$1</em>\"],",
            "  [/\\[(.+?)\\]\\((.+?)\\)/g, '<a href=\"$2\">$1</a>'],",
            "];",
            "",
            "export function render(md) {",
            "  return rules.reduce((html, [re, out]) => html.replace(re, out), md);",
            "}",
          ],
        },
        {
          path: "cli.js", lang: "js", lines: [
            "import { readFileSync } from \"node:fs\";",
            "import { render } from \"./render.js\";",
            "",
            "const file = process.argv[2];",
            "process.stdout.write(render(readFileSync(file, \"utf8\")));",
          ],
        },
        {
          path: "zsh", term: true, lines: [
            "$ echo '# Hello **world**' > hi.md",
            "$ node cli.js hi.md",
            "<h1>Hello <strong>world</strong></h1>",
          ],
        },
      ],
    },
    {
      name: "game-of-life",
      files: [
        {
          path: "life.lua", lang: "lua", lines: [
            "local life = {}",
            "",
            "function life.parse(lines)",
            "  local grid = {}",
            "  for r, line in ipairs(lines) do",
            "    grid[r] = {}",
            "    for c = 1, #line do",
            "      grid[r][c] = line:sub(c, c) == \"#\"",
            "    end",
            "  end",
            "  return grid",
            "end",
            "",
            "local function neighbours(grid, r, c)",
            "  local n = 0",
            "  for dr = -1, 1 do",
            "    for dc = -1, 1 do",
            "      local row = grid[r + dr]",
            "      if (dr ~= 0 or dc ~= 0) and row and row[c + dc] then",
            "        n = n + 1",
            "      end",
            "    end",
            "  end",
            "  return n",
            "end",
            "",
            "function life.step(grid)",
            "  local new = {}",
            "  for r = 1, #grid do",
            "    new[r] = {}",
            "    for c = 1, #grid[r] do",
            "      local n = neighbours(grid, r, c)",
            "      new[r][c] = n == 3 or (grid[r][c] and n == 2)",
            "    end",
            "  end",
            "  return new",
            "end",
            "",
            "function life.show(grid)",
            "  local out = {}",
            "  for r, row in ipairs(grid) do",
            "    local cells = {}",
            "    for c, alive in ipairs(row) do",
            "      cells[c] = alive and \"#\" or \".\"",
            "    end",
            "    out[r] = table.concat(cells)",
            "  end",
            "  return table.concat(out, \"\\n\")",
            "end",
            "",
            "return life",
          ],
        },
        {
          path: "main.lua", lang: "lua", lines: [
            "local life = require(\"life\")",
            "",
            "local grid = life.parse({",
            "  \".#...\",",
            "  \"..#..\",",
            "  \"###..\",",
            "  \".....\",",
            "  \".....\",",
            "})",
            "",
            "for _ = 1, 4 do",
            "  grid = life.step(grid)",
            "end",
            "print(life.show(grid))",
          ],
        },
        {
          path: "zsh", term: true, lines: [
            "$ lua main.lua",
            ".....",
            "..#..",
            "...#.",
            ".###.",
            ".....",
          ],
        },
      ],
    },
    {
      name: "link-shortener",
      files: [
        {
          path: "schema.sql", lang: "sql", lines: [
            "CREATE TABLE IF NOT EXISTS links (",
            "  id INTEGER PRIMARY KEY,",
            "  slug TEXT UNIQUE NOT NULL,",
            "  target TEXT NOT NULL,",
            "  hits INTEGER DEFAULT 0,",
            "  created_at TEXT DEFAULT CURRENT_TIMESTAMP",
            ");",
            "",
            "-- most visited links first",
            "SELECT slug, target, hits",
            "FROM links",
            "ORDER BY hits DESC",
            "LIMIT 10;",
          ],
        },
        {
          path: "slug.py", lang: "py", lines: [
            "import string",
            "",
            "ALPHABET = string.digits + string.ascii_letters",
            "",
            "def encode(n):",
            "    if n == 0:",
            "        return ALPHABET[0]",
            "    out = []",
            "    while n:",
            "        n, rem = divmod(n, 62)",
            "        out.append(ALPHABET[rem])",
            "    return \"\".join(reversed(out))",
            "",
            "def decode(slug):",
            "    n = 0",
            "    for ch in slug:",
            "        n = n * 62 + ALPHABET.index(ch)",
            "    return n",
          ],
        },
        {
          path: "zsh", term: true, lines: [
            "$ sqlite3 links.db < schema.sql",
            "$ python -c 'from slug import encode; print(encode(125))'",
            "21",
          ],
        },
      ],
    },
    {
      name: "scripts",
      files: [
        {
          path: "backup.sh", lang: "sh", lines: [
            "#!/usr/bin/env bash",
            "set -euo pipefail",
            "",
            "src=\"${1:?usage: backup.sh <dir>}\"",
            "dest=\"$HOME/backups\"",
            "name=\"$(basename \"$src\")\"",
            "stamp=\"$(date +%Y-%m-%d_%H%M)\"",
            "",
            "mkdir -p \"$dest\"",
            "tar -czf \"$dest/$name-$stamp.tar.gz\" \\",
            "  -C \"$(dirname \"$src\")\" \"$name\"",
            "",
            "# keep only the 7 newest archives",
            "ls -1t \"$dest\"/*.tar.gz | tail -n +8 | xargs -r rm --",
            "echo \"saved $name-$stamp.tar.gz\"",
          ],
        },
        {
          path: "zsh", term: true, lines: [
            "$ ./backup.sh ~/notes",
            "saved notes-2026-11-24_2239.tar.gz",
            "$ ls ~/backups | wc -l",
            "7",
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
