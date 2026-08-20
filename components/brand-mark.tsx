/**
 * Logo máy ảnh + wordmark, lấy nguyên từ app để web và app nhận ra nhau ngay ở
 * cái nhìn đầu. Dùng lại ở landing, banner đáy và đầu trang chia sẻ nên gom một
 * chỗ: đổi logo chỉ sửa ở đây.
 */
export function BrandMark({ size = 28, wordmark = true }: { size?: number; wordmark?: boolean }) {
  return (
    <span className="brand-mark">
      {/* Ảnh trang trí đi kèm chữ "Tách Tách" ngay cạnh — alt rỗng để trình đọc
          màn hình không đọc tên thương hiệu hai lần. */}
      <img src="/logo.png" alt={wordmark ? '' : 'Tách Tách'} width={size} height={size} />
      {wordmark && <span className="brand-word">Tách Tách</span>}
    </span>
  )
}
