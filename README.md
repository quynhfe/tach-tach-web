# Tách Tách — web viewer link chia sẻ

Trang web đọc-only cho link chia sẻ của app **Tách Tách**: `https://<domain>/t/<slug>`.
Người nhận link xem được album mà **không cần cài app, không cần đăng nhập**.

Repo app: `../tach-bru`.

## Vì sao là một repo riêng

Đây là Next.js chạy trên Vercel, còn app là React Native / Expo — khác toolchain,
khác vòng đời deploy. Điểm chạm duy nhất giữa hai bên là biến env
`EXPO_PUBLIC_SHARE_BASE_URL` bên app phải trỏ đúng domain của trang này.

## Backend

Không có backend riêng. Trang gọi thẳng Supabase của app bằng **anon key**:

| Bước | Gọi gì |
|---|---|
| Đọc share | RPC `get_share_by_slug` (`security definer`, đã `grant execute … to anon`) |
| Ký URL ảnh | Edge Function `sign-read` với `{ keys, slug }` — chỉ ký key nằm trong share đó |
| Đếm lượt xem | RPC `increment_share_view` (fire-and-forget) |

`src/hooks/usePublicShare.ts` bên repo app là bản tham chiếu của logic này.

Anon key vốn thiết kế để public — RLS và `security definer` mới là lớp bảo vệ.
**Không** đặt service key vào đây.

## Chạy local

```bash
npm install
cp .env.example .env.local   # điền URL + anon key của Supabase
npm run dev                  # http://localhost:3000/t/<slug>
npm run typecheck
npm run build
```

## Deploy Vercel

1. Push repo lên GitHub, import vào Vercel.
2. Set env: `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`.
   (`NEXT_PUBLIC_APP_STORE_URL` để trống tới khi app lên store — banner tự ẩn nút.)
3. Ghi domain vừa nhận vào `EXPO_PUBLIC_SHARE_BASE_URL` của repo app.

## Universal links (chưa làm)

Khi có Apple Team ID và SHA-256 của keystore Android thì thêm hai file tĩnh:

- `public/.well-known/apple-app-site-association` — **không có đuôi `.json`**, phải
  trả `Content-Type: application/json`
- `public/.well-known/assetlinks.json`

rồi khai `ios.associatedDomains` + `android.intentFilters` bên `app.json` của app.
