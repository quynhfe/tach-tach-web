import { createClient } from '@supabase/supabase-js'

// Anon key: RLS + RPC `security definer` là lớp bảo vệ, key này vốn để lộ ra
// trình duyệt. Trang chỉ đọc, không có phiên đăng nhập nào để giữ.
export const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL ?? '',
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? '',
  { auth: { persistSession: false, autoRefreshToken: false } },
)
