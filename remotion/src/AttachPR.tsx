import React from "react";
import { Terminal, THEME, cmd, out, gap, s } from "./Terminal";

const { text, muted, green, caramel } = THEME;

/**
 * gh pr create --attach — a screenshot lands in the pull request body.
 * Command and output mirror the real run that produced monas-cafe#2.
 */
export const ATTACH_PR_LINES = [
  cmd([s("gh pr create ", text), s("\\", muted)], undefined, 0),
  cmd(
    [s("--title ", text), s('"Fix: prices render as $NaN"', caramel), s(" \\", muted)],
    "     ",
    0
  ),
  cmd(
    [s("--body ", text), s('"Fixes #1. parseFloat choked on the $."', caramel), s(" \\", muted)],
    "     ",
    0
  ),
  cmd(
    [
      s("--attach ", text),
      s("'evidence/after.png", caramel),
      s("#Prices render correctly'", green)
    ],
    "     ",
    46
  ),
  gap(),
  out([s("https://github.com/marlenezw/monas-cafe/pull/2", text)]),
  gap(),
  out([s("✓ ", green, true), s("Screenshot embedded in the pull request.", muted)])
];

export const AttachPR: React.FC = () => (
  <Terminal
    lines={ATTACH_PR_LINES}
    opts={{ startDelay: 20, cps: 2.2, pauseAfterCmd: 30, outStagger: 12 }}
    fontSize={40}
    full
  />
);
