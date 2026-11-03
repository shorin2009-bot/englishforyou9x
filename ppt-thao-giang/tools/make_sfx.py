"""Tạo hiệu ứng âm thanh bằng tổng hợp có cao độ (không dùng nhiễu trắng -> không bị 'xì xèo')."""
import numpy as np, wave, os
sr = 44100
OUT = os.path.join(os.path.dirname(__file__), "..", "public", "sfx")
os.makedirs(OUT, exist_ok=True)

def T(d): return np.linspace(0, d, int(sr * d), endpoint=False)
def save(name, x, peak=0.9):
    x = np.asarray(x, float)
    x = x / (np.abs(x).max() + 1e-9) * peak
    # fade-out 8ms chống click
    k = int(sr * 0.008); x[-k:] *= np.linspace(1, 0, k)
    w = wave.open(os.path.join(OUT, name + ".wav"), "wb")
    w.setnchannels(1); w.setsampwidth(2); w.setframerate(sr)
    w.writeframes((x * 32767).astype(np.int16).tobytes()); w.close()
def hz(m): return 440 * 2 ** ((m - 69) / 12)

def marimba(m, d=0.7):
    t = T(d); f = hz(m)
    x = (np.sin(2*np.pi*f*t) * np.exp(-t*7)
         + 0.35*np.sin(2*np.pi*f*4*t) * np.exp(-t*22)
         + 0.12*np.sin(2*np.pi*f*10*t) * np.exp(-t*45))
    a = int(sr*0.003); x[:a] *= np.linspace(0, 1, a)
    return x
def sweep(f0, f1, d, curve=1.0):
    t = T(d); u = (t/d)**curve
    f = f0 + (f1-f0)*u
    return np.sin(2*np.pi*np.cumsum(f)/sr)

# --- marimba notes (từng nhịp chữ) ---
for m in [48, 50, 52, 55, 57, 59, 60, 64, 72, 74, 76, 79, 81, 84]:
    save(f"mb_{m}", marimba(m))

# --- bong bóng pop (thẻ lợi ích) ---
t = T(.2); f = 500 + 1100*np.exp(-t*35)
save("pop", np.sin(2*np.pi*np.cumsum(f)/sr) * np.exp(-t*20))

# --- click giao diện ---
t = T(.12)
save("click", np.sin(2*np.pi*1500*t)*np.exp(-t*90) + 0.6*np.sin(2*np.pi*900*t)*np.exp(-t*60))

# --- chuông ding + lấp lánh (bell có cao độ) ---
t = T(1.4)
save("ding", sum(a*np.sin(2*np.pi*f*t)*np.exp(-t*r) for f, a, r in [(1318, 1, 3.5), (2637, .45, 5.5), (3951, .2, 8)]))
x = np.zeros_like(T(1.1))
for i, m in enumerate([84, 88, 91, 96, 100]):
    s0 = int(i*0.065*sr); tt = T(1.1)[:len(x)-s0]
    x[s0:] += np.sin(2*np.pi*hz(m)*tt) * np.exp(-tt*6) * 0.6
save("sparkle", x)

# --- swipe chuyển cảnh: quét tông sạch, mượt ---
t = T(.3); env = np.sin(np.pi*t/.3)**2
save("swipe", (sweep(380, 1500, .3, 1.6) + 0.4*sweep(760, 3000, .3, 1.6)) * env)

# --- 'nope' khi vòng cấm hiện lên: 2 nốt giảm dần ---
x = np.zeros(int(sr*.5))
for i, f in enumerate([392, 294]):
    s0 = int(i*0.17*sr); tt = T(.3)[:len(x)-s0]
    x[s0:s0+len(tt)] += (np.sin(2*np.pi*f*tt) + 0.5*np.sin(2*np.pi*2*f*tt)) * np.exp(-tt*9)
save("nope", x)

# --- tension: nốt trầm rung dâng dần trước khi đóng dấu ---
t = T(.62); env = (t/.62)**1.5
x = np.sin(2*np.pi*np.cumsum(98 + 40*(t/.62))/sr) * (0.7+0.3*np.sin(2*np.pi*9*t)) * env
x += 0.5*np.sin(2*np.pi*np.cumsum(147 + 60*(t/.62))/sr) * env
save("tension", x)

# --- dấu đóng: thud trầm + click gỗ (không nhiễu) ---
t = T(.8)
thud = np.sin(2*np.pi*np.cumsum(55 + 140*np.exp(-t*28))/sr) * np.exp(-t*6.5)
wood = np.sin(2*np.pi*310*t)*np.exp(-t*42) + 0.5*np.sin(2*np.pi*740*t)*np.exp(-t*60)
x = thud + 0.55*wood; x = np.tanh(1.8*x)
save("stamp", x)

# --- womp: kèn trombone buồn (2 nốt tụt xuống) ---
def brass(f0, f1, d):
    t = T(d); f = f0 + (f1-f0)*(t/d)**2
    ph = 2*np.pi*np.cumsum(f)/sr
    x = sum(np.sin(k*ph)/k for k in range(1, 7)) * (0.8+0.2*np.sin(2*np.pi*5.5*t))
    a = int(sr*.03); e = np.ones_like(t); e[:a] = np.linspace(0, 1, a); e *= np.exp(-t*2.2)
    return x*e
x = np.zeros(int(sr*.7))
a = brass(233, 220, .26); b = brass(220, 156, .42)
x[:len(a)] += a; x[int(.24*sr):int(.24*sr)+len(b)] += b[:len(x)-int(.24*sr)]
save("womp", x)

# --- rơi: tông trượt xuống kiểu hoạt hình ---
t = T(.85); f = 1100*np.exp(-t*2.6) + 140
save("fall", np.sin(2*np.pi*np.cumsum(f)/sr) * np.minimum(1, t*30) * np.exp(-t*1.2))
# thud rác
t = T(.35)
save("thud", np.tanh(1.6*np.sin(2*np.pi*np.cumsum(70 + 90*np.exp(-t*25))/sr)*np.exp(-t*11)))

# --- glitch số: các nốt vuông ngắn lệch cao độ (không nhiễu) ---
x = np.zeros(int(sr*.32))
for i, f in enumerate([880, 1245, 660, 1568, 740, 1976]):
    s0 = int(i*0.045*sr); n = int(0.03*sr)
    tt = np.arange(n)/sr
    x[s0:s0+n] += np.sign(np.sin(2*np.pi*f*tt)) * 0.35 * np.linspace(1, 0.3, n)
save("glitch", x, 0.6)

# --- riser tông dâng cho vòng sáng ---
t = T(.5); env = (t/.5)**1.3
save("riser", (sweep(220, 1320, .5, 1.5) + 0.5*sweep(330, 1980, .5, 1.5)) * env)

# --- nhạc nền: pluck marimba + bass + kick mềm (không có hi-hat/nhiễu) ---
bpm = 104; beat = 60/bpm; D = 34
n = int(D*sr); bed = np.zeros(n)
def add(x, t0, g=1.0):
    s0 = int(t0*sr)
    if s0 >= n: return
    e = min(len(x), n-s0); bed[s0:s0+e] += x[:e]*g
chords = [(48, [60, 64, 67, 72]), (55, [59, 62, 67, 71]), (57, [60, 64, 69, 72]), (53, [60, 65, 69, 72])]
pl = {m: marimba(m, .55) for c in chords for m in c[1]}
bass = {}
for b, _ in chords:
    t = T(.9); f = hz(b-12)
    bass[b] = (np.sin(2*np.pi*f*t) + 0.25*np.sin(2*np.pi*2*f*t)) * np.exp(-t*3)
tk = T(.28); kick = np.sin(2*np.pi*np.cumsum(50 + 100*np.exp(-tk*30))/sr) * np.exp(-tk*10)
step = beat/2; pattern = [0, 1, 2, 3, 2, 1, 2, 3]
bars = int(D/(beat*4))+1
for bar in range(bars):
    b, ch = chords[(bar//2) % 4]
    t0 = bar*beat*4
    add(bass[b], t0, .55); add(bass[b], t0+beat*2, .45)
    add(kick, t0, .5); add(kick, t0+beat*2, .42); add(kick, t0+beat*3.5, .25)
    for i, p in enumerate(pattern):
        add(pl[ch[p]], t0+i*step, .22 + (0.08 if i % 2 == 0 else 0))
# echo mềm
dl = int(step*3*sr); out = bed.copy()
for k in range(1, 4):
    out[dl*k:] += bed[:-dl*k] * (0.28**k)
save("bed", out, 0.9)
print("ok")
