/** @type {import('next').NextConfig} */
const nextConfig = {
  // Ảnh đến từ MinIO qua presigned URL (host động + query chữ ký) nên không đi
  // qua bộ tối ưu ảnh của Next — trang dùng <img> thẳng.
  images: { unoptimized: true },
}

export default nextConfig
