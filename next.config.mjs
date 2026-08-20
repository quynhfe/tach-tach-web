/** @type {import('next').NextConfig} */
const nextConfig = {
  // Ảnh đến từ MinIO qua presigned URL (host động + query chữ ký) nên không đi
  // qua bộ tối ưu ảnh của Next — trang dùng <img> thẳng.
  images: { unoptimized: true },

  async headers() {
    return [
      {
        // `apple-app-site-association` cố tình KHÔNG có đuôi .json (Apple quy
        // định vậy), nên Next serve nó ra dưới dạng octet-stream và iOS bỏ qua.
        // Ép đúng content-type; file cũng phải trả 200 thẳng, không redirect.
        source: '/.well-known/apple-app-site-association',
        headers: [{ key: 'Content-Type', value: 'application/json' }],
      },
    ]
  },
}

export default nextConfig
