// Author: TrungQuanDev: https://youtube.com/@trungquandev
import { StatusCodes } from 'http-status-codes'
import ms from 'ms'
import { ACCESS_TOKEN_SECRET_SIGNATURE, JwtProvider, REFRESH_TOKEN_SECRET_SIGNATURE } from '~/providers/JwtProvider'

/**
 * Mock nhanh thông tin user thay vì phải tạo Database rồi query.
 * Nếu muốn học kỹ và chuẩn chỉnh đầy đủ hơn thì xem Playlist này nhé:
 * https://www.youtube.com/playlist?list=PLP6tw4Zpj-RIMgUPYxhLBVCpaBs94D73V
 */
const MOCK_DATABASE = {
  USER: {
    ID: 'trungquandev-sample-id-12345678',
    EMAIL: 'trungquandev.official@gmail.com',
    PASSWORD: 'trungquandev@123'
  }
}

const login = async (req, res) => {
  try {
    if (req.body.email !== MOCK_DATABASE.USER.EMAIL || req.body.password !== MOCK_DATABASE.USER.PASSWORD) {
      res.status(StatusCodes.FORBIDDEN).json({ message: 'Your email or password is incorrect!' })
      return
    }

    // Trường hợp nhập đúng thông tin tài khoản, tạo token và trả về cho phía Client
    // Tạo thông tin payload để tạo token
    const userInfo = {
      id: MOCK_DATABASE.USER.ID,
      email: MOCK_DATABASE.USER.EMAIL
    }
    // Tạo ra 2 token: access token và refresh token
    const accessToken = await JwtProvider.generateToken(
      userInfo,
      ACCESS_TOKEN_SECRET_SIGNATURE,
      '1h'
      // '5s'
    )

    const refreshToken = await JwtProvider.generateToken(
      userInfo,
      REFRESH_TOKEN_SECRET_SIGNATURE,
      '14 days'
      // '15s'
    )

    // Xử lý trường hợp trả về http only cookie cho phía client
    res.cookie('accessToken', accessToken, {
      maxAge: ms('14 days'),
      httpOnly: true,
      secure: true,
      sameSite: 'none'
    })
    res.cookie('refreshToken', refreshToken, {
      maxAge: ms('14 days'),
      httpOnly: true,
      secure: true,
      sameSite: 'none'
    })

    // Trả về thông tin user cũng như trả về token cho trường hợp FE cần lưu
    // token vào localStorage
    res.status(StatusCodes.OK).json({
      ...userInfo,
      accessToken,
      refreshToken
    })
  } catch (error) {
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json(error)
  }
}

const logout = async (req, res) => {
  try {
    // Do something
    // Xóa cookie của client
    res.clearCookie('accessToken')
    res.clearCookie('refreshToken')
    res.status(StatusCodes.OK).json({ message: 'Logout API success!' })
  } catch (error) {
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json(error)
  }
}

const refreshToken = async (req, res) => {
  try {
    // Cách 1: Lấy luôn từ cookie đã được gửi lên từ client
    const refreshTokenFromCookie = req.cookies?.refreshToken

    // Cách 2: Từ localStorage phía FE sẽ truyền vào body khi gọi API
    // const refreshTokenFromBody = req.body?.refreshToken

    // Verify / giải mã token có hợp lệ không
    const refreshTokenDecoded = await JwtProvider.verifyToken(refreshTokenFromCookie, REFRESH_TOKEN_SECRET_SIGNATURE)

    // Lấy thông tin User từ payload của token
    const userInfo = {
      id: refreshTokenDecoded.id,
      email: refreshTokenDecoded.email
    }

    // Tạo access token mới
    const accessToken = await JwtProvider.generateToken(
      userInfo,
      ACCESS_TOKEN_SECRET_SIGNATURE,
      '1h'
      // '5s'
    )

    // Trả về access token mới cho phía client cho trường hợp sử dụng cookie
    res.cookie('accessToken', accessToken, {
      maxAge: ms('14 days'),
      httpOnly: true,
      secure: true,
      sameSite: 'none'
    })

    // Trả về access token mới cho phía client cho trường hợp sử dụng localStorage
    // res.status(StatusCodes.OK).json({ accessToken })

    res.status(StatusCodes.OK).json({ message: 'Refresh token success!' })
  } catch (error) {
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ message: 'Refresh token failed!' })
  }
}

export const userController = {
  login,
  logout,
  refreshToken
}
