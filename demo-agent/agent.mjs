// A QA agent that verifies its own fix.
//
// It runs the suite, screenshots what's broken, fixes it, reruns the suite,
// screenshots the result, and opens a PR with both images attached.
// It decides all of that. Nothing below tells it the order.

import { CopilotClient, defineTool, approveAll } from "@github/copilot-sdk";
import { z } from "zod";
import { execFile } from "node:child_process";
import { promisify } from "node:util";
import path from "node:path";
import fs from "node:fs";
import { captureMenu } from "./capture.js";

const run = promisify(execFile);

const REPO = "marlenezw/monas-cafe";
const ROOT = path.resolve(import.meta.dirname, "..");
const EVIDENCE = path.join(ROOT, "demo-agent", "evidence");
const GH = `${process.env.HOME}/gh_2.99.0-attach-preview_macOS_arm64/bin/gh`;

// --attach is the only thing this demo needs that stable gh lacks.
const DRY_RUN = process.env.DRY_RUN === "1";

const log = (icon, msg) => console.log(`  ${icon}  ${msg}`);

/* ── Tools ──────────────────────────────────────────────────────────────
   Three narrow tools. The agent gets `bash` for editing files and running
   git, but every path that touches GitHub goes through open_pr_with_evidence
   — so it can open a PR and do nothing else to the repo.                  */

const captureMenuTool = defineTool("capture_menu", {
  description:
    "Screenshot the live menu board and report every price found. " +
    "Use before and after a change to produce visual evidence. " +
    "Returns the screenshot path and whether any price is broken.",
  parameters: z.object({
    label: z
      .string()
      .describe("Short filename-safe label, e.g. 'before' or 'after'"),
  }),
  skipPermission: true,
  handler: async ({ label }) => {
    log("📸", `capture_menu(${label})`);
    const r = await captureMenu(label, EVIDENCE);
    log(
      "  ",
      `${r.broken}/${r.prices.length} prices broken · total ${r.total}`
    );
    return r;
  },
});

const runTestsTool = defineTool("run_tests", {
  description:
    "Run the Playwright suite against the cafe site. Returns pass/fail " +
    "counts and the reporter output. Exit code 1 means tests failed.",
  parameters: z.object({}),
  skipPermission: true,
  handler: async () => {
    log("🧪", "run_tests()");
    try {
      const { stdout } = await run("npx", ["playwright", "test"], {
        cwd: ROOT,
        maxBuffer: 10 * 1024 * 1024,
      });
      log("  ", "suite passed");
      return { passed: true, exitCode: 0, output: stdout.slice(-3000) };
    } catch (e) {
      const output = `${e.stdout || ""}${e.stderr || ""}`;
      const failed = (output.match(/(\d+) failed/) || [])[1] || "?";
      log("  ", `${failed} tests failed`);
      return { passed: false, exitCode: e.code ?? 1, failed, output: output.slice(-3000) };
    }
  },
});

const openPrTool = defineTool("open_pr_with_evidence", {
  description:
    "Open a pull request on the current branch with before/after screenshots " +
    "attached as visual proof the fix works. Only call this once you have " +
    "verified the fix by re-running the tests. If nothing was broken, do not " +
    "call this tool at all.",
  parameters: z.object({
    title: z.string().describe("PR title"),
    body: z
      .string()
      .describe(
        "PR body in markdown. Do not include image markdown — the screenshots are attached automatically."
      ),
    branch: z.string().describe("Branch name that holds the fix"),
    beforeScreenshot: z.string().describe("Path to the 'before' screenshot"),
    afterScreenshot: z.string().describe("Path to the 'after' screenshot"),
  }),
  handler: async (a) => {
    log("🔀", `open_pr_with_evidence("${a.title}")`);

    for (const p of [a.beforeScreenshot, a.afterScreenshot]) {
      if (!fs.existsSync(p)) return { ok: false, error: `No such screenshot: ${p}` };
    }

    const args = [
      "pr", "create",
      "--repo", REPO,
      "--head", a.branch,
      "--title", a.title,
      "--body", a.body,
      "--attach", `${a.beforeScreenshot}#Before: every price renders as $NaN`,
      "--attach", `${a.afterScreenshot}#After: prices render correctly`,
    ];

    if (DRY_RUN) {
      log("  ", "DRY_RUN — would run:");
      console.log(`      ${GH} ${args.map((x) => (/[ #]/.test(x) ? `'${x}'` : x)).join(" ")}`);
      return { ok: true, dryRun: true, url: "https://github.com/(dry-run)" };
    }

    try {
      const { stdout } = await run(GH, args, { cwd: ROOT });
      const url = stdout.trim().split("\n").pop();
      log("  ", url);
      return { ok: true, url };
    } catch (e) {
      return { ok: false, error: `${e.stdout || ""}${e.stderr || ""}`.trim() };
    }
  },
});

/* ── Agent ─────────────────────────────────────────────────────────────── */

const AGENT_PROMPT = `
You are a QA agent for the Mona's Cafe website.

You verify your own work. You never claim a fix works — you prove it with a
screenshot taken after the fix, from a real browser, with the tests passing.

How you work:
- Start by checking the current state of the menu, both with the tests and
  with your own eyes via a screenshot.
- If nothing is broken, say so and stop. Do not open a pull request. Do not
  invent work. A clean site is a valid outcome.
- If something IS broken, capture that evidence first, then find the root
  cause in the source, fix it, and re-run the tests to confirm.
- Take a second screenshot after the fix. If it still looks wrong, keep
  working — do not open a PR on an unverified fix.
- Put your change on a new branch and commit it before opening the PR.
- The PR body should explain the root cause in a sentence or two. Keep it
  short. The screenshots carry the argument.

The site is served at http://127.0.0.1:4173 and is already running.
Do not start or stop the server.
`.trim();

const TASK = `
Check whether the Mona's Cafe menu is displaying prices correctly.
If it isn't, fix it and open a pull request with visual proof that your fix works.
`.trim();

async function main() {
  fs.rmSync(EVIDENCE, { recursive: true, force: true });

  console.log("\n\x1b[1m☕ Mona's Cafe QA agent\x1b[0m");
  console.log(`   repo: ${REPO}${DRY_RUN ? "   \x1b[33m(dry run)\x1b[0m" : ""}\n`);

  const client = new CopilotClient();
  await client.start();

  const session = await client.createSession({
    model: "claude-sonnet-4.6",
    workingDirectory: ROOT,
    onPermissionRequest: approveAll,
    tools: [captureMenuTool, runTestsTool, openPrTool],
    customAgents: [
      {
        name: "cafe-qa",
        displayName: "Cafe QA",
        description: "Finds visual bugs, fixes them, and proves the fix with screenshots.",
        prompt: AGENT_PROMPT,
        tools: ["bash", "view", "edit", "grep", "glob", "capture_menu", "run_tests", "open_pr_with_evidence"],
      },
    ],
    agent: "cafe-qa",
  });

  const done = new Promise((resolve) => {
    session.on("assistant.message", (e) => {
      const text = (e.data?.content || "").trim();
      if (text) console.log(`\n\x1b[36m▌\x1b[0m ${text.replace(/\n/g, "\n\x1b[36m▌\x1b[0m ")}\n`);
    });
    session.on("tool.execution_start", (e) => {
      const name = e.data?.toolName;
      if (name === "bash") {
        const cmd = e.data?.arguments?.command || "";
        log("⚙️ ", `bash: ${cmd.split("\n")[0].slice(0, 88)}`);
      } else if (["edit", "view"].includes(name)) {
        log("✏️ ", `${name}: ${path.basename(e.data?.arguments?.path || "")}`);
      }
    });
    session.on("session.idle", resolve);
  });

  await session.send({ prompt: TASK });
  await done;

  await session.disconnect();
  await client.stop();
  console.log("\x1b[2m─ agent finished ─\x1b[0m\n");
}

main().catch((e) => {
  console.error("\n✗", e.message);
  process.exit(1);
});
