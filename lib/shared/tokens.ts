// GENERATED từ tach-bru/src/shared/tokens.ts — ĐỪNG SỬA FILE NÀY.
// Sửa ở NGUỒN rồi chạy `npm run sync:shared` bên repo app.

// ---------------------------------------------------------------------------
// NGUỒN DUY NHẤT của bảng màu / bóng đổ. Ba nơi khác đều sinh ra từ đây qua
// `npm run sync:shared`:
//   - tailwind.tokens.cjs  → className của app (bg-brand, text-ink…)
//   - ../tach-tach-web/app/tokens.css      → CSS var của web viewer
//   - ../tach-tach-web/lib/shared/tokens.ts → code web đọc trực tiếp
// Sửa màu thì sửa Ở ĐÂY rồi chạy sync; đừng gõ tay hex ở ba nơi kia.
//
// File thuần TypeScript: không import react-native, expo-*, next hay alias @/ —
// nó phải chạy được trong cả bundle Metro lẫn build Next.
//
// COLORS còn là cầu nối cho những chỗ RN KHÔNG đọc được class Tailwind:
//  - `color` prop của icon Iconsax (không nhận className text-*).
//  - boxShadow (RN không có CSS var --shadow-*).
// ---------------------------------------------------------------------------

export const COLORS = {
  cream: "#fffdf8",
  // Nền ĐẤT của bản đồ — kem xanh RẤT NHẠT (lấy từ screenshot Jagat): phủ TOÀN map
  // nên zoom-out vẫn xanh dịu (không "trắng bệch"), nhẹ nhõm không đục. Tách khỏi
  // `cream` (nền app).
  mapLand: "#e9eedb",
  // Xanh THỰC VẬT trên map (rừng/đồng/địa hình xanh) — sage nhạt hơi khác base một
  // nấc, đúng cặp 2 tầng của Jagat (base kem ↔ vùng cây xanh dịu). Tách khỏi
  // `brandSoft` (dùng cho card app) vì map cần sắc nhạt trung tính hơn.
  mapVeg: "#dcecd3",
  // Tên NƯỚC trên map — dusty mauve (hồng-tím xám) kiểu Jagat, mềm hơn `purpleDark`
  // tím gắt: nước vẫn khác nhãn thành phố nhưng không "nhảy" khỏi bản đồ.
  mapCountry: "#c3a4b4",
  // Cream alpha-0 cho gradient tan: KHÔNG dùng 'transparent' (= đen alpha 0) vì
  // interpolate sẽ đi qua xám/đen → lòi "shadow xám". Cùng RGB cream, chỉ đổi alpha.
  creamFade: "rgba(255, 253, 248, 0)",
  canvas: "#eef0ec",
  card: "#ffffff",
  ink: "#586048", // xanh rêu sẫm — chữ chính (bớt gắt so với đen thuần)
  // Nhãn địa danh trên MAP — xám-rêu dịu, mềm hơn `ink` để không "gắt" như chữ đậm
  // trên nền đất sáng (kiểu Jagat: nhãn xám nhẹ, đọc được nhưng không đập mắt).
  mapLabel: "#7f887f",
  muted: "#9fa3a7", // gray — chữ phụ
  // Chữ THÂN BÀI dài: nhạt hơn `ink` một nấc cho đỡ nặng mắt, nhưng vẫn đủ tương
  // phản để đọc cả đoạn (khác `muted` vốn chỉ dành cho nhãn ngắn).
  inkSoft: "#6f7566",
  brand: "#82be57",
  brandDark: "#5f9a3c",
  brandLink: "#5f9a3c",
  brandSoft: "#ddefcb",
  // Màu phụ trợ tươi (dùng cho cụm địa điểm, nhãn, nền nhạt…)
  pink: "#f08fb2",
  pinkSoft: "#f8d8e4",
  // Sắc ĐẬM của pink/blue — dùng cho CHỮ đặt trên nền `*Soft` cùng tông; bản
  // gốc quá sáng nên chữ mờ. (Web viewer: nhãn tính năng ở trang giới thiệu.)
  pinkDark: "#c85d84",
  yellow: "#f7c84b",
  yellowSoft: "#fbe9b5",
  blue: "#80b4ee",
  blueSoft: "#d6e8f8",
  blueDark: "#4a84c4",
  // Nước trên MAP — xanh dịu, BỚT bão hoà so với `blue` (tránh "dạ quang"/neon trên
  // nền đất sage). Tách token riêng vì `blue` còn dùng cho place colors/route/icon.
  mapWater: "#afd8eb",
  mapWaterSoft: "#dbe7ee",
  purple: "#c4a0ee",
  purpleDark: "#8f6bbd",
  purpleSoft: "#e8dcf7",
  peach: "#f1be82",
  hairline: "#e2e3e1",
  night: "#17150f", // đen ấm — nền màn camera (không đen thuần cho hợp tone film)
  white: "#ffffff",
  danger: "#ef4444",
  heart: "#f08fb2", // hồng cho icon yêu thích
  stamp: "#ffa63e", // cam cháy — dấu giờ kiểu datestamp máy film quartz
  // Scrim tối đè đáy ảnh cho chữ trắng đọc rõ. Cùng ĐEN, chỉ ramp alpha (không lòi xám).
  scrim: "rgba(0, 0, 0, 0.35)",
  scrimStrong: "rgba(0, 0, 0, 0.62)", // đáy gradient ảnh — đủ đậm cho caption trắng
  scrimFade: "rgba(0, 0, 0, 0)"
} as const;

// Bảng màu địa điểm cho timeline Nhật ký: mỗi ĐOẠN (các ngày liền nhau cùng
// tỉnh) một màu, lấy lần lượt & quay vòng khi đổi vùng. Bộ màu TƯƠI (khớp các
// token phụ) — dùng làm nền đĩa (icon trắng) + chữ tên tỉnh trên nền cream.
export const PLACE_COLORS = [
  "#82be57", // xanh lá
  "#f08fb2", // hồng
  "#80b4ee", // xanh dương
  "#c4a0ee", // tím
  "#f1be82", // peach
  "#f7c84b" // vàng
] as const;

// Màu theo NGÀY của hành trình (khớp token `day` trong tailwind) — dùng cho
// route line trên bản đồ đổi màu theo ngày + pin. Quay vòng khi quá 4 ngày.
export const DAY_COLORS = ["#82be57", "#f08fb2", "#80b4ee", "#f7c84b"] as const;

// Bản PASTEL của PLACE_COLORS (cùng thứ tự) — nền card/khối lớn nhuộm theo màu
// địa điểm mà chữ ink vẫn đọc rõ. Phải là màu ĐẶC (không alpha) vì card có thể
// đè lên ảnh — nền trong suốt sẽ lộ ảnh phía sau.
export const PLACE_SOFT_COLORS = [
  "#ddefcb", // = brandSoft
  "#f8d8e4", // = pinkSoft
  "#d6e8f8", // = blueSoft
  "#e8dcf7", // = purpleSoft
  "#fae8d2", // peach nhạt
  "#fbe9b5" // = yellowSoft
] as const;

// Sắc độ NỀN cho caption in lên ảnh tải về: cùng ĐEN, ramp alpha nhạt→đậm (đè
// lên ảnh trông như dãy XÁM; giữ cùng RGB để không lòi ánh xám lạ). Nấc thứ 2
// = COLORS.scrim — mặc định, khớp caption trong journal.
export const CAPTION_TONES = [
  "rgba(0, 0, 0, 0.18)",
  "rgba(0, 0, 0, 0.35)",
  "rgba(0, 0, 0, 0.55)",
  "rgba(0, 0, 0, 0.8)"
] as const;

// Cỡ chữ caption in lên ảnh tải về (theo bề rộng khung capture 360). Nấc giữa
// = 11, đúng cỡ CaptionPill trên card journal — mặc định.
export const CAPTION_SIZES = [9, 11, 13] as const;

// boxShadow (RN 0.76+ hỗ trợ style boxShadow) — thay cho --shadow-* của bản web.
export const SHADOWS = {
  soft: "0px 8px 24px rgba(45, 64, 48, 0.1)",
  btn: "0px 2px 8px rgba(45, 64, 48, 0.06)",
  // Bóng FOOTER (bottom nav) hắt LÊN trên để tách khỏi nội dung cuộn dưới nó.
  // Bar được lót vỏ cream trong BottomNav (nền sau góc bo); KHÔNG kèm elevation
  // (Android vẽ bóng ôm đường bo góc → quầng tối ở hõm góc).
  nav: "0px -6px 20px rgba(45, 64, 48, 0.08)"
} as const;
