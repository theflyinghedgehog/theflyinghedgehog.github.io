# matte@arch — portfolio

Matteo Babini's personal site: a retro console / Arch terminal look in Catppuccin Frappé. Plain HTML, CSS and JavaScript, no build step. three.js loads from a CDN for the 3D laptop in the hero.

## Structure

```
.
├── index.html        page layout and static text
├── favicon.svg       the MB pixel logo
├── css/style.css     all styles (Catppuccin Frappé palette at the top)
└── js/
    ├── projects.js   your details: GitHub username, email, skills, project notes
    ├── main.js       project cards (from the GitHub API), GitHub section, clock, nav
    ├── laptop3d.js   the 3D ThinkPad T470 in the hero
    ├── bgcode.js     the code being typed in the background
    ├── effects.js    typed prompts, heading scramble, countdown, card tilt
    └── scrollfx.js   scroll-linked motion
```

## Updating content

Everything that changes often lives in `js/projects.js`:

- `github` and `email`
- `skills`: the inventory list in About
- `hideRepos`: public repos you never want shown
- `projects`: optional notes per repo (better name, description, "why"). These also show if GitHub can't be reached.

Project cards come from your **public** GitHub repos automatically, newest first. To choose which ones appear, add the topic `portfolio` to those repos on GitHub.

## Running locally

The 3D laptop is an ES module, which browsers won't load from `file://`, so serve the folder:

```bash
python3 -m http.server 8765
```

Then open http://localhost:8765.

## Deploying

It's a static site, so any static host works.

**GitHub Pages:** push this folder to a public repo named `theflyinghedgehog.github.io`, then turn on Pages in **Settings → Pages** from the `main` branch. The site will be at https://theflyinghedgehog.github.io.

**Netlify / Cloudflare Pages / Vercel:** point them at the repo (or drag the folder in). There's no build command, and the publish directory is the repo root.
