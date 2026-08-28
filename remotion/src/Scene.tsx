import React from "react";
import { AbsoluteFill, useCurrentFrame, interpolate, staticFile, Img } from "remotion";
import { THEME } from "./Terminal";

/** Warm cafe-branded backdrop: caption on the left, Mona on the right, terminal below. */
export const Scene: React.FC<{
  caption: string;
  sub: string;
  children: React.ReactNode;
  width?: number;
}> = ({ caption, sub, children, width = 1620 }) => {
  const frame = useCurrentFrame();

  const rise = interpolate(frame, [0, 22], [30, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp"
  });
  const fade = interpolate(frame, [0, 18], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp"
  });
  const monaIn = interpolate(frame, [8, 34], [26, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp"
  });

  return (
    <AbsoluteFill style={{ background: THEME.cream }}>
      {/* awning strip, matching the site */}
      <div
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          height: 16,
          background: `repeating-linear-gradient(90deg, #c47a3d 0 46px, ${THEME.cream} 46px 92px)`
        }}
      />

      <AbsoluteFill style={{ alignItems: "center", justifyContent: "center" }}>
        <div style={{ opacity: fade, transform: `translateY(${rise}px)`, width }}>
          {/* header: caption left, Mona right */}
          <div
            style={{
              display: "flex",
              alignItems: "flex-end",
              justifyContent: "space-between",
              marginBottom: 26
            }}
          >
            <div>
              <div
                style={{
                  fontFamily: "Monaspace Neon, monospace",
                  fontSize: 20,
                  letterSpacing: ".16em",
                  textTransform: "uppercase",
                  color: "#c47a3d",
                  marginBottom: 10
                }}
              >
                {sub}
              </div>
              <div
                style={{
                  fontFamily: "Mona Sans, system-ui, sans-serif",
                  fontSize: 52,
                  fontWeight: 800,
                  letterSpacing: "-.03em",
                  color: "#2c211a"
                }}
              >
                {caption}
              </div>
            </div>

            <Img
              src={staticFile("mona-barista.png")}
              style={{
                height: 168,
                marginBottom: -8,
                transform: `translateY(${monaIn}px)`,
                filter: "drop-shadow(0 16px 22px rgba(60,40,25,.18))"
              }}
            />
          </div>

          {children}
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
