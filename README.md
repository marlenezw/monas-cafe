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

The site is served at **http://127.0.0.1:4173** (`index.html`, `menu.html`).
`serve.py` is a static file server with HTTP Range support so embedded videos can
be scrubbed. It serves files from the hard-coded `ROOT` path in `serve.py`, so
update `ROOT` if your checkout lives somewhere else.

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
| `PORT` | `serve.py` | `4173` | Port the static server listens on (bound to `127.0.0.1`). |
| `ROOT` | `serve.py` | main checkout path | Directory the server serves files from. |
| `?fixed=1` | `menu.html` URL | off | Renders the corrected build (strips `$` before parsing) for before/after comparisons. |
| Tax rate | `assets/js/menu.js` | `8.75%` | Added to the subtotal to compute the order total. |
| `MENU` | `assets/js/menu.js` | 3 sections | Menu data: **Espresso Bar**, **Brew Bar** and **From the Bakery**. |

## Repository layout

- `index.html`, `menu.html`, `assets/` — the website (CSS, fonts, images, JS).
- `tests/` — Playwright tests; `playwright.config.ts` — test config.
- `clips/`, `remotion/`, `scripts/`, `demo-agent/` — demo recordings and the tools
  used to produce them.
- `.github/skills/monitor_and_fix_bugs/` — an agent skill that sweeps the site for bugs.
