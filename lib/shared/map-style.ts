// GENERATED từ tach-bru/src/shared/map-style.ts — ĐỪNG SỬA FILE NÀY.
// Sửa ở NGUỒN rồi chạy `npm run sync:shared` bên repo app.

import { COLORS } from "./tokens";

// Style Mapbox GL "cream/brand" TỰ CHỨA — không cần Mapbox Studio. Dựng từ nguồn
// vector chuẩn (mapbox-streets-v8) rồi nhuộm lại vài lớp cốt lõi theo bảng màu app
// cho map trông như trang scrapbook (nền kem, công viên brand-soft, nước xanh nhạt,
// đường trắng, nhãn chữ ink).
//
// Dùng chung app ↔ web: @rnmapbox/maps nhận CHUỖI qua prop `styleJSON`, còn
// mapbox-gl JS nhận thẳng OBJECT qua `style` (đưa chuỗi vào là nó fetch như URL
// → map trắng). Vì thế nguồn ở đây là OBJECT, app tự stringify.
//
// Ghi chú: nguồn "mapbox://…" tự resolve bằng access token của từng nền tảng.
// ---------------------------------------------------------------------------

export const BRAND_MAP_STYLE = {
  version: 8,
  name: "Tách Tách Cream",
  // Glyphs cho nhãn chữ — dùng font Mapbox mặc định (không upload được Quicksand
  // nếu chưa qua Studio; nhãn là phụ nên chấp nhận).
  glyphs: "mapbox://fonts/mapbox/{fontstack}/{range}.pbf",
  // Sprite Mapbox — lấy bộ icon POI (maki: quán ăn/cà phê/chợ/resort…) để chấm POI
  // thành BADGE có hình thay vì chấm trơn (giống Jagat). Không tự chứa được sprite
  // trong file nên trỏ sprite chuẩn của Mapbox (token tự resolve).
  sprite: "mapbox://sprites/mapbox/streets-v12",
  sources: {
    composite: {
      type: "vector",
      url: "mapbox://mapbox.mapbox-streets-v8"
    }
  },
  layers: [
    // Nền ĐẤT be-xanh sage ấm — bao trùm toàn map (đất đều màu như Jagat/Apple,
    // không "trắng bệch"). Dùng token map riêng, không phải cream của app.
    {
      id: "background",
      type: "background",
      paint: { "background-color": COLORS.mapLand }
    },
    // Công viên / cây xanh — mảng brand-soft nhạt.
    {
      id: "landuse-green",
      type: "fill",
      source: "composite",
      "source-layer": "landuse",
      filter: [
        "in",
        ["get", "class"],
        ["literal", ["park", "grass", "wood", "scrub", "pitch"]]
      ],
      paint: { "fill-color": COLORS.mapVeg, "fill-opacity": 0.85 }
    },
    // Nước — màu theo ĐỘ SÂU cảm nhận (học từ Jagat/Apple): zoom XA (biển khơi) xanh
    // đậm vừa cho ra chất "biển"; zoom GẦN (sông/vịnh) nhạt dịu về blueSoft. Nội suy
    // theo zoom vì streets-v8 chỉ có 1 lớp nước phẳng, không có dữ liệu độ sâu.
    {
      id: "water",
      type: "fill",
      source: "composite",
      "source-layer": "water",
      paint: {
        "fill-color": [
          "interpolate",
          ["linear"],
          ["zoom"],
          3,
          COLORS.mapWater,
          6,
          COLORS.mapWater,
          10,
          COLORS.mapWaterSoft
        ]
      }
    },
    {
      id: "waterway",
      type: "line",
      source: "composite",
      "source-layer": "waterway",
      paint: { "line-color": COLORS.mapWater, "line-width": 1 }
    },
    // Viền bờ biển mảnh — nền cream & nước blueSoft đều nhạt nên đường bờ dễ "chìm";
    // thêm line xanh dịu quanh mép nước để đất–nước tách bạch (giữ tinh thần cream).
    {
      id: "water-edge",
      type: "line",
      source: "composite",
      "source-layer": "water",
      layout: { "line-cap": "round", "line-join": "round" },
      paint: {
        "line-color": COLORS.mapWater,
        "line-width": ["interpolate", ["linear"], ["zoom"], 5, 0.4, 12, 1.2],
        "line-opacity": 0.4
      }
    },
    // Casing đường (viền mảnh dưới mặt đường) — cho đường tách nền. Muted MỜ (opacity
    // thấp) làm viền dịu thay vì đường "chói": mặt đường xám-sáng, mép hơi đậm hơn
    // chút xíu (kiểu Jagat/Apple). Chỉ từ zoom 8 để tầm cả nước không hằn đường.
    {
      id: "road-casing",
      type: "line",
      source: "composite",
      "source-layer": "road",
      minzoom: 8,
      filter: [
        "in",
        ["get", "class"],
        ["literal", ["motorway", "trunk", "primary", "secondary"]]
      ],
      layout: { "line-cap": "round", "line-join": "round" },
      paint: {
        "line-color": COLORS.muted,
        "line-opacity": 0.25,
        "line-width": ["interpolate", ["linear"], ["zoom"], 8, 1.5, 16, 8]
      }
    },
    // Mặt đường trắng — hai nhóm rộng/hẹp theo cấp đường + giãn theo zoom. LỌC theo
    // zoom (bậc thang): zoom xa chỉ cao tốc/quốc lộ, zoom gần mới thêm đường nhỏ →
    // không thành "lưới trắng" rối khi nhìn tổng thể (nguyên tắc gọn của bản đồ pro).
    {
      id: "road",
      type: "line",
      source: "composite",
      "source-layer": "road",
      // minzoom 8: đường trắng chỉ hiện khi zoom vào vùng — tầm cả nước (5–7) KHÔNG
      // còn sợi trắng cao tốc/quốc lộ vắt ngang (thứ trông như "viền ranh giới").
      minzoom: 7,
      filter: [
        "step",
        ["zoom"],
        ["in", ["get", "class"], ["literal", ["motorway", "trunk"]]],
        8,
        ["in", ["get", "class"], ["literal", ["motorway", "trunk", "primary"]]],
        11,
        [
          "in",
          ["get", "class"],
          ["literal", ["motorway", "trunk", "primary", "secondary", "tertiary"]]
        ],
        14,
        true
      ],
      layout: { "line-cap": "round", "line-join": "round" },
      paint: {
        // Xám-sáng (hairline) thay vì TRẮNG tinh — trắng trên nền đất sage bị "chói".
        "line-color": COLORS.hairline,
        "line-width": [
          "interpolate",
          ["linear"],
          ["zoom"],
          8,
          ["match", ["get", "class"], ["motorway", "trunk", "primary"], 1, 0.3],
          16,
          ["match", ["get", "class"], ["motorway", "trunk", "primary"], 6, 2]
        ]
      }
    },
    // Ranh giới hành chính — NÉT LIỀN kín đáo (bỏ nét đứt theo ý user). Tầm cả nước
    // CHỈ ranh quốc gia (level 0) như Jagat; ranh tỉnh (level 1) chỉ hiện khi zoom vào
    // tỉnh (≥8) và mảnh/mờ hơn hẳn ranh quốc gia → nhìn tổng thể sạch, không "chi tiết quá".
    {
      id: "admin",
      type: "line",
      source: "composite",
      "source-layer": "admin",
      filter: [
        "step",
        ["zoom"],
        ["==", ["get", "admin_level"], 0],
        8,
        ["<=", ["get", "admin_level"], 1]
      ],
      layout: { "line-cap": "round", "line-join": "round" },
      paint: {
        // Ranh QUỐC GIA (level 0) màu ink đậm rõ; ranh TỈNH (level 1) xám muted nhạt
        // → phân cấp: biên nước nổi hơn biên tỉnh.
        "line-color": [
          "match",
          ["get", "admin_level"],
          0,
          COLORS.ink,
          COLORS.muted
        ],
        // Dày DẦN theo zoom: zoom xa mảnh (kín đáo), zoom gần DÀY hẳn → ranh giới rõ
        // là "biên giới", không lẫn với nét đường phố (đường mảnh xám). Ranh quốc gia
        // luôn dày hơn ranh tỉnh.
        "line-width": [
          "interpolate",
          ["linear"],
          ["zoom"],
          4,
          ["match", ["get", "admin_level"], 0, 0.9, 0.5],
          10,
          ["match", ["get", "admin_level"], 0, 2.2, 1],
          16,
          ["match", ["get", "admin_level"], 0, 3.6, 1.6]
        ],
        "line-opacity": ["match", ["get", "admin_level"], 0, 0.7, 0.35]
      }
    },
    // POI có sẵn của Mapbox (quán ăn, cà phê, chợ, lưu trú, công viên…) — BADGE tròn
    // màu theo nhóm + ICON maki trắng ở giữa + nhãn tên (giống Jagat), để map bớt
    // trống quanh chỗ đã ghé. Hiện từ z12 (Jagat cho POI ra sớm), lọc theo filterrank
    // TĂNG DẦN theo zoom: z12 chỉ POI nổi nhất, càng zoom càng nhiều.
    {
      id: "poi-dot",
      type: "circle",
      source: "composite",
      "source-layer": "poi_label",
      minzoom: 12,
      // Chỉ địa điểm liên quan chuyến đi (ăn/ở/chơi/mua/công viên). filterrank theo
      // bậc zoom → z12 thưa, z16 đầy dần, map "sạch" như Jagat.
      filter: [
        "all",
        [
          "step",
          ["zoom"],
          ["<=", ["get", "filterrank"], 2],
          14,
          ["<=", ["get", "filterrank"], 3],
          16,
          ["<=", ["get", "filterrank"], 5]
        ],
        [
          "in",
          ["get", "class"],
          [
            "literal",
            [
              "food_and_drink",
              "lodging",
              "park_like",
              "arts_and_entertainment",
              "commercial_services",
              "sport_and_leisure"
            ]
          ]
        ]
      ],
      paint: {
        // To hơn chút để chứa icon → thành BADGE, không phải chấm.
        "circle-radius": [
          "interpolate",
          ["linear"],
          ["zoom"],
          12,
          6,
          17,
          9
        ],
        "circle-color": [
          "match",
          ["get", "class"],
          "food_and_drink",
          COLORS.pink,
          "lodging",
          COLORS.purple,
          "park_like",
          COLORS.brand,
          "commercial_services",
          COLORS.blue,
          "arts_and_entertainment",
          COLORS.yellow,
          COLORS.peach
        ],
        "circle-stroke-color": COLORS.white,
        "circle-stroke-width": 1.5
      }
    },
    {
      id: "poi-label",
      type: "symbol",
      source: "composite",
      "source-layer": "poi_label",
      minzoom: 12,
      // Cùng bộ lọc với poi-dot → icon/nhãn luôn khớp badge, không lòi loại đã ẩn.
      filter: [
        "all",
        [
          "step",
          ["zoom"],
          ["<=", ["get", "filterrank"], 2],
          14,
          ["<=", ["get", "filterrank"], 3],
          16,
          ["<=", ["get", "filterrank"], 5]
        ],
        [
          "in",
          ["get", "class"],
          [
            "literal",
            [
              "food_and_drink",
              "lodging",
              "park_like",
              "arts_and_entertainment",
              "commercial_services",
              "sport_and_leisure"
            ]
          ]
        ]
      ],
      layout: {
        // ICON maki của Mapbox (theo field `maki`) đặt GIỮA badge — trắng cho nổi trên
        // nền màu nhóm. Thiếu maki → không vẽ icon (badge tròn vẫn còn, không vỡ).
        "icon-image": ["get", "maki"],
        "icon-size": ["interpolate", ["linear"], ["zoom"], 12, 0.75, 17, 1],
        "icon-allow-overlap": true,
        "icon-optional": true,
        "text-field": ["get", "name"],
        "text-font": ["DIN Pro Medium", "Arial Unicode MS Regular"],
        "text-size": 10.5,
        "text-anchor": "left",
        // Đẩy tên sang phải badge (badge to hơn nên offset rộng hơn cũ).
        "text-offset": [1, 0],
        // Tên dài xuống 2 dòng thay vì chạy ngang dài lê thê (gọn như Apple/Jagat).
        "text-max-width": 8,
        // Nhãn quan trọng (filterrank thấp) thắng va chạm; chật chỗ thì ẩn nhãn.
        "symbol-sort-key": ["get", "filterrank"],
        "text-optional": true
      },
      paint: {
        "icon-color": COLORS.white,
        "text-color": COLORS.ink,
        "text-halo-color": COLORS.cream,
        "text-halo-width": 1
      }
    },
    // Số QUỐC LỘ / TỈNH LỘ (ref: QL.1, ĐT.603…) chạy dọc đường — hiện từ z11 như
    // Jagat. Halo kem dày giả "biển số" cho dễ đọc trên mặt đường.
    {
      id: "road-shield",
      type: "symbol",
      source: "composite",
      "source-layer": "road",
      minzoom: 11,
      filter: [
        "all",
        ["has", "ref"],
        [
          "in",
          ["get", "class"],
          ["literal", ["motorway", "trunk", "primary", "secondary", "tertiary"]]
        ]
      ],
      layout: {
        "symbol-placement": "line",
        "symbol-spacing": 250,
        "text-field": ["get", "ref"],
        "text-font": ["DIN Pro Bold", "Arial Unicode MS Regular"],
        "text-size": 10,
        "text-rotation-alignment": "viewport",
        "text-padding": 4
      },
      paint: {
        "text-color": COLORS.ink,
        "text-halo-color": COLORS.cream,
        "text-halo-width": 1.8
      }
    },
    // TÊN ĐƯỜNG (Ngô Quyền…) — chỉ ở zoom SÂU (z14+) như Jagat, bám hướng đường,
    // chữ mapLabel dịu + halo kem để đọc rõ mà không đè lên mặt đường.
    {
      id: "road-label",
      type: "symbol",
      source: "composite",
      "source-layer": "road",
      minzoom: 13,
      filter: [
        "all",
        ["has", "name"],
        [
          "in",
          ["get", "class"],
          [
            "literal",
            ["primary", "secondary", "tertiary", "street", "street_limited"]
          ]
        ]
      ],
      layout: {
        "symbol-placement": "line",
        "symbol-spacing": 300,
        "text-field": [
          "coalesce",
          ["get", "name_vi"],
          ["get", "name_en"],
          ["get", "name"]
        ],
        "text-font": ["DIN Pro Medium", "Arial Unicode MS Regular"],
        "text-size": ["interpolate", ["linear"], ["zoom"], 14, 9, 17, 12],
        "text-max-angle": 40,
        "text-padding": 2
      },
      paint: {
        "text-color": COLORS.mapLabel,
        "text-halo-color": COLORS.cream,
        "text-halo-width": 1.2
      }
    },
    // Nhãn TÊN QUỐC GIA — in hoa tím giãn chữ (như Jagat), chỉ ở zoom xa→vừa rồi
    // ẩn khi zoom gần (maxzoom 9) để nhường chỗ cho nhãn thành phố.
    {
      id: "country-label",
      type: "symbol",
      source: "composite",
      "source-layer": "place_label",
      filter: ["==", ["get", "class"], "country"],
      maxzoom: 9,
      layout: {
        "text-field": [
          "coalesce",
          ["get", "name_vi"],
          ["get", "name_en"],
          ["get", "name"]
        ],
        // Bold + to hơn cho tên nước nổi bật (không dùng được Quicksand trong map nếu
        // chưa upload qua Studio → DIN Pro Bold là gần nhất).
        "text-font": ["DIN Pro Bold", "Arial Unicode MS Regular"],
        "text-size": ["interpolate", ["linear"], ["zoom"], 3, 13, 6, 18],
        "text-transform": "uppercase",
        "text-letter-spacing": 0.12,
        "text-max-width": 6
      },
      paint: {
        // Dusty mauve (hồng-tím xám) kiểu Jagat — mềm, không "nhảy" khỏi map như hồng/tím gắt.
        "text-color": COLORS.mapCountry
      }
    },
    // Nhãn khu dân cư (thành phố/thị trấn) — chữ ink, viền kem cho dễ đọc. Đây là
    // nguồn "rối" chính khi zoom xa: trước đây mọi thị trấn hiện cùng cỡ → chồng
    // chữ. Nay lọc theo TẦM QUAN TRỌNG (symbolrank thấp = lớn) theo bậc zoom + cỡ
    // chữ phân cấp (thủ đô to, thị trấn nhỏ) → bản đồ "thở" như Apple/Jagat.
    {
      id: "settlement-label",
      type: "symbol",
      source: "composite",
      "source-layer": "place_label",
      filter: [
        "all",
        ["==", ["get", "class"], "settlement"],
        // PHÂN CẤP theo zoom + symbolrank (số nhỏ = quan trọng). Dời bậc TRỄ hẳn để
        // đô thị lớn hiện trước, xã/phường (rank cao, nhất là phường mang type=city
        // sau sáp nhập 2025) chỉ lòi khi zoom SÂU — tránh cảnh zoom vừa đã ken đặc
        // nhãn phường/xã. Không dùng `true` sớm; nhãn nhỏ nhất đợi tới z13+.
        [
          "step",
          ["zoom"],
          ["<=", ["get", "symbolrank"], 6],
          6,
          ["<=", ["get", "symbolrank"], 10],
          8,
          ["<=", ["get", "symbolrank"], 12],
          10,
          ["<=", ["get", "symbolrank"], 14],
          12,
          true
        ]
      ],
      layout: {
        // Việt hoá nhãn: ưu tiên tên tiếng Việt, thiếu thì tiếng Anh, cuối cùng tên
        // bản địa → hết cảnh lòi chữ Hoa/Urdu/Bengali khi zoom xa (như Jagat).
        "text-field": [
          "coalesce",
          ["get", "name_vi"],
          ["get", "name_en"],
          ["get", "name"]
        ],
        "text-font": ["DIN Pro Medium", "Arial Unicode MS Regular"],
        // Cỡ chữ PHÂN CẤP theo `symbolrank` (số nhỏ = quan trọng), KHÔNG theo `type`:
        // các phường đổi tên sau sáp nhập 2025 (Thành Sen, Nam Đông Hà…) vẫn bị data
        // gắn type=city/town nên nếu theo type sẽ to ngang tỉnh. symbolrank tách được
        // (Hà Nội ~2 vs phường ~≥10). Giãn thêm theo zoom. Ngưỡng chỉnh được khi soi máy.
        "text-size": [
          "interpolate",
          ["linear"],
          ["zoom"],
          4,
          ["step", ["get", "symbolrank"], 14, 6, 11, 10, 9],
          10,
          ["step", ["get", "symbolrank"], 19, 6, 15, 10, 13, 14, 11]
        ],
        // Nhãn quan trọng thắng va chạm; chừa khoảng để nhãn không dính nhau.
        "symbol-sort-key": ["get", "symbolrank"],
        "text-padding": 6
      },
      paint: {
        // Màu PHÂN CẤP theo `symbolrank`: đô thị lớn (rank < 10) = mapLabel (xám-rêu
        // DỊU, mềm hơn ink cho đỡ gắt); địa danh nhỏ/phường-xã (rank ≥ 10) = muted nhạt
        // → vừa tách phường mới đổi tên khỏi tỉnh/thành, vừa không "đen đập mắt".
        "text-color": [
          "step",
          ["get", "symbolrank"],
          COLORS.mapLabel,
          10,
          COLORS.muted
        ]
      }
    },
    // Bậc THẤP NHẤT — phường/khu (settlement_subdivision): chữ muted in hoa nhỏ,
    // chỉ hiện khi zoom sâu vào đô thị (≥11) để không rối tầm tỉnh/thành.
    {
      id: "subdivision-label",
      type: "symbol",
      source: "composite",
      "source-layer": "place_label",
      filter: ["==", ["get", "class"], "settlement_subdivision"],
      minzoom: 12,
      layout: {
        "text-field": [
          "coalesce",
          ["get", "name_vi"],
          ["get", "name_en"],
          ["get", "name"]
        ],
        "text-font": ["DIN Pro Medium", "Arial Unicode MS Regular"],
        "text-size": ["interpolate", ["linear"], ["zoom"], 11, 10, 15, 12.5],
        "text-transform": "uppercase",
        "text-letter-spacing": 0.05,
        "text-optional": true
      },
      paint: {
        "text-color": COLORS.muted
      }
    }
  ]
};
