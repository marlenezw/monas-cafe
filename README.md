# Java Coffee Demo

A polished mobile-first coffee customization flow built as a static HTML, CSS,
and JavaScript app. The narrow-phone baseline intentionally reproduces a layout
defect: at viewport widths of 375px or less, the final customization field is
obscured by the sticky **Add to order** bar.

## Preview

Run the included static server:

```bash
npm start
```

Open:

- App: <http://127.0.0.1:8080/menu.html>
- Desktop phone frame: <http://127.0.0.1:8080/demo.html>

## Intentional issue

Open `menu.html` at a 360-375px phone width and scroll to the bottom. The
special instructions field continues behind the sticky order bar. The framed
demo opens directly at this state and labels the 59px collision outside the
phone. The defect is kept in the `@media (max-width: 375px)` rule in
`assets/css/java.css`; do not remove it from this baseline branch.

The customer-submitted reproduction is stored at:

`assets/img/customer-narrow-phone-order-bar-overlap.png`

## Tests

```bash
npm install
npm test
```

The Playwright tests cover dynamic pricing, quantity and add-on interactions,
the intended narrow-phone overlap, and the desktop demo frame.

## Repository layout

- `menu.html` — interactive Java coffee customization app.
- `demo.html` — clean desktop canvas with a realistic phone frame.
- `assets/css/java.css`, `assets/js/java.js` — Java app styles and behavior.
- `assets/img/customer-narrow-phone-order-bar-overlap.png` — reproduced issue.
- `tests/menu.spec.ts` — mobile interaction and baseline layout checks.
