import React from "react";
import { Composition, staticFile } from "remotion";
import { PlaywrightRun, PLAYWRIGHT_LINES } from "./PlaywrightRun";
import { AttachError, ATTACH_ERROR_LINES } from "./AttachError";
import { AttachFixed, ATTACH_FIXED_LINES } from "./AttachFixed";
import { AttachPR, ATTACH_PR_LINES } from "./AttachPR";
import { AgentBefore, AGENT_BEFORE_LINES } from "./AgentBefore";
import { schedule } from "./Terminal";

const FPS = 30;
const TAIL = 55; // frames to hold on the final state

const frames = (
  lines: Parameters<typeof schedule>[0],
  opts: Parameters<typeof schedule>[1]
) => Math.ceil(schedule(lines, opts).total + TAIL);

// Fonts are loaded once for every composition.
const fontCss = `
@font-face {
  font-family: 'Monaspace Neon';
  src: url('${staticFile("MonaspaceNeon-SemiBold.woff2")}') format('woff2');
  font-weight: 400 700;
  font-display: block;
}
@font-face {
  font-family: 'Mona Sans';
  src: url('${staticFile("MonaSans-ExtraBold.woff2")}') format('woff2');
  font-weight: 800;
  font-display: block;
}
@font-face {
  font-family: 'Mona Sans';
  src: url('${staticFile("MonaSans-Regular.woff2")}') format('woff2');
  font-weight: 400;
  font-display: block;
}
`;

export const RemotionRoot: React.FC = () => (
  <>
    <style dangerouslySetInnerHTML={{ __html: fontCss }} />

    <Composition
      id="PlaywrightRun"
      component={PlaywrightRun}
      durationInFrames={frames(PLAYWRIGHT_LINES, {
        startDelay: 20,
        cps: 2.4,
        pauseAfterCmd: 34,
        outStagger: 9
      })}
      fps={FPS}
      width={1920}
      height={1080}
    />

    <Composition
      id="AttachError"
      component={AttachError}
      durationInFrames={frames(ATTACH_ERROR_LINES, {
        startDelay: 20,
        cps: 2.2,
        pauseAfterCmd: 30,
        outStagger: 10
      })}
      fps={FPS}
      width={1920}
      height={1080}
    />

    <Composition
      id="AttachFixed"
      component={AttachFixed}
      durationInFrames={frames(ATTACH_FIXED_LINES, {
        startDelay: 20,
        cps: 2.2,
        pauseAfterCmd: 30,
        outStagger: 12
      })}
      fps={FPS}
      width={1920}
      height={1080}
    />

    <Composition
      id="AttachPR"
      component={AttachPR}
      durationInFrames={frames(ATTACH_PR_LINES, {
        startDelay: 20,
        cps: 2.2,
        pauseAfterCmd: 30,
        outStagger: 12
      })}
      fps={FPS}
      width={1920}
      height={1080}
    />

    <Composition
      id="AgentBefore"
      component={AgentBefore}
      durationInFrames={frames(AGENT_BEFORE_LINES, {
        startDelay: 20,
        cps: 2.4,
        pauseAfterCmd: 28,
        outStagger: 9
      })}
      fps={FPS}
      width={1920}
      height={1080}
    />
  </>
);
