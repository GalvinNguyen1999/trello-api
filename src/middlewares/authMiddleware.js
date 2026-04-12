import { StatusCodes } from 'http-status-codes'
import { env } from '~/config/environment'
import { JwtProvider } from '~/providers/JwtProvider'
import ApiError from '~/utils/ApiError'

const isAuthorized = async (req, res, next) => {
  // step 0: kiểm tra xem client đã gửi cookie chưa
  const clientAccessToken = req.cookies.accessToken
  if (!clientAccessToken) {
    next(new ApiError(StatusCodes.UNAUTHORIZED, 'Unauthorized (token not found)'))
    return
  }

  try {
    // step 1: giải mã token
    const accessTokenDecoded = await JwtProvider.verifyToken(clientAccessToken, env.ACCESS_TOKEN_SECRET_SIGNATURE)

    // step 2: lấy thông tin user từ decoded token và gán vào req.jwtDecoded
    req.jwtDecoded = accessTokenDecoded

    // step 3: gọi tới next() để chuyển sang route tiếp theo
    next()
  } catch (error) {
    // neu access token het han thi se tra ve ma loi 410 GONE
    if (error.message.includes('jwt expired')) {
      next(new ApiError(StatusCodes.GONE, 'Access token has expired, please login again'))
      return
    }

    // neu token khong hop le. tra ve loi 401 UNAUTHORIZED
    next(new ApiError(StatusCodes.UNAUTHORIZED, 'Unauthorized'))
  }
}

export const authMiddleware = { isAuthorized }