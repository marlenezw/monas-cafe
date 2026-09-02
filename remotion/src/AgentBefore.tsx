import React from "react";
import { Terminal, THEME, cmd, out, gap, s } from "./Terminal";

const { text, muted, red, yellow, caramel } = THEME;

const PROMPT = "➜  app ";
const CONT = "     ";

/** The agent's own voice, in the style of a CLI coding agent. */
const agent = (line: string) => out([s("● ", caramel, true), s(line, text)]);

/**
 * "Before" — gh 2.96, no --attach.
 *
 * An agent reproduces a bug with Playwright, gets a screenshot out of the
 * run, and then has nowhere to put it. The last line is the whole point:
 * it falls back to describing an image it is already holding.
 *
 * Deliberately carries no Mona's Cafe branding so it can open a talk.
 */
export const AGENT_BEFORE_LINES = [
  agent("Running the test suite to reproduce the bug."),
  gap(),
  cmd([s("npx playwright test", text)], PROMPT),
  out([s("Running 3 tests using 3 workers", muted)]),
  gap(),
  out([
    s("  ✘  ", red),
    s("1 [chromium] › tests/checkout.spec.ts:10 › prices render as currency ", text),
    s("(1.0s)", muted)
  ]),
  gap(),
  out([s("    Error: ", red, true), s("10 of 10 prices failed to parse", text)]),
  out([s("    Received: ", muted), s('["$NaN", "$NaN", "$NaN", …]', red)]),
  gap(),
  out([s("    attachment #1: screenshot (image/png)", yellow)]),
  out([s("    test-results/screenshots/", muted), s("prices.png", caramel, true)]),
  gap(),
  out([s("  1 failed", red, true)]),
  gap(),
  agent("Reproduced. Attaching the screenshot to the issue."),
  gap(),
  cmd([s("gh issue comment 1 ", text), s("\\", muted)], PROMPT, 0),
  cmd([s("--body ", text), s('"Prices render as $NaN:"', caramel), s(" \\", muted)], CONT, 0),
  cmd([s("--attach ", text), s("./test-results/screenshots/prices.png", caramel)], CONT),
  gap(),
  out([s("unknown flag: --attach", red, true)]),
  out([s("exit status 1", red)]),
  gap(),
  agent("I can't upload the screenshot. Falling back to a description.")
];

export const AgentBefore: React.FC = () => (
  <Terminal
    lines={AGENT_BEFORE_LINES}
    opts={{ startDelay: 20, cps: 2.4, pauseAfterCmd: 28, outStagger: 9 }}
    fontSize={28}
    full
  />
);
