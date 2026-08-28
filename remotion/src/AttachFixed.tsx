import React from "react";
import { Terminal, THEME, cmd, out, gap, s } from "./Terminal";
import { Scene } from "./Scene";

const { text, muted, green, caramel } = THEME;

/**
 * The payoff — gh 2.99.0 with --attach. Output copied verbatim from the
 * actual run against marlenezw/monas-cafe#1.
 */
export const ATTACH_FIXED_LINES = [
  cmd([s("gh --version", text)]),
  out([s("gh version 2.99.0 ", muted), s("(2026-08-26)", green, true)]),
  gap(),
  cmd([s("gh issue comment 1 ", text), s("\\", muted)], undefined, 0),
  cmd(
    [s("--body ", text), s('"Playwright caught this:"', caramel), s(" \\", muted)],
    "     ",
    0
  ),
  cmd(
    [
      s("--attach ", text),
      s("'./test-results/screenshots/menu-prices.png", caramel),
      s("#Menu board showing $NaN'", green)
    ],
    "     ",
    40
  ),
  gap(),
  out([
    s("https://github.com/marlenezw/monas-cafe/issues/1", text),
    s("#issuecomment-5452684943", caramel)
  ]),
  gap(),
  out([s("✓ ", green, true), s("Screenshot attached, alt text and all.", muted)])
];

export const AttachFixed: React.FC = () => (
  <Scene
    sub="Step 3 — with gh 2.99"
    caption="One flag, and the screenshot lands on the issue"
  >
    <Terminal
      title="monas-cafe — gh issue comment --attach"
      lines={ATTACH_FIXED_LINES}
      opts={{ startDelay: 20, cps: 2.2, pauseAfterCmd: 30, outStagger: 12 }}
      fontSize={25}
    />
  </Scene>
);
