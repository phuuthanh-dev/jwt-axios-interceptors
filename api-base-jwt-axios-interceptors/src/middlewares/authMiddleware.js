// Author: TrungQuanDev: https://youtube.com/@trungquandev
import { StatusCodes } from 'http-status-codes'
import {
  ACCESS_TOKEN_SECRET_SIGNATURE,
  JwtProvider
} from '~/providers/JwtProvider'

// Middleware này đảm bảo nhiệm vụ quan trọng: Lấy và kiểm tra token của user
const isAuthorized = async (req, res, next) => {
  // Cách 1: lấy token nằm trong request cookie phía client - withCredentials: true
  const accessTokenFromCookie = req.cookies?.accessToken
  if (!accessTokenFromCookie) {
    return res.status(StatusCodes.UNAUTHORIZED).json({ message: 'Unauthorized' })
  }

  // Cách 2: lấy token nằm trong header Authorization
  // const accessTokenFromHeader = req.headers.authorization?.split(' ')[1]
  // if (!accessTokenFromHeader) {
  //   return res.status(StatusCodes.UNAUTHORIZED).json({ message: 'Unauthorized' })
  // }

  try {
    // Bước 1: Thực hiện giải mã token xem có hợp lệ không
    const accessTokenDecoded = await JwtProvider.verifyToken(accessTokenFromCookie, ACCESS_TOKEN_SECRET_SIGNATURE)

    // Bước 2: Nếu token hợp lệ, lưu thông tin vào req.jwtDecoded để các middleware, controller sau có thể sử dụng
    req.jwtDecoded = accessTokenDecoded

    // Bước 3: Tiếp tục middleware hoặc controller tiếp theo
    next()
  } catch (error) {
    // Trường hợp lỗi 1: Nếu cái token hết hạn - cần trả về lỗi GONE 410 để client biết refresh token
    if (error.message?.includes('jwt expired')) {
      return res.status(StatusCodes.GONE).json({ message: 'Gone' })
    }
    // Trường hợp lỗi 2: Nếu token không hợp lệ - trả về lỗi UNAUTHORIZED 401
    return res.status(StatusCodes.UNAUTHORIZED).json({ message: 'Unauthorized' })
  }
}

export const authMiddleware = {
  isAuthorized
}