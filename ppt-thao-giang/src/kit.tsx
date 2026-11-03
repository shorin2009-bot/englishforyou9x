import React from "react";
import {
  Sequence,
  interpolate,
  random,
  spring,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";

export const FPS = 30;
/** giây -> frame */
export const s = (sec: number) => Math.round(sec * FPS);

export const C = {
  navy: "#0B1437",
  navy2: "#1B2A6B",
  mint: "#3DF5B5",
  yellow: "#FFD23F",
  pink: "#FF4D8D",
  red: "#E5251B",
  orange: "#FF7A1A",
  cyan: "#38D5FF",
  white: "#FFFFFF",
  ink: "#111111",
};

export const FONT = '"Inter Display", "Inter", "Be Vietnam Pro", sans-serif';

/* ------------------------------------------------------------------ */
/* Icons (stroke icons 24x24, dạng lucide)                              */
/* ------------------------------------------------------------------ */
const PATHS: Record<string, string[]> = {
  ban: ["M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20z", "M4.93 4.93l14.14 14.14"],
  xCircle: ["M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20z", "M15 9l-6 6", "M9 9l6 6"],
  alert: [
    "M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z",
    "M12 9v4",
    "M12 17h.01",
  ],
  thumbsDown: [
    "M10 15v4a3 3 0 0 0 3 3l4-9V2H5.72a2 2 0 0 0-2 1.7l-1.38 9a2 2 0 0 0 2 2.3z",
    "M17 2h2.67A2.31 2.31 0 0 1 22 4v7a2.31 2.31 0 0 1-2.33 2H17",
  ],
  sparkles: [
    "M12 3l1.9 5.1L19 10l-5.1 1.9L12 17l-1.9-5.1L5 10l5.1-1.9z",
    "M19 15l.8 2.2L22 18l-2.2.8L19 21l-.8-2.2L16 18l2.2-.8z",
  ],
  image: [
    "M5 3h14a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2z",
    "M8.5 7.5a1 1 0 1 0 0 2 1 1 0 0 0 0-2z",
    "M21 15l-5-5L5 21",
  ],
  checkSquare: [
    "M9 11l3 3L22 4",
    "M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11",
  ],
  message: [
    "M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z",
  ],
  star: ["M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"],
  trash: [
    "M3 6h18",
    "M8 6V4a1 1 0 0 1 1-1h6a1 1 0 0 1 1 1v2",
    "M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6",
    "M10 11v6",
    "M14 11v6",
  ],
  presentation: ["M2 3h20", "M21 3v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V3", "M8 21l4-4 4 4"],
  gamepad: [
    "M6 11h4",
    "M8 9v4",
    "M15 12h.01",
    "M18 10h.01",
    "M17.32 5H6.68a4 4 0 0 0-3.978 3.59C2.604 9.416 2 14.456 2 16a3 3 0 0 0 3 3c1 0 1.5-.5 2-1l1.414-1.414A2 2 0 0 1 9.828 16h4.344a2 2 0 0 1 1.414.586L17 18c.5.5 1 1 2 1a3 3 0 0 0 3-3c0-1.545-.604-6.584-.685-7.258A4 4 0 0 0 17.32 5z",
  ],
  book: [
    "M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z",
    "M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z",
  ],
  droplet: [
    "M12 22a7 7 0 0 0 7-7c0-2-1-3.9-3-5.5s-3.5-4-4-6.5c-.5 2.5-2 4.9-4 6.5C6 11.1 5 13 5 15a7 7 0 0 0 7 7z",
  ],
  bulb: [
    "M15 14c.2-1 .7-1.7 1.5-2.5 1-.9 1.5-2.2 1.5-3.5A6 6 0 0 0 6 8c0 1 .2 2.2 1.5 3.5.7.7 1.3 1.5 1.5 2.5",
    "M9 18h6",
    "M10 22h4",
  ],
  cursor: ["M3 3l7.07 16.97 2.51-7.39 7.39-2.51L3 3z"],
};

export const Icon: React.FC<{
  name: keyof typeof PATHS;
  size?: number;
  color?: string;
  stroke?: number;
  fill?: string;
  style?: React.CSSProperties;
}> = ({ name, size = 64, color = "#fff", stroke = 2.2, fill = "none", style }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill={fill}
    stroke={color}
    strokeWidth={stroke}
    strokeLinecap="round"
    strokeLinejoin="round"
    style={{ display: "block", ...style }}
  >
    {PATHS[name].map((d, i) => (
      <path key={i} d={d} />
    ))}
  </svg>
);

/* ------------------------------------------------------------------ */
/* Kinetic text                                                         */
/* ------------------------------------------------------------------ */
/** Một từ nảy ra với spring + xoay nhẹ. `at` = frame (tương đối Sequence). */
export const Pop: React.FC<{
  at?: number;
  color?: string;
  size?: number;
  stroke?: number;
  children: React.ReactNode;
  style?: React.CSSProperties;
}> = ({ at = 0, color = "#fff", size = 112, stroke = 14, children, style }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const p = spring({
    frame: frame - at,
    fps,
    config: { damping: 9, stiffness: 240, mass: 0.7 },
  });
  return (
    <span
      style={{
        display: "inline-block",
        position: "relative",
        opacity: frame >= at ? 1 : 0,
        fontFamily: FONT,
        fontWeight: 900,
        fontSize: size,
        lineHeight: 1.02,
        letterSpacing: -2,
        color,
        WebkitTextStroke: `${stroke}px ${C.ink}`,
        paintOrder: "stroke fill",
        textShadow: "0 10px 0 rgba(0,0,0,.28)",
        transform: `translateY(${(1 - p) * 70}px) scale(${interpolate(p, [0, 1], [0.35, 1])}) rotate(${(1 - p) * -9}deg)`,
        ...style,
      }}
    >
      {children}
    </span>
  );
};

/** Khung headline, hiện trong [from, to] giây, tự thu nhỏ khi thoát. */
export const Chunk: React.FC<{
  from: number;
  to: number;
  children: React.ReactNode;
  top?: number;
  height?: number;
}> = ({ from, to, children, top = 170, height = 400 }) => (
  <Sequence from={s(from)} durationInFrames={Math.max(1, s(to) - s(from))} layout="none">
    <ChunkInner top={top} height={height}>
      {children}
    </ChunkInner>
  </Sequence>
);

const ChunkInner: React.FC<{ children: React.ReactNode; top: number; height: number }> = ({
  children,
  top,
  height,
}) => {
  const frame = useCurrentFrame();
  const { durationInFrames } = useVideoConfig();
  const out = interpolate(frame, [durationInFrames - 5, durationInFrames], [1, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  return (
    <div
      style={{
        position: "absolute",
        left: 50,
        right: 50,
        top,
        height,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        gap: 16,
        opacity: out,
        transform: `scale(${1 + (1 - out) * 0.12})`,
      }}
    >
      {children}
    </div>
  );
};

export const Line: React.FC<{ children: React.ReactNode; gap?: number }> = ({
  children,
  gap = 24,
}) => <div style={{ display: "flex", gap, alignItems: "center", justifyContent: "center" }}>{children}</div>;

/* ------------------------------------------------------------------ */
/* Tiện ích chuyển động                                                 */
/* ------------------------------------------------------------------ */
export const shake = (frame: number, amp: number) => ({
  x: (Math.sin(frame * 7.3) + 0.5 * Math.sin(frame * 13.1)) * amp,
  y: Math.cos(frame * 9.7) * amp * 0.7,
  r: Math.sin(frame * 5.1) * amp * 0.08,
});

/** spring bật nhanh dùng chung */
export const useSpring = (start: number, damping = 11, stiffness = 200) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  return spring({ frame: frame - start, fps, config: { damping, stiffness, mass: 0.8 } });
};

/** Lớp nhấp nháy trắng/đỏ tại một thời điểm */
export const Flash: React.FC<{ at: number; color?: string; dur?: number; max?: number }> = ({
  at,
  color = "#fff",
  dur = 9,
  max = 0.85,
}) => {
  const frame = useCurrentFrame();
  if (frame < at) return null;
  const o = interpolate(frame - at, [0, dur], [max, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  return <div style={{ position: "absolute", inset: 0, background: color, opacity: o, pointerEvents: "none" }} />;
};

/** Confetti rơi, xác định bằng random(seed) nên render ổn định */
export const Confetti: React.FC<{ start: number; count?: number }> = ({ start, count = 46 }) => {
  const frame = useCurrentFrame();
  const t = frame - start;
  if (t < 0) return null;
  const colors = [C.mint, C.yellow, C.pink, C.cyan, "#fff"];
  return (
    <>
      {Array.from({ length: count }).map((_, i) => {
        const x0 = random(`cx${i}`) * 1080;
        const vx = (random(`cv${i}`) - 0.5) * 6;
        const delay = random(`cd${i}`) * 14;
        const tt = Math.max(0, t - delay);
        const y = -60 + tt * (7 + random(`cy${i}`) * 7) + tt * tt * 0.05;
        const w = 14 + random(`cw${i}`) * 16;
        return (
          <div
            key={i}
            style={{
              position: "absolute",
              left: x0 + vx * tt,
              top: y,
              width: w,
              height: w * 0.55,
              borderRadius: 3,
              background: colors[i % colors.length],
              opacity: tt > 0 ? 1 : 0,
              transform: `rotate(${tt * (6 + random(`cr${i}`) * 10)}deg)`,
            }}
          />
        );
      })}
    </>
  );
};
