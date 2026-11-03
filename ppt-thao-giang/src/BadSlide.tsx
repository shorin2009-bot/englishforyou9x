import React from "react";

/** Slide PPT "sơ sài" (mô phỏng) 960x540: chữ Times, gạch chân xanh, bullet dày đặc, ảnh clip-art. */
export const BadSlide: React.FC = () => (
  <div
    style={{
      width: 960,
      height: 540,
      background: "#fff",
      border: "5px solid #9aa0a6",
      boxSizing: "border-box",
      fontFamily: '"Times New Roman", "DejaVu Serif", serif',
      color: "#000",
      padding: "26px 34px",
      position: "relative",
      overflow: "hidden",
    }}
  >
    <div
      style={{
        fontSize: 46,
        fontWeight: 700,
        color: "#1a1aff",
        textDecoration: "underline",
        textAlign: "center",
        marginBottom: 18,
      }}
    >
      BÀI 5: FOOD AND DRINK
    </div>
    <div style={{ fontSize: 33, lineHeight: 1.42, width: 560 }}>
      <div>• Pork: thịt heo</div>
      <div>• Juice: nước ép</div>
      <div>• Mineral water: nước khoáng</div>
      <div>• Lemonade: nước chanh</div>
      <div>• Would you like ...? Yes, please.</div>
      <div>• some / a lot of / lots of</div>
    </div>
    {/* ô ảnh clip-art "dán tạm" */}
    <div
      style={{
        position: "absolute",
        right: 34,
        top: 120,
        width: 270,
        height: 230,
        border: "3px dashed #888",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "#f1f1f1",
      }}
    >
      <svg width="130" height="170" viewBox="0 0 60 80">
        <path d="M8 6h44l-6 62a6 6 0 0 1-6 6H20a6 6 0 0 1-6-6z" fill="#cfe8ff" stroke="#333" strokeWidth="2.5" />
        <path d="M11 24h38" stroke="#333" strokeWidth="2" />
        <circle cx="30" cy="48" r="6" fill="#ffea00" stroke="#333" strokeWidth="2" />
      </svg>
    </div>
    <div style={{ position: "absolute", left: 34, bottom: 14, fontSize: 22, color: "#555" }}>
      Trang 1 / 30
    </div>
    <div
      style={{
        position: "absolute",
        right: 34,
        bottom: 14,
        fontSize: 22,
        color: "#c00",
        fontWeight: 700,
      }}
    >
      (xem thêm ở slide sau...)
    </div>
  </div>
);
