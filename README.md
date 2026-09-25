# Mona's Cafe

A small static demo website for a GitHub-themed coffee shop. It has a home page
(`index.html`) and a menu page (`menu.html`) whose prices are rendered by
`assets/js/menu.js`. The menu ships with a **deliberate pricing bug** — prices are
parsed with `parseFloat("$3.50")`, which returns `NaN` — so the site can be used to
demo automated bug-finding and fixing.

## Running the site

Requirements: Python 3 (for the server) and Node.js (only for the tests).

```bash
npm start            # runs: python3 serve.py
```

The site is served at **http://127.0.0.1:8080** (`index.html`, `menu.html`).
`serve.py` is a static file server with HTTP Range support so embedded videos can
be scrubbed. It serves files from its own directory by default; set the
`CAFE_PORT` and `CAFE_ROOT` environment variables to override the port and the
root directory.

## Tests

```bash
npm install
npx playwright install chromium
npm test             # playwright test (headless)
npm run test:headed  # same, with a visible browser
```

Tests live in `tests/menu.spec.ts` and check that menu prices and the order total
render as currency (not `NaN`) and that nothing is logged to the console. Playwright
starts `serve.py` automatically (see `playwright.config.ts`). With the bug present,
these tests fail — that's expected.

## Configuration and options

| Option | Where | Default | Description |
| --- | --- | --- | --- |
| `CAFE_PORT` | env var / `serve.py` | `8080` | Port the static server listens on (bound to `127.0.0.1`). |
| `CAFE_ROOT` | env var / `serve.py` | `serve.py`'s directory | Directory the server serves files from. |
| `?fixed=1` | `menu.html` URL | off | Renders the corrected build (strips `$` before parsing) for before/after comparisons. |
| `?tax=<rate>` | `menu.html` URL | `0.0875` | Overrides the sales tax rate used to compute the order total (e.g. `?tax=0.1` for 10%). |
| `MENU` | `assets/js/menu.js` | 4 sections | Menu data: **Espresso Bar**, **Brew Bar**, **Tea Bar** and **From the Bakery**. |

## Repository layout

- `index.html`, `menu.html`, `assets/` — the website (CSS, fonts, images, JS).
- `tests/` — Playwright tests; `playwright.config.ts` — test config.
- `clips/`, `remotion/`, `scripts/`, `demo-agent/` — demo recordings and the tools
  used to produce them.
- `.github/skills/monitor_and_fix_bugs/` — an agent skill that sweeps the site for bugs.
