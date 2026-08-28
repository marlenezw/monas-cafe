import React from "react";
import { useCurrentFrame, interpolate, Easing } from "remotion";

export const THEME = {
  bg: "#17130f",
  chrome: "#221b16",
  text: "#e9e2d8",
  muted: "#948578",
  green: "#4ec26f",
  red: "#ff6a5e",
  yellow: "#e0b341",
  blue: "#6cb6ff",
  caramel: "#e3a869",
  cream: "#fdf7ef",
  line: "#332821"
};

export type Seg = { t: string; c?: string; b?: boolean };

export type Line =
  | { kind: "cmd"; segs: Seg[]; prompt?: string; pause?: number }
  | { kind: "out"; segs: Seg[] }
  | { kind: "gap" };

/** Convenience builders */
export const cmd = (segs: Seg[], prompt?: string, pause?: number): Line => ({
  kind: "cmd",
  segs,
  prompt,
  pause
});
export const out = (segs: Seg[]): Line => ({ kind: "out", segs });
export const gap = (): Line => ({ kind: "gap" });
export const s = (t: string, c?: string, b?: boolean): Seg => ({ t, c, b });

type Scheduled = {
  line: Line;
  start: number;   // frame the line begins
  end: number;     // frame the line is fully revealed
  chars: number;
};

const lineChars = (l: Line) =>
  l.kind === "gap" ? 0 : l.segs.reduce((n, x) => n + x.t.length, 0);

/**
 * Lays out the timeline: commands type character-by-character, output lines
 * stream in with a stagger. Returns the schedule plus total duration.
 */
export const schedule = (
  lines: Line[],
  opts: { startDelay?: number; cps?: number; pauseAfterCmd?: number; outStagger?: number } = {}
) => {
  const { startDelay = 18, cps = 2.6, pauseAfterCmd = 22, outStagger = 4 } = opts;
  let t = startDelay;
  const items: Scheduled[] = [];

  for (const line of lines) {
    const chars = lineChars(line);
    if (line.kind === "cmd") {
      const dur = Math.ceil(chars / cps);
      items.push({ line, start: t, end: t + dur, chars });
      t += dur + (line.pause ?? pauseAfterCmd);
    } else if (line.kind === "gap") {
      items.push({ line, start: t, end: t, chars: 0 });
      t += outStagger;
    } else {
      items.push({ line, start: t, end: t, chars });
      t += outStagger;
    }
  }
  return { items, total: t };
};

const Segments: React.FC<{ segs: Seg[]; reveal: number }> = ({ segs, reveal }) => {
  let used = 0;
  return (
    <>
      {segs.map((seg, i) => {
        const remaining = Math.max(0, reveal - used);
        const shown = seg.t.slice(0, Math.floor(remaining));
        used += seg.t.length;
        if (!shown) return null;
        return (
          <span
            key={i}
            style={{ color: seg.c ?? THEME.text, fontWeight: seg.b ? 700 : 400 }}
          >
            {shown}
          </span>
        );
      })}
    </>
  );
};

const Cursor: React.FC<{ frame: number }> = ({ frame }) => (
  <span
    style={{
      display: "inline-block",
      width: "0.58em",
      height: "1.05em",
      marginLeft: 2,
      verticalAlign: "text-bottom",
      background: THEME.caramel,
      opacity: Math.floor(frame / 15) % 2 === 0 ? 1 : 0.15
    }}
  />
);

export const Terminal: React.FC<{
  lines: Line[];
  title: string;
  opts?: Parameters<typeof schedule>[1];
  fontSize?: number;
  width?: number;
}> = ({ lines, title, opts, fontSize = 26, width = 1620 }) => {
  const frame = useCurrentFrame();
  const { items } = schedule(lines, opts);
  const lh = fontSize * 1.55;

  // Height is derived from the full script so the box never resizes mid-clip
  // and nothing ever needs to scroll out of view.
  const contentHeight = items.reduce(
    (h, it) => h + (it.line.kind === "gap" ? lh * 0.55 : lh),
    0
  );

  // The last visible line carries the cursor.
  const activeIdx = items.filter((it) => frame >= it.start).length - 1;

  return (
    <div
      style={{
        width,
        borderRadius: 16,
        overflow: "hidden",
        background: THEME.bg,
        boxShadow: "0 50px 90px -40px rgba(60,40,25,.55), 0 0 0 1px rgba(60,40,25,.10)",
        fontFamily: "Monaspace Neon, ui-monospace, SFMono-Regular, monospace"
      }}
    >
      {/* title bar */}
      <div
        style={{
          height: 54,
          background: THEME.chrome,
          display: "flex",
          alignItems: "center",
          padding: "0 20px",
          borderBottom: `1px solid ${THEME.line}`
        }}
      >
        <div style={{ display: "flex", gap: 9 }}>
          {["#ff5f57", "#febc2e", "#28c840"].map((c) => (
            <div key={c} style={{ width: 14, height: 14, borderRadius: "50%", background: c }} />
          ))}
        </div>
        <div
          style={{
            flex: 1,
            textAlign: "center",
            color: THEME.muted,
            fontSize: 17,
            letterSpacing: ".02em",
            marginLeft: -60
          }}
        >
          {title}
        </div>
      </div>

      {/* content */}
      <div style={{ height: contentHeight + 56, padding: "28px 34px" }}>
        <div>
          {items.map((it, i) => {
            if (frame < it.start) return null;
            const { line } = it;

            if (line.kind === "gap") return <div key={i} style={{ height: lh * 0.55 }} />;

            const reveal =
              line.kind === "cmd"
                ? interpolate(frame, [it.start, it.end], [0, it.chars], {
                    extrapolateLeft: "clamp",
                    extrapolateRight: "clamp",
                    easing: Easing.linear
                  })
                : it.chars;

            const isTyping = line.kind === "cmd" && frame < it.end;
            const showCursor = i === activeIdx && (isTyping || line.kind === "cmd");

            return (
              <div
                key={i}
                style={{
                  fontSize,
                  lineHeight: `${lh}px`,
                  color: THEME.text,
                  whiteSpace: "pre",
                  letterSpacing: "-.01em"
                }}
              >
                {line.kind === "cmd" && (
                  <span style={{ color: THEME.green, fontWeight: 700 }}>
                    {line.prompt ?? "➜  monas-cafe "}
                  </span>
                )}
                <Segments segs={line.segs} reveal={reveal} />
                {showCursor && <Cursor frame={frame} />}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
