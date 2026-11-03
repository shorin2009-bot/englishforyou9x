import React from "react";
import {
  AbsoluteFill,
  Audio,
  Easing,
  Freeze,
  OffthreadVideo,
  Sequence,
  interpolate,
  random,
  staticFile,
  useCurrentFrame,
} from "remotion";
import {
  C,
  Chunk,
  Confetti,
  FONT,
  Flash,
  Icon,
  Line,
  Pop,
  s,
  shake,
  useSpring,
} from "./kit";

/** Tổng thời lượng ≈ 39.7s @30fps */
export const A_FRAMES = 365; // footage chính thức 1 (12.17s), giữ nguyên
export const B_FRAMES = 503; // footage chính thức 2 (16.77s), giữ nguyên
export const A_START = s(9.24);
export const B_START = A_START + A_FRAMES;
export const HOLD = 45; // giữ khung cuối 1.5s cho end card
export const TOTAL_FRAMES = B_START + B_FRAMES + HOLD;
const END = TOTAL_FRAMES / 30;

/* ================================================================== */
/* ÂM THANH                                                            */
/* ================================================================== */
const SFX: Array<[name: string, at: number, vol: number]> = [
  ["pop", 0.1, 0.3],
  ["pop", 0.35, 0.3],
  ["pop", 0.6, 0.3],
  ["pop", 0.82, 0.3],
  ["pop", 1.06, 0.3],
  ["hit", 1.3, 0.55],
  ["pop", 2.0, 0.3],
  ["pop", 2.24, 0.3],
  ["pop", 2.48, 0.3],
  ["pop", 2.72, 0.3],
  ["buzz", 3.32, 0.4],
  ["pop", 3.84, 0.3],
  ["pop", 4.3, 0.3],
  ["pop", 4.5, 0.3],
  ["pop", 4.8, 0.3],
  ["pop", 5.2, 0.3],
  ["hit", 6.34, 1],
  ["whoosh", 7.75, 0.55],
  ["glitch", 8.95, 0.6],
  ["whoosh", 9.12, 0.8],
  ["sparkle", 9.3, 0.55],
  ["ding", 9.3, 0.45],
  ["whoosh", 10.22, 0.4],
  ["pop", 10.5, 0.5],
  ["whoosh", 11.32, 0.4],
  ["pop", 11.1, 0.5],
  ["pop", 11.7, 0.5],
  ["whoosh", 12.3, 0.5],
  ["whoosh", 12.52, 0.4],
  ["pop", 12.45, 0.4],
  ["ding", 13.05, 0.7],
  ["whoosh", 13.95, 0.45],
  ["pop", 14.05, 0.45],
  ["whoosh", 18.25, 0.45],
  ["pop", 18.35, 0.45],
  ["whoosh", 21.55, 0.45],
  ["pop", 21.65, 0.45],
  ["whoosh", 24.35, 0.45],
  ["pop", 24.45, 0.45],
  ["whoosh", 27.95, 0.45],
  ["pop", 28.05, 0.45],
  ["sparkle", 33.35, 0.6],
  ["ding", 33.4, 0.6],
  ["whoosh", 36.0, 0.5],
  ["ding", 36.85, 0.7],
  ["sparkle", 37.3, 0.45],
];

const Sound: React.FC = () => (
  <>
    <Audio src={staticFile("media/voice.mp3")} volume={1} />
    {SFX.map(([name, at, vol], i) => (
      <Sequence key={i} from={s(at)} durationInFrames={s(1.5)} layout="none">
        <Audio src={staticFile(`sfx/${name}.wav`)} volume={vol} />
      </Sequence>
    ))}
    <Sequence from={s(9.0)} durationInFrames={TOTAL_FRAMES - s(9.0)} layout="none">
      <Audio
        src={staticFile("sfx/bed.wav")}
        volume={(f) =>
          interpolate(f, [0, 20, TOTAL_FRAMES - s(9.0) - 45, TOTAL_FRAMES - s(9.0)], [0, 0.2, 0.2, 0], {
            extrapolateLeft: "clamp",
            extrapolateRight: "clamp",
          })
        }
      />
    </Sequence>
  </>
);

/* ================================================================== */
/* Thành phần nhỏ                                                      */
/* ================================================================== */
/** Icon nảy ra ở vị trí tuyệt đối */
const IconPop: React.FC<{
  at: number;
  name: React.ComponentProps<typeof Icon>["name"];
  color: string;
  size?: number;
  left?: number;
  top?: number;
  right?: number;
  rot?: number;
}> = ({ at, name, color, size = 120, left, top, right, rot = 0 }) => {
  const frame = useCurrentFrame();
  const p = useSpring(s(at), 8, 220);
  return (
    <div
      style={{
        position: "absolute",
        left,
        top,
        right,
        opacity: frame >= s(at) ? 1 : 0,
        transform: `scale(${p}) rotate(${rot + Math.sin(frame / 6) * 4}deg)`,
        filter: "drop-shadow(0 10px 0 rgba(0,0,0,.25))",
      }}
    >
      <Icon name={name} size={size} color={color} stroke={2.6} />
    </div>
  );
};

const BrandTag: React.FC = () => (
  <div
    style={{
      position: "absolute",
      top: 112,
      left: 0,
      right: 0,
      display: "flex",
      justifyContent: "center",
    }}
  >
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: 14,
        padding: "12px 30px 12px 20px",
        borderRadius: 999,
        background: "rgba(10,14,40,.62)",
        border: "2px solid rgba(255,255,255,.35)",
      }}
    >
      <Icon name="presentation" size={38} color={C.mint} />
      <span style={{ fontFamily: FONT, fontWeight: 800, fontSize: 36, color: "#fff", letterSpacing: 0.5 }}>
        @englishforyou9x
      </span>
    </div>
  </div>
);

/* ================================================================== */
/* PHẦN 1 — "PPT sơ sài"                                               */
/* ================================================================== */
const BadWorld: React.FC = () => {
  const frame = useCurrentFrame();
  const enter = useSpring(0, 12, 160);
  const fStamp = s(6.34);
  const fFall = s(7.8);

  // rung tăng dần khi "tức", rung mạnh lúc đóng dấu
  const sh1 =
    frame >= s(3.3) && frame < fStamp
      ? shake(frame, interpolate(frame, [s(3.3), fStamp], [2, 10]))
      : { x: 0, y: 0, r: 0 };
  const hf = frame - fStamp;
  const sh2 = hf >= 0 && hf < 14 ? shake(frame, 30 * (1 - hf / 14)) : { x: 0, y: 0, r: 0 };

  // slide rơi + xoay sau khi "chuẩn bị sơ sài"
  const ff = Math.max(0, frame - fFall);
  const fallY = ff * ff * 3.6;
  const fallX = ff * 5;
  const fallR = ff * 1.7;

  const push = 1 + (frame / s(7)) * 0.06;
  const dark = interpolate(frame, [s(3.3), s(6.3)], [0, 0.45], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  // dấu đỏ
  const st = useSpring(fStamp, 7, 260);
  const stamp = frame >= fStamp;

  return (
    <AbsoluteFill
      style={{
        background: "linear-gradient(165deg,#ebe5d5 0%,#c4bca6 60%,#a79f89 100%)",
        overflow: "hidden",
      }}
    >
      {/* họa tiết sọc mờ cho nền "giấy" */}
      <AbsoluteFill
        style={{
          opacity: 0.35,
          backgroundImage:
            "repeating-linear-gradient(45deg, rgba(0,0,0,.05) 0 2px, transparent 2px 26px)",
        }}
      />
      <AbsoluteFill
        style={{
          background: `radial-gradient(circle at 50% 48%, rgba(0,0,0,0) 30%, rgba(40,0,0,${dark}) 100%)`,
        }}
      />

      {/* tiêu đề động */}
      <Chunk from={0.1} to={0.82}>
        <Line>
          <Pop at={0}>ĐÃ</Pop>
          <Pop at={7}>NÓI</Pop>
          <Pop at={15}>LÀ</Pop>
        </Line>
      </Chunk>
      <Chunk from={0.82} to={2.0}>
        <Line>
          <Pop at={0}>ĐỪNG</Pop>
          <Pop at={7}>DÙNG</Pop>
        </Line>
        <Line>
          <div style={{ position: "relative" }}>
            <Pop at={14} size={190} color={C.orange}>
              PPT
            </Pop>
            <BanOverlay at={24} />
          </div>
        </Line>
      </Chunk>
      <Chunk from={2.0} to={3.15}>
        <Line>
          <Pop at={0}>TRÊN</Pop>
          <Pop at={7}>HỌC</Pop>
        </Line>
        <Line>
          <Pop at={14}>LIỆU</Pop>
          <Pop at={22} color={C.yellow}>
            RỒI!
          </Pop>
        </Line>
      </Chunk>
      <Chunk from={3.3} to={4.5}>
        <Line>
          <Pop at={0}>MÀ</Pop>
          <Pop at={8}>KHÔNG</Pop>
        </Line>
        <Line>
          <Pop at={16}>CHỊU</Pop>
          <Pop at={28} color={C.red}>
            NGHE
          </Pop>
        </Line>
      </Chunk>
      <Chunk from={4.5} to={7.7}>
        <Line gap={22}>
          <Pop at={0} size={104}>
            KẾT
          </Pop>
          <Pop at={9} size={104}>
            QUẢ
          </Pop>
          <Pop at={20} size={104} color={C.yellow}>
            THÌ…
          </Pop>
        </Line>
      </Chunk>
      <Chunk from={7.8} to={9.05}>
        <Line>
          <Pop at={0}>CHUẨN</Pop>
          <Pop at={6}>BỊ</Pop>
        </Line>
        <Line>
          <Pop at={12} color={C.red}>
            SƠ
          </Pop>
          <Pop at={18} color={C.red}>
            SÀI
          </Pop>
        </Line>
      </Chunk>

      {/* slide xấu */}
      <div
        style={{
          position: "absolute",
          left: 60,
          top: 660,
          width: 960,
          height: 540,
          transformOrigin: "50% 50%",
          transform: `translate(${sh1.x + sh2.x + fallX}px, ${
            sh1.y + sh2.y + fallY + (1 - enter) * 500
          }px) rotate(${-2 + sh1.r + sh2.r + fallR}deg) scale(${push * (0.6 + 0.4 * enter)})`,
          boxShadow: "0 30px 70px rgba(0,0,0,.4)",
          opacity: enter,
        }}
      >
        <div
          style={{
            width: 960,
            height: 540,
            overflow: "hidden",
            border: "6px solid #9aa0a6",
            boxSizing: "border-box",
            background: "#000",
          }}
        >
          <OffthreadVideo
            src={staticFile("media/hocLieu.mp4")}
            trimBefore={s(1.2)}
            muted
            style={{ width: "100%", height: "100%", objectFit: "cover" }}
          />
        </div>
        {stamp && (
          <div
            style={{
              position: "absolute",
              left: "50%",
              top: "50%",
              transform: `translate(-50%,-50%) rotate(-13deg) scale(${interpolate(st, [0, 1], [3.2, 1])})`,
              border: `16px solid ${C.red}`,
              borderRadius: 26,
              padding: "6px 34px 12px",
              background: "rgba(255,255,255,.55)",
              color: C.red,
              fontFamily: FONT,
              fontWeight: 900,
              textAlign: "center",
              lineHeight: 1,
              opacity: Math.min(1, st * 1.6),
            }}
          >
            <div style={{ fontSize: 66, letterSpacing: 2, marginTop: 8 }}>“TIẾT DẠY</div>
            <div style={{ fontSize: 124, letterSpacing: 1 }}>CHƯA ĐẠT”</div>
          </div>
        )}
      </div>

      {/* icon "chê" */}
      <IconPop at={3.4} name="xCircle" color={C.red} left={34} top={590} rot={-14} />
      <IconPop at={4.0} name="alert" color={C.yellow} right={34} top={570} rot={12} />
      <IconPop at={4.9} name="thumbsDown" color={C.red} left={70} top={1250} rot={-10} />
      <IconPop at={8.0} name="trash" color="#5b5646" left={450} top={1320} size={150} />

      <Flash at={fStamp} color="#ff2a1a" max={0.7} dur={12} />
    </AbsoluteFill>
  );
};

/** Vòng cấm vẽ lên chữ PPT */
const BanOverlay: React.FC<{ at: number }> = ({ at }) => {
  const frame = useCurrentFrame();
  const p = interpolate(frame, [at, at + 8], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.out(Easing.back(2)),
  });
  return (
    <div
      style={{
        position: "absolute",
        left: "50%",
        top: "50%",
        transform: `translate(-50%,-50%) scale(${p})`,
        opacity: p > 0 ? 1 : 0,
        filter: "drop-shadow(0 8px 0 rgba(0,0,0,.3))",
      }}
    >
      <Icon name="ban" size={300} color={C.red} stroke={2.4} />
    </div>
  );
};

/* ================================================================== */
/* PHẦN 2 — "Đầu tư tiết dạy"                                          */
/* ================================================================== */
/** Phát nguyên bản, không cắt, không đổi tốc độ; giữ khung cuối khi hết clip. */
const FullClip: React.FC<{ src: string; frames: number; flash?: boolean }> = ({
  src,
  frames,
  flash,
}) => {
  const frame = useCurrentFrame();
  return (
    <AbsoluteFill>
      <Freeze frame={Math.min(frame, frames - 1)}>
        <OffthreadVideo
          src={staticFile(src)}
          muted
          style={{ width: "100%", height: "100%", objectFit: "cover" }}
        />
      </Freeze>
      {flash && <Flash at={0} dur={5} max={0.5} />}
    </AbsoluteFill>
  );
};

const Chip: React.FC<{
  at: number;
  icon: React.ComponentProps<typeof Icon>["name"];
  color: string;
  top: number;
  children: React.ReactNode;
}> = ({ at, icon, color, top, children }) => {
  const frame = useCurrentFrame();
  const p = useSpring(s(at), 12, 200);
  const out = interpolate(frame, [s(12.3), s(12.3) + 8], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.in(Easing.cubic),
  });
  return (
    <div
      style={{
        position: "absolute",
        top,
        left: 0,
        right: 0,
        display: "flex",
        justifyContent: "center",
        opacity: frame >= s(at) ? 1 - out : 0,
        transform: `translateX(${(1 - p) * 600 - out * 900}px)`,
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 22,
          padding: "14px 40px 14px 16px",
          borderRadius: 999,
          background: "rgba(255,255,255,.12)",
          border: `3px solid ${color}`,
          backdropFilter: "blur(6px)",
        }}
      >
        <div
          style={{
            width: 78,
            height: 78,
            borderRadius: 999,
            background: color,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <Icon name={icon} size={46} color={C.navy} stroke={2.4} />
        </div>
        <span style={{ fontFamily: FONT, fontWeight: 800, fontSize: 48, color: "#fff" }}>{children}</span>
      </div>
    </div>
  );
};

const Decor: React.FC = () => {
  const frame = useCurrentFrame();
  const items: Array<{
    n: React.ComponentProps<typeof Icon>["name"];
    x: number;
    y: number;
    c: string;
    z: number;
    d: number;
  }> = [
    { n: "sparkles", x: 40, y: 330, c: C.yellow, z: 90, d: 0 },
    { n: "star", x: 930, y: 380, c: C.pink, z: 70, d: 6 },
    { n: "sparkles", x: 920, y: 1180, c: C.mint, z: 80, d: 12 },
    { n: "star", x: 50, y: 1140, c: C.cyan, z: 64, d: 3 },
  ];
  return (
    <>
      {items.map((it, i) => {
        const p = useSpring(s(9.5) + it.d, 9, 160);
        return (
          <div
            key={i}
            style={{
              position: "absolute",
              left: it.x,
              top: it.y + Math.sin(frame / 14 + i) * 14,
              transform: `scale(${p}) rotate(${Math.sin(frame / 20 + i) * 14}deg)`,
              opacity: frame >= s(9.5) ? 1 : 0,
            }}
          >
            <Icon name={it.n} size={it.z} color={it.c} fill={it.c} stroke={1.6} />
          </div>
        );
      })}
    </>
  );
};

const CtaBlock: React.FC = () => {
  const frame = useCurrentFrame();
  const p = useSpring(s(12.4), 10, 170);
  const pulse = 1 + Math.sin(frame / 5) * 0.015;
  // hai lần con trỏ bay vào nhấp nút: giữa video và cuối video
  const flyAt = frame >= s(36.2) ? 36.4 : 12.55;
  const clickAt = flyAt + 0.45;
  const cl = (a: number[], o: number[]) =>
    interpolate(frame, a, o, {
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
      easing: Easing.out(Easing.cubic),
    });
  const click = interpolate(frame, [s(clickAt), s(clickAt + 0.06), s(clickAt + 0.2)], [1, 0.92, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const cx = cl([s(flyAt), s(clickAt)], [900, 640]);
  const cy = cl([s(flyAt), s(clickAt)], [1560, 1350]);
  const ripple = interpolate(frame - s(clickAt + 0.04), [0, 16], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const curOp = interpolate(frame, [s(flyAt), s(flyAt) + 3, s(clickAt + 0.3), s(clickAt + 0.5)], [0, 1, 1, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const sub = useSpring(s(13.9), 14, 140);

  if (frame < s(12.4)) return null;
  return (
    <>
      <div
        style={{
          position: "absolute",
          left: 0,
          right: 0,
          top: 1270,
          display: "flex",
          justifyContent: "center",
          transform: `scale(${p * click * pulse})`,
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 24,
            padding: "30px 64px",
            borderRadius: 999,
            background: `linear-gradient(90deg, ${C.mint}, ${C.cyan})`,
            boxShadow: `0 0 70px rgba(61,245,181,.65), 0 14px 0 #14a67a`,
          }}
        >
          <Icon name="message" size={78} color={C.navy} stroke={2.4} />
          <span style={{ fontFamily: FONT, fontWeight: 900, fontSize: 74, color: C.navy, letterSpacing: -1 }}>
            LIÊN HỆ NGAY
          </span>
        </div>
      </div>
      {/* sóng khi nhấp */}
      {ripple > 0 && ripple < 1 && (
        <div
          style={{
            position: "absolute",
            left: cx - 90 * ripple,
            top: cy - 90 * ripple,
            width: 180 * ripple,
            height: 180 * ripple,
            borderRadius: 999,
            border: "6px solid #fff",
            opacity: 1 - ripple,
          }}
        />
      )}
      <div
        style={{
          position: "absolute",
          left: cx,
          top: cy,
          filter: "drop-shadow(0 8px 6px rgba(0,0,0,.45))",
          opacity: curOp,
        }}
      >
        <Icon name="cursor" size={92} color="#111" fill="#fff" stroke={1.6} />
      </div>
      <div
        style={{
          position: "absolute",
          left: 0,
          right: 0,
          top: 1470,
          textAlign: "center",
          fontFamily: FONT,
          fontWeight: 700,
          fontSize: 44,
          color: "#fff",
          opacity: sub,
          transform: `translateY(${(1 - sub) * 30}px)`,
        }}
      >
        Thiết kế PPT thao giảng <span style={{ color: C.yellow }}>•</span> Game tiếng Anh
      </div>
    </>
  );
};

const Stage: React.FC<{
  from: number;
  to: number;
  icon: React.ComponentProps<typeof Icon>["name"];
  color: string;
  l1: string;
  l2: string;
}> = ({ from, to, icon, color, l1, l2 }) => (
  <Chunk from={from} to={to}>
    <Line gap={20}>
      <div style={{ marginTop: 6 }}>
        <Icon name={icon} size={96} color={color} stroke={2.4} />
      </div>
      <Pop at={0} size={104}>
        {l1}
      </Pop>
    </Line>
    <Line>
      <Pop at={7} size={104} color={color}>
        {l2}
      </Pop>
    </Line>
  </Chunk>
);

const PremiumWorld: React.FC = () => {
  const frame = useCurrentFrame();
  const cardP = useSpring(s(9.24), 13, 120);
  const bob = frame > s(10) ? Math.sin(frame / 16) * 7 : 0;
  const r = interpolate(frame, [s(9.2), s(9.8)], [0, 1900], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.out(Easing.cubic),
  });
  if (frame < s(9.2)) return null;
  const ringO = interpolate(frame, [s(9.2), s(9.8)], [1, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  return (
    <>
      <AbsoluteFill
        style={{
          clipPath: `circle(${r}px at 540px 900px)`,
          background: `linear-gradient(170deg, ${C.navy} 0%, ${C.navy2} 55%, #3b1d78 100%)`,
          overflow: "hidden",
        }}
      >
        {/* blob sáng chuyển động */}
        {[0, 1, 2].map((i) => (
          <div
            key={i}
            style={{
              position: "absolute",
              width: 700,
              height: 700,
              borderRadius: 999,
              left: 100 + i * 260 + Math.sin(frame / 40 + i * 2) * 120 - 350,
              top: 200 + i * 520 + Math.cos(frame / 46 + i) * 120 - 350,
              background: [C.mint, C.pink, C.cyan][i],
              opacity: 0.22,
              filter: "blur(120px)",
            }}
          />
        ))}
        <AbsoluteFill
          style={{
            opacity: 0.12,
            backgroundImage:
              "linear-gradient(rgba(255,255,255,.7) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.7) 1px, transparent 1px)",
            backgroundSize: "90px 90px",
          }}
        />

        <Chunk from={9.24} to={10.2}>
          <Line>
            <Pop at={0}>THÔI</Pop>
            <Pop at={6}>ĐỪNG</Pop>
          </Line>
          <Line>
            <Pop at={12} size={150} color={C.mint}>
              LO!
            </Pop>
          </Line>
        </Chunk>
        <Chunk from={10.24} to={12.3}>
          <Line>
            <Pop at={0}>MUỐN</Pop>
            <Pop at={6}>ĐẦU</Pop>
            <Pop at={12}>TƯ</Pop>
          </Line>
          <Line>
            <Pop at={18} color={C.yellow}>
              TIẾT
            </Pop>
            <Pop at={26} color={C.yellow}>
              DẠY?
            </Pop>
          </Line>
        </Chunk>
        <Chunk from={12.4} to={13.95}>
          <Line>
            <Pop at={0} size={130} color={C.mint}>
              LIÊN
            </Pop>
            <Pop at={11} size={130} color={C.mint}>
              HỆ
            </Pop>
          </Line>
          <Line>
            <Pop at={19} size={170} color={C.pink}>
              TUI!
            </Pop>
          </Line>
        </Chunk>

        {/* nhãn các giai đoạn của tiết dạy, khớp với footage */}
        <Stage from={14.0} to={18.2} icon="gamepad" color={C.cyan} l1="KHỞI ĐỘNG" l2="BẰNG TRÒ CHƠI" />
        <Stage from={18.3} to={21.5} icon="book" color={C.yellow} l1="VÀO BÀI MỚI" l2="UNIT 5!" />
        <Stage from={21.6} to={24.3} icon="sparkles" color={C.pink} l1="HỌC TỪ MỚI" l2="CÓ HÌNH THẬT" />
        <Stage from={24.4} to={27.9} icon="book" color={C.mint} l1="PHIÊN ÂM" l2="VÀ NGHĨA RÕ" />
        <Stage from={28.0} to={33.2} icon="droplet" color={C.cyan} l1="ĐOÁN NHANH" l2="ĐỒ UỐNG GÌ?" />
        <Chunk from={33.4} to={35.9}>
          <Line>
            <Pop at={0} size={150} color={C.yellow}>
              LEMONADE!
            </Pop>
          </Line>
        </Chunk>
        <Chunk from={36.0} to={END}>
          <Line>
            <Pop at={0} size={130} color={C.mint}>
              LIÊN HỆ
            </Pop>
          </Line>
          <Line>
            <Pop at={8} size={170} color={C.pink}>
              TUI NHÉ!
            </Pop>
          </Line>
        </Chunk>

        {/* khung chiếu slide thật */}
        <div
          style={{
            position: "absolute",
            left: 60,
            top: 640,
            width: 960,
            height: 540,
            borderRadius: 40,
            overflow: "hidden",
            transform: `translateY(${(1 - cardP) * 1300 + bob}px) rotate(${(1 - cardP) * 9}deg) scale(${
              0.85 + 0.15 * cardP
            })`,
            boxShadow: `0 0 0 9px #fff, 0 0 90px rgba(61,245,181,.6), 0 50px 90px rgba(0,0,0,.55)`,
            background: "#000",
          }}
        >
          <Sequence from={A_START} durationInFrames={A_FRAMES} layout="none">
            <FullClip src="media/introA.mp4" frames={A_FRAMES} />
          </Sequence>
          <Sequence from={B_START} durationInFrames={B_FRAMES + HOLD} layout="none">
            <FullClip src="media/vocabB.mp4" frames={B_FRAMES} />
          </Sequence>
        </div>

        <Decor />

        <Chip at={10.5} icon="sparkles" color={C.yellow} top={1230}>
          Hiệu ứng mượt, không rối
        </Chip>
        <Chip at={11.1} icon="image" color={C.pink} top={1336}>
          Ảnh minh hoạ đẹp mắt
        </Chip>
        <Chip at={11.7} icon="checkSquare" color={C.mint} top={1442}>
          Đúng cấu trúc tiết dạy
        </Chip>

        <CtaBlock />
        <Confetti start={s(9.3)} />
        <Confetti start={s(33.4)} count={40} />
        <Confetti start={s(36.9)} count={40} />
        <Flash at={s(9.24)} dur={10} max={0.9} />
      </AbsoluteFill>

      {/* vòng sáng viền iris */}
      <div
        style={{
          position: "absolute",
          left: 540 - r,
          top: 900 - r,
          width: r * 2,
          height: r * 2,
          borderRadius: 9999,
          border: `18px solid ${C.mint}`,
          opacity: ringO,
          boxSizing: "border-box",
          pointerEvents: "none",
        }}
      />
    </>
  );
};

/** Hiệu ứng glitch RGB ngay trước khi chuyển cảnh */
const Glitch: React.FC = () => {
  const frame = useCurrentFrame();
  if (frame < s(8.95) || frame > s(9.3)) return null;
  const k = frame - s(8.95);
  return (
    <AbsoluteFill style={{ pointerEvents: "none", mixBlendMode: "screen" }}>
      {Array.from({ length: 9 }).map((_, i) => {
        const on = random(`g${i}-${k}`) > 0.35;
        if (!on) return null;
        const y = random(`gy${i}-${k}`) * 1800;
        const h = 30 + random(`gh${i}-${k}`) * 150;
        const x = (random(`gx${i}-${k}`) - 0.5) * 180;
        return (
          <div
            key={i}
            style={{
              position: "absolute",
              left: x,
              width: 1080,
              top: y,
              height: h,
              background: i % 2 ? "rgba(255,0,110,.45)" : "rgba(0,229,255,.45)",
            }}
          />
        );
      })}
    </AbsoluteFill>
  );
};

/* ================================================================== */
/* GỘP                                                                 */
/* ================================================================== */
export const MyComposition: React.FC = () => {
  const frame = useCurrentFrame();
  return (
    <AbsoluteFill style={{ background: "#000", fontFamily: FONT }}>
      <Sound />
      {frame < s(9.9) && <BadWorld />}
      <PremiumWorld />
      <Glitch />
      <BrandTag />
    </AbsoluteFill>
  );
};
