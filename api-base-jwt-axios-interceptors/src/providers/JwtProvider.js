// Author: TrungQuanDev: https://youtube.com/@trungquandev
// https://www.npmjs.com/package/jsonwebtoken
import JWT from 'jsonwebtoken'

// Function tạo mới một token - cần 3 tham số đầu vào
// userInfo: Những thông tin muốn đính kèm vào token
// secretSignature: Chuỗi bí mật để tạo token
// tokenLife: Thời gian hết hạn của token
const generateToken = async (userInfo, secretSignature, tokenLife) => {
  try {
    // Hàm sign của JWT - thuật toán mặc định là HS256
    return JWT.sign(userInfo, secretSignature, {
      algorithm: 'HS256',
      expiresIn: tokenLife
    })
  } catch (error) {
    throw new Error(error)
  }
}

// Function kiểm tra token có hợp lệ không
// Hợp hệ ở đây là token đó được tạo ra từ chữ ký bí mật secretSignature trong
// dự án hay không
const verifyToken = async (token, secretSignature) => {
  try {
    // Hàm verify của JWT - trả về payload đã được tạo ra token
    return JWT.verify(token, secretSignature)
  } catch (error) {
    throw new Error(error)
  }
}

/**
 * 2 cái chữ ký bí mật quan trọng trong dự án. Dành cho JWT - Jsonwebtokens
 * Lưu ý phải lưu vào biến môi trường ENV trong thực tế cho bảo mật.
 * Ở đây mình làm Demo thôi nên mới đặt biến const và giá trị random ngẫu nhiên trong code nhé.
 * Xem thêm về biến môi trường: https://youtu.be/Vgr3MWb7aOw
 */
export const ACCESS_TOKEN_SECRET_SIGNATURE = 'kGQsGWnGis3wuzo1eIdml60D6bJmljUo'
export const REFRESH_TOKEN_SECRET_SIGNATURE = 'rLM3JpQFV0IpLOTe6SrjeYr3hb9aHjrP'

export const JwtProvider = {
  generateToken,
  verifyToken
}