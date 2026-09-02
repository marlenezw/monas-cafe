---
name: monitor_and_fix_bugs
description: >-
  Sweeps a running site with a visible Playwright browser. For anything broken it
  screenshots the failure, files a GitHub issue, fixes the root cause, and opens a
  PR — with before/after screenshots attached to both. Use when someone says
  "check my site", "monitor for bugs", "find and fix errors on the site".
---

# Monitor and fix bugs

Close the loop on a broken page: **find → prove → file → fix → prove again**.

## Preflight

Attaching images needs `gh` 2.99+. Check once, then use `$GH` everywhere below:

```bash
gh --version   # if older, use a 2.99+ binary (e.g. alias ghp) and set GH to it
```

Confirm the site is already running. Do not start or stop the user's server.

## 1. Sweep

Launch **headed** so the user can watch:

```js
const browser = await chromium.launch({ headless: false, slowMo: 300 });
page.on('console', m => m.type() === 'error' && errors.push(m.text()));
page.on('response', r => r.status() >= 400 && errors.push(`${r.status()} ${r.url()}`));
```

Visit every page. Flag a page as broken if any of these appear:

- `NaN`, `undefined`, `null`, `Invalid Date`, `[object Object]` in rendered text
- a visible error banner or alert
- console errors, or 4xx/5xx responses
- images that failed to load

Screenshot each broken page to `evidence/<page>-before.png`.

**If nothing is broken, say so and stop.** Open no issue, no PR.

## 2. File the issue

```bash
$GH issue create --repo OWNER/REPO \
  --title "Menu prices render as \$NaN" \
  --body "Every price on /menu.html renders as \$NaN. Seen on <date>." \
  --attach 'evidence/menu-before.png#Every price renders as $NaN'
```

Note the issue number.

## 3. Fix and verify

Branch, fix the **root cause** (not the symptom), then re-run the sweep on that
page. Only continue once it comes back clean. Screenshot to
`evidence/<page>-after.png`.

Never commit to the default branch.

## 4. Open the PR with proof

```bash
$GH pr create --repo OWNER/REPO --head BRANCH \
  --title "Fix: prices render as \$NaN" \
  --body "Fixes #<issue>. Root cause: ... Fix: ..." \
  --attach 'evidence/menu-before.png#Before: every price renders as $NaN' \
  --attach 'evidence/menu-after.png#After: prices render correctly'
```

Unreferenced attachments are appended at the bottom. To place them yourself,
write `![Before](evidence/menu-before.png)` in the body under your own headings —
`gh` rewrites the reference to the uploaded asset.

Push the branch **before** creating the PR, or it fails with `No commits between...`.

## 5. Report back on the issue

```bash
$GH issue comment <issue> --repo OWNER/REPO \
  --body "Fixed in <pr-url>." \
  --attach 'evidence/menu-after.png#Fixed: prices render correctly'
```

## Rules

- One issue per distinct bug.
- Attach the image; never just cite a local file path — nobody else can open it.
- A clean site is a valid outcome. Report it and stop.
- Never merge. Leave the PR for a human.

## Example: Mona's Cafe

`github.com/marlenezw/monas-cafe` — served at `http://127.0.0.1:4173`, with a
bug on `/menu.html` where every price renders as `$NaN`. Sweeping it should
produce an issue, a fix branch, and a PR carrying both screenshots.
