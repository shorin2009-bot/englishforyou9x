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

/* ================================================================== */
/* THỜI GIAN                                                           */
/* ================================================================== */
export const A_FRAMES = 365; // footage chính thức 1 (12.17s) — giữ nguyên
export const B_FRAMES = 503; // footage chính thức 2 (16.77s) — giữ nguyên
export const A_START = s(9.24);
export const B_START = A_START + A_FRAMES;
export const HOLD = 45; // giữ khung cuối 1.5s cho phần kêu gọi
export const TOTAL_FRAMES = B_START + B_FRAMES + HOLD;
const END = TOTAL_FRAMES / 30;

/** Khung chiếu: rộng tối đa 1080 (hết bề ngang), cao 608 = đúng 16:9 */
const CARD_TOP = 570;
const CARD_H = 608;

/** Mốc bắt đầu từng từ trong voice (giây), canh theo đường năng lượng âm thanh */
const W = {
  da: 0.1, noi: 0.26, la: 0.46,
  dung1: 0.68, dung2: 0.93, pe1: 1.2, pe2: 1.44, te: 1.7,
  tren: 2.0, hoc: 2.23, lieu: 2.46, roi: 2.62,
  ma: 3.32, khong: 3.6, chiu: 3.84, nghe: 4.28,
  ket: 4.52, qua: 4.8, thi: 5.15,
  tiet: 6.34, day: 6.49, chua: 6.82, dat: 7.37,
  chuan: 7.8, bi: 7.99, so: 8.26, sai: 8.46,
  thoi: 9.24, dung3: 9.49, lo: 9.7,
  muon: 10.24, dau: 10.6, tu: 10.75, tiet2: 10.89, day2: 11.21, thi2: 11.66,
  lien: 12.42, he: 12.78, tui: 13.02,
};
/** frame (tương đối chunk) để chữ hiện sớm 1 frame so với tiếng */
const at = (t: number, from: number) => Math.max(0, s(t) - s(from) - 1);

/* ================================================================== */
/* ÂM THANH (xem tools/make_sfx.py — toàn bộ là âm có cao độ, không nhiễu) */
/* ================================================================== */
const SFX: Array<[name: string, at: number, vol: number]> = [
  // --- phần "PPT sơ sài": nốt marimba trầm theo từng cụm chữ ---
  ["mb_57", W.da, 0.32],
  ["mb_60", W.dung1, 0.32],
  ["mb_64", W.pe1, 0.3],
  ["mb_60", W.pe2, 0.3],
  ["mb_57", W.te, 0.3],
  ["nope", 1.76, 0.5],
  ["mb_59", W.tren, 0.32],
  ["mb_55", W.ma, 0.36],
  ["mb_52", W.ket, 0.36],
  ["mb_48", W.thi, 0.4],
  ["tension", 5.72, 0.55],
  ["stamp", W.tiet, 1],
  ["womp", 7.5, 0.34],
  ["fall", W.chuan, 0.4],
  ["thud", 8.5, 0.5],
  // --- chuyển cảnh sang phần "đầu tư" ---
  ["riser", 8.8, 0.45],
  ["glitch", 8.98, 0.4],
  ["sparkle", 9.3, 0.5],
  ["ding", 9.3, 0.42],
  ["mb_72", W.thoi, 0.4],
  ["mb_76", W.muon, 0.4],
  ["pop", 10.5, 0.45],
  ["pop", 11.1, 0.45],
  ["pop", 11.7, 0.45],
  ["swipe", 12.3, 0.35],
  ["mb_79", W.lien, 0.4],
  ["pop", 12.45, 0.4],
  ["click", 13.04, 0.6],
  ["ding", 13.05, 0.5],
  // --- phần footage không voice: mỗi giai đoạn một nốt sáng + swipe ---
  ["swipe", 13.95, 0.32],
  ["mb_72", 14.05, 0.4],
  ["swipe", 18.25, 0.32],
  ["mb_74", 18.35, 0.4],
  ["swipe", 21.55, 0.32],
  ["mb_76", 21.65, 0.4],
  ["swipe", 24.35, 0.32],
  ["mb_79", 24.45, 0.4],
  ["swipe", 27.95, 0.32],
  ["mb_81", 28.05, 0.4],
  ["sparkle", 33.35, 0.55],
  ["ding", 33.4, 0.5],
  ["swipe", 36.0, 0.35],
  ["click", 36.85, 0.6],
  ["ding", 36.86, 0.55],
  ["sparkle", 37.3, 0.45],
];

const Sound: React.FC = () => (
  <>
    <Audio src={staticFile("media/voice.mp3")} volume={1} />
    {SFX.map(([name, t, vol], i) => (
      <Sequence key={i} from={s(t)} durationInFrames={s(1.6)} layout="none">
        <Audio src={staticFile(`sfx/${name}.wav`)} volume={vol} />
      </Sequence>
    ))}
    {/* nhạc nền: nhỏ khi còn voice, to hơn ở đoạn không voice */}
    <Sequence from={s(9.0)} durationInFrames={TOTAL_FRAMES - s(9.0)} layout="none">
      <Audio
        src={staticFile("sfx/bed.wav")}
        volume={(f) => {
          const abs = f + s(9.0);
          return interpolate(
            abs,
            [s(9.0), s(9.8), s(13.6), s(14.4), TOTAL_FRAMES - 45, TOTAL_FRAMES],
            [0, 0.13, 0.13, 0.26, 0.26, 0],
            { extrapolateLeft: "clamp", extrapolateRight: "clamp" },
          );
        }}
      />
    </Sequence>
  </>
);

/* ================================================================== */
/* Thành phần nhỏ                                                      */
/* ================================================================== */
const IconPop: React.FC<{
  at: number;
  name: React.ComponentProps<typeof Icon>["name"];
  color: string;
  size?: number;
  left?: number;
  top?: number;
  right?: number;
  rot?: number;
}> = ({ at: t, name, color, size = 120, left, top, right, rot = 0 }) => {
  const frame = useCurrentFrame();
  const p = useSpring(s(t), 8, 220);
  return (
    <div
      style={{
        position: "absolute",
        left,
        top,
        right,
        opacity: frame >= s(t) ? 1 : 0,
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

/** Chữ trong con dấu: hiện đúng lúc voice đọc từ đó */
const StampWord: React.FC<{ t: number; size: number; children: React.ReactNode }> = ({
  t,
  size,
  children,
}) => {
  const frame = useCurrentFrame();
  const p = useSpring(s(t) - 1, 9, 260);
  return (
    <span
      style={{
        display: "inline-block",
        fontSize: size,
        visibility: frame >= s(t) - 1 ? "visible" : "hidden",
        transform: `scale(${interpolate(p, [0, 1], [1.7, 1])})`,
        opacity: Math.min(1, p * 2),
        margin: "0 10px",
      }}
    >
      {children}
    </span>
  );
};

/* ================================================================== */
/* PHẦN 1 — "PPT sơ sài" (slide học liệu thật)                          */
/* ================================================================== */
const BadWorld: React.FC = () => {
  const frame = useCurrentFrame();
  const enter = useSpring(0, 12, 160);
  const fStamp = s(W.tiet);
  const fFall = s(W.chuan);

  const sh1 =
    frame >= s(W.ma) && frame < fStamp
      ? shake(frame, interpolate(frame, [s(W.ma), fStamp], [2, 9]))
      : { x: 0, y: 0, r: 0 };
  const hf = frame - fStamp;
  const sh2 = hf >= 0 && hf < 14 ? shake(frame, 30 * (1 - hf / 14)) : { x: 0, y: 0, r: 0 };

  const ff = Math.max(0, frame - fFall);
  const fallY = ff * ff * 3.6;
  const fallX = ff * 5;
  const fallR = ff * 1.7;

  const push = 1 + (frame / s(7)) * 0.04;
  const dark = interpolate(frame, [s(W.ma), s(6.3)], [0, 0.45], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const st = useSpring(fStamp, 7, 260);

  return (
    <AbsoluteFill
      style={{
        background: "linear-gradient(165deg,#ebe5d5 0%,#c4bca6 60%,#a79f89 100%)",
        overflow: "hidden",
      }}
    >
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

      {/* ĐÃ NÓI LÀ */}
      <Chunk from={W.da} to={W.dung1}>
        <Line>
          <Pop at={at(W.da, W.da)}>ĐÃ</Pop>
          <Pop at={at(W.noi, W.da)}>NÓI</Pop>
          <Pop at={at(W.la, W.da)}>LÀ</Pop>
        </Line>
      </Chunk>
      {/* ĐỪNG DÙNG P-P-T (mỗi chữ cái hiện đúng nhịp "pê – pê – tê") */}
      <Chunk from={W.dung1} to={W.tren}>
        <Line>
          <Pop at={at(W.dung1, W.dung1)}>ĐỪNG</Pop>
          <Pop at={at(W.dung2, W.dung1)}>DÙNG</Pop>
        </Line>
        <Line gap={8}>
          <div style={{ position: "relative", display: "flex", gap: 8 }}>
            <Pop at={at(W.pe1, W.dung1)} size={200} color={C.orange}>
              P
            </Pop>
            <Pop at={at(W.pe2, W.dung1)} size={200} color={C.orange}>
              P
            </Pop>
            <Pop at={at(W.te, W.dung1)} size={200} color={C.orange}>
              T
            </Pop>
            <BanOverlay at={at(1.76, W.dung1)} />
          </div>
        </Line>
      </Chunk>
      {/* TRÊN HỌC LIỆU RỒI! */}
      <Chunk from={W.tren} to={3.2}>
        <Line>
          <Pop at={at(W.tren, W.tren)}>TRÊN</Pop>
          <Pop at={at(W.hoc, W.tren)}>HỌC</Pop>
        </Line>
        <Line>
          <Pop at={at(W.lieu, W.tren)}>LIỆU</Pop>
          <Pop at={at(W.roi, W.tren)} color={C.yellow}>
            RỒI!
          </Pop>
        </Line>
      </Chunk>
      {/* MÀ KHÔNG CHỊU NGHE */}
      <Chunk from={W.ma} to={W.ket}>
        <Line>
          <Pop at={at(W.ma, W.ma)}>MÀ</Pop>
          <Pop at={at(W.khong, W.ma)}>KHÔNG</Pop>
        </Line>
        <Line>
          <Pop at={at(W.chiu, W.ma)}>CHỊU</Pop>
          <Pop at={at(W.nghe, W.ma)} color={C.red}>
            NGHE
          </Pop>
        </Line>
      </Chunk>
      {/* KẾT QUẢ THÌ… */}
      <Chunk from={W.ket} to={W.tiet + 0.1}>
        <Line gap={22}>
          <Pop at={at(W.ket, W.ket)} size={104}>
            KẾT
          </Pop>
          <Pop at={at(W.qua, W.ket)} size={104}>
            QUẢ
          </Pop>
          <Pop at={at(W.thi, W.ket)} size={104} color={C.yellow}>
            THÌ…
          </Pop>
        </Line>
      </Chunk>
      {/* CHUẨN BỊ SƠ SÀI */}
      <Chunk from={W.chuan} to={9.05}>
        <Line>
          <Pop at={at(W.chuan, W.chuan)}>CHUẨN</Pop>
          <Pop at={at(W.bi, W.chuan)}>BỊ</Pop>
        </Line>
        <Line>
          <Pop at={at(W.so, W.chuan)} color={C.red}>
            SƠ
          </Pop>
          <Pop at={at(W.sai, W.chuan)} color={C.red}>
            SÀI
          </Pop>
        </Line>
      </Chunk>

      {/* slide học liệu thật, full bề ngang */}
      <div
        style={{
          position: "absolute",
          left: 0,
          top: CARD_TOP,
          width: 1080,
          height: CARD_H,
          transformOrigin: "50% 50%",
          transform: `translate(${sh1.x + sh2.x + fallX}px, ${
            sh1.y + sh2.y + fallY + (1 - enter) * 500
          }px) rotate(${-1.5 + sh1.r + sh2.r + fallR}deg) scale(${push * (0.7 + 0.3 * enter)})`,
          boxShadow: "0 30px 70px rgba(0,0,0,.4)",
          opacity: enter,
        }}
      >
        <div
          style={{
            width: "100%",
            height: "100%",
            overflow: "hidden",
            borderTop: "6px solid #9aa0a6",
            borderBottom: "6px solid #9aa0a6",
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
        {frame >= fStamp && (
          <div
            style={{
              position: "absolute",
              left: "50%",
              top: "50%",
              transform: `translate(-50%,-50%) rotate(-12deg) scale(${interpolate(st, [0, 1], [3.2, 1])})`,
              border: `18px solid ${C.red}`,
              borderRadius: 30,
              padding: "10px 30px 16px",
              background: "rgba(255,255,255,.62)",
              color: C.red,
              fontFamily: FONT,
              fontWeight: 900,
              textAlign: "center",
              lineHeight: 1.02,
              whiteSpace: "nowrap",
              opacity: Math.min(1, st * 1.6),
            }}
          >
            <div>
              <StampWord t={W.tiet} size={66}>“TIẾT</StampWord>
              <StampWord t={W.day} size={66}>DẠY</StampWord>
            </div>
            <div>
              <StampWord t={W.chua} size={116}>CHƯA</StampWord>
              <StampWord t={W.dat} size={116}>ĐẠT”</StampWord>
            </div>
          </div>
        )}
      </div>

      <IconPop at={3.4} name="xCircle" color={C.red} left={30} top={440} rot={-14} />
      <IconPop at={4.0} name="alert" color={C.yellow} right={30} top={440} rot={12} />
      <IconPop at={4.9} name="thumbsDown" color={C.red} left={60} top={1210} rot={-10} />
      <IconPop at={8.0} name="trash" color="#5b5646" left={470} top={1260} size={150} />

      <Flash at={fStamp} color="#ff2a1a" max={0.7} dur={12} />
    </AbsoluteFill>
  );
};

/** Vòng cấm vẽ lên chữ PPT */
const BanOverlay: React.FC<{ at: number }> = ({ at: a }) => {
  const frame = useCurrentFrame();
  const p = interpolate(frame, [a, a + 8], [0, 1], {
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
      <Icon name="ban" size={320} color={C.red} stroke={2.4} />
    </div>
  );
};

/* ================================================================== */
/* PHẦN 2 — footage chính thức, phát nguyên bản                         */
/* ================================================================== */
const FullClip: React.FC<{ src: string; frames: number }> = ({ src, frames }) => {
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
    </AbsoluteFill>
  );
};

const Chip: React.FC<{
  at: number;
  icon: React.ComponentProps<typeof Icon>["name"];
  color: string;
  top: number;
  children: React.ReactNode;
}> = ({ at: t, icon, color, top, children }) => {
  const frame = useCurrentFrame();
  const p = useSpring(s(t), 12, 200);
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
        opacity: frame >= s(t) ? 1 - out : 0,
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

/** Trang trí hai bên tiêu đề (không đè khung footage) */
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
    { n: "sparkles", x: 14, y: 470, c: C.yellow, z: 70, d: 0 },
    { n: "star", x: 996, y: 485, c: C.pink, z: 56, d: 6 },
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
              top: it.y + Math.sin(frame / 14 + i) * 10,
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

/** Nút kêu gọi + con trỏ nhấp. `to` = lúc thoát (nếu có). */
const CtaBlock: React.FC<{ from: number; to?: number; clickAt: number; subAt: number }> = ({
  from,
  to,
  clickAt,
  subAt,
}) => {
  const frame = useCurrentFrame();
  const p = useSpring(s(from), 10, 170);
  const pulse = 1 + Math.sin(frame / 5) * 0.015;
  const out = to
    ? interpolate(frame, [s(to) - 8, s(to)], [0, 1], {
        extrapolateLeft: "clamp",
        extrapolateRight: "clamp",
        easing: Easing.in(Easing.cubic),
      })
    : 0;
  const flyAt = clickAt - 0.45;
  const click = interpolate(frame, [s(clickAt), s(clickAt + 0.06), s(clickAt + 0.2)], [1, 0.92, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const mv = (a: number, b: number) =>
    interpolate(frame, [s(flyAt), s(clickAt)], [a, b], {
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
      easing: Easing.out(Easing.cubic),
    });
  const cx = mv(900, 640);
  const cy = mv(1560, 1340);
  const ripple = interpolate(frame - s(clickAt + 0.04), [0, 16], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const curOp = interpolate(frame, [s(flyAt), s(flyAt) + 3, s(clickAt + 0.3), s(clickAt + 0.5)], [0, 1, 1, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const sub = useSpring(s(subAt), 14, 140);

  if (frame < s(from) || (to && frame >= s(to))) return null;
  return (
    <div style={{ opacity: 1 - out, transform: `translateY(${out * 260}px)` }}>
      <div
        style={{
          position: "absolute",
          left: 0,
          right: 0,
          top: 1262,
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
          top: 1462,
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
    </div>
  );
};

/** Tiêu đề giai đoạn (trên) */
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

/** Thẻ mô tả nội dung đang chiếu (dưới khung footage, vì đoạn này không có voice) */
const Desc: React.FC<{
  from: number;
  to: number;
  icon: React.ComponentProps<typeof Icon>["name"];
  color: string;
  l1: string;
  l2: string;
}> = ({ from, to, icon, color, l1, l2 }) => {
  const frame = useCurrentFrame();
  const p = useSpring(s(from) + 4, 12, 170);
  const out = interpolate(frame, [s(to) - 6, s(to)], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  if (frame < s(from) || frame >= s(to)) return null;
  return (
    <div
      style={{
        position: "absolute",
        left: 40,
        right: 40,
        top: 1226,
        opacity: (1 - out) * Math.min(1, p * 1.5),
        transform: `translateY(${(1 - p) * 160 + out * 60}px)`,
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 26,
          padding: "22px 34px 22px 22px",
          borderRadius: 48,
          background: "rgba(255,255,255,.14)",
          border: `4px solid ${color}`,
          backdropFilter: "blur(8px)",
        }}
      >
        <div
          style={{
            flex: "0 0 auto",
            width: 112,
            height: 112,
            borderRadius: 999,
            background: color,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <Icon name={icon} size={66} color={C.navy} stroke={2.3} />
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 6, minWidth: 0 }}>
          <span style={{ fontFamily: FONT, fontWeight: 900, fontSize: 48, color: "#fff", whiteSpace: "nowrap" }}>
            {l1}
          </span>
          <span
            style={{
              fontFamily: FONT,
              fontWeight: 600,
              fontSize: 37,
              color: "rgba(255,255,255,.9)",
              whiteSpace: "nowrap",
            }}
          >
            {l2}
          </span>
        </div>
      </div>
    </div>
  );
};

const PremiumWorld: React.FC = () => {
  const frame = useCurrentFrame();
  const cardP = useSpring(s(9.24), 13, 120);
  const bob = frame > s(10) && frame < s(34) ? Math.sin(frame / 16) * 4 : 0;
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

        {/* --- tiêu đề theo voice --- */}
        <Chunk from={W.thoi} to={10.22}>
          <Line>
            <Pop at={at(W.thoi, W.thoi)}>THÔI</Pop>
            <Pop at={at(W.dung3, W.thoi)}>ĐỪNG</Pop>
          </Line>
          <Line>
            <Pop at={at(W.lo, W.thoi)} size={150} color={C.mint}>
              LO!
            </Pop>
          </Line>
        </Chunk>
        <Chunk from={W.muon} to={12.38}>
          <Line>
            <Pop at={at(W.muon, W.muon)}>MUỐN</Pop>
            <Pop at={at(W.dau, W.muon)}>ĐẦU</Pop>
            <Pop at={at(W.tu, W.muon)}>TƯ</Pop>
          </Line>
          <Line gap={20}>
            <Pop at={at(W.tiet2, W.muon)} size={100} color={C.yellow}>
              TIẾT
            </Pop>
            <Pop at={at(W.day2, W.muon)} size={100} color={C.yellow}>
              DẠY
            </Pop>
            <Pop at={at(W.thi2, W.muon)} size={100}>
              THÌ…
            </Pop>
          </Line>
        </Chunk>
        <Chunk from={W.lien} to={13.95}>
          <Line>
            <Pop at={at(W.lien, W.lien)} size={130} color={C.mint}>
              LIÊN
            </Pop>
            <Pop at={at(W.he, W.lien)} size={130} color={C.mint}>
              HỆ
            </Pop>
          </Line>
          <Line>
            <Pop at={at(W.tui, W.lien)} size={170} color={C.pink}>
              TUI!
            </Pop>
          </Line>
        </Chunk>

        {/* --- tiêu đề giai đoạn (đoạn không voice) --- */}
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

        {/* --- khung footage: rộng hết bề ngang 1080, không bo góc, không crop --- */}
        <div
          style={{
            position: "absolute",
            left: 0,
            top: CARD_TOP,
            width: 1080,
            height: CARD_H,
            overflow: "hidden",
            transform: `translateY(${(1 - cardP) * 1300 + bob}px) rotate(${(1 - cardP) * 6}deg) scale(${
              0.9 + 0.1 * cardP
            })`,
            boxShadow: `0 -7px 0 #fff, 0 7px 0 #fff, 0 0 100px rgba(61,245,181,.55), 0 50px 90px rgba(0,0,0,.55)`,
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

        <Chip at={10.5} icon="sparkles" color={C.yellow} top={1236}>
          Hiệu ứng mượt, không rối
        </Chip>
        <Chip at={11.1} icon="image" color={C.pink} top={1342}>
          Ảnh minh hoạ đẹp mắt
        </Chip>
        <Chip at={11.7} icon="checkSquare" color={C.mint} top={1448}>
          Đúng cấu trúc tiết dạy
        </Chip>

        {/* --- mô tả nội dung footage (dưới khung) --- */}
        <Desc from={14.0} to={18.2} icon="gamepad" color={C.cyan} l1="Hidden Picture" l2="Trò chơi đoán tranh khởi động" />
        <Desc from={18.3} to={21.5} icon="book" color={C.yellow} l1="Unit 5: Food and Drink" l2="Lesson 1: Getting started" />
        <Desc from={21.6} to={24.3} icon="sparkles" color={C.pink} l1="New word" l2="Gợi mở từ mới bằng hình ảnh" />
        <Desc from={24.4} to={27.9} icon="book" color={C.mint} l1="Mineral (a)  /ˈmɪnərəl/" l2="Chữ, phiên âm, nghĩa hiện lần lượt" />
        <Desc from={28.0} to={33.2} icon="droplet" color={C.cyan} l1="Lemon + Water + Sugar = ?" l2="Học sinh đoán đồ uống từ hình" />
        <Desc from={33.4} to={35.95} icon="sparkles" color={C.yellow} l1="Lemonade (n)  /ˌleməˈneɪd/" l2="Nước chanh — kèm âm thanh mẫu" />

        {/* --- nút kêu gọi: giữa video (cùng lời thoại) và cuối video --- */}
        <CtaBlock from={12.4} to={14.0} clickAt={13.0} subAt={13.2} />
        <CtaBlock from={36.0} clickAt={36.85} subAt={36.5} />

        <Confetti start={s(9.3)} />
        <Confetti start={s(33.4)} count={40} />
        <Confetti start={s(36.9)} count={40} />
        <Flash at={s(9.24)} dur={10} max={0.9} />
      </AbsoluteFill>

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

/** Glitch RGB trước khi chuyển cảnh */
const Glitch: React.FC = () => {
  const frame = useCurrentFrame();
  if (frame < s(8.95) || frame > s(9.3)) return null;
  const k = frame - s(8.95);
  return (
    <AbsoluteFill style={{ pointerEvents: "none", mixBlendMode: "screen" }}>
      {Array.from({ length: 9 }).map((_, i) => {
        if (random(`g${i}-${k}`) <= 0.35) return null;
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
