import React from "react";
import { Terminal, THEME, cmd, out, gap, s } from "./Terminal";
import { Scene } from "./Scene";

const { text, muted, red, caramel, blue } = THEME;

/**
 * Recreates the real failure from `gh` 2.96.0 — the version before --attach
 * shipped. Output copied verbatim from the actual run.
 */
export const ATTACH_ERROR_LINES = [
  cmd([s("gh --version", text)]),
  out([s("gh version 2.96.0 (2026-07-02)", muted)]),
  gap(),
  cmd(
    [s("gh issue comment 1 ", text), s("\\", muted)],
    undefined,
    0
  ),
  cmd(
    [s("--body ", text), s('"Menu error below:"', caramel), s(" \\", muted)],
    "     ",
    0
  ),
  cmd(
    [s("--attach ", text), s("./test-results/screenshots/menu-prices.png", caramel)],
    "     "
  ),
  gap(),
  out([s("unknown flag: --attach", red, true)]),
  gap(),
  out([s("Usage:  gh issue comment {<number> | <url>} [flags]", text)]),
  gap(),
  out([s("Flags:", text, true)]),
  out([s("  -b, --body text        ", blue), s("The comment body text", muted)]),
  out([
    s("  -F, --body-file file   ", blue),
    s("Read body text from file", muted)
  ]),
  out([s("      --edit-last        ", blue), s("Edit the last comment", muted)]),
  out([s("  -e, --editor           ", blue), s("Open the text editor", muted)]),
  out([s("  -w, --web              ", blue), s("Open the web browser", muted)]),
  gap(),
  out([s("exit status 1", red)])
];

export const AttachError: React.FC = () => (
  <Scene
    sub="Step 2 — the old way"
    caption="You can't attach the screenshot from the terminal"
  >
    <Terminal
      title="monas-cafe — gh issue comment"
      lines={ATTACH_ERROR_LINES}
      opts={{ startDelay: 20, cps: 2.2, pauseAfterCmd: 30, outStagger: 10 }}
      fontSize={25}
    />
  </Scene>
);
