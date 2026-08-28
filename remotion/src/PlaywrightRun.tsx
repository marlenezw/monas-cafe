import React from "react";
import { Terminal, THEME, cmd, out, gap, s } from "./Terminal";
import { Scene } from "./Scene";

const { text, muted, green, red, yellow, caramel } = THEME;

/**
 * Recreates the real output of `npx playwright test` against the cafe site.
 * Text below is copied verbatim from the actual run.
 */
export const PLAYWRIGHT_LINES = [
  cmd([s("npx playwright test", text)]),
  gap(),
  out([s("Running 3 tests using 3 workers", muted)]),
  gap(),
  out([
    s("  ✘  ", red),
    s("1 ", muted),
    s("[chromium] › tests/menu.spec.ts:10:5 › menu prices render as currency, not NaN ", text),
    s("(1.0s)", muted)
  ]),
  out([
    s("  ✘  ", red),
    s("2 ", muted),
    s("[chromium] › tests/menu.spec.ts:26:5 › order total is a valid currency amount ", text),
    s("(6.0s)", muted)
  ]),
  out([
    s("  ✘  ", red),
    s("3 ", muted),
    s("[chromium] › tests/menu.spec.ts:38:5 › no pricing errors are logged to the console ", text),
    s("(950ms)", muted)
  ]),
  gap(),
  out([s("  1) ", red, true), s("menu prices render as currency, not NaN", text, true)]),
  gap(),
  out([s("    Error: ", red, true), s("10 of 10 prices failed to parse", text)]),
  gap(),
  out([s("    Expected length: ", muted), s("0", green)]),
  out([s("    Received length: ", muted), s("10", red)]),
  out([
    s("    Received array:  ", muted),
    s('["$NaN", "$NaN", "$NaN", "$NaN", "$NaN", …]', red)
  ]),
  gap(),
  out([
    s("    attachment #1: screenshot (image/png) ", yellow),
    s("──────────────", muted)
  ]),
  out([
    s("    test-results/screenshots/", muted),
    s("menu-prices.png", caramel, true)
  ]),
  gap(),
  out([s("  3 failed", red, true)])
];

export const PlaywrightRun: React.FC = () => (
  <Scene
    sub="Step 1 — reproduce"
    caption="Playwright catches the bug and screenshots it"
  >
    <Terminal
      title="monas-cafe — playwright test"
      lines={PLAYWRIGHT_LINES}
      opts={{ startDelay: 20, cps: 2.4, pauseAfterCmd: 34, outStagger: 9 }}
      fontSize={23}
    />
  </Scene>
);
