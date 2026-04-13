import { StatusCodes } from 'http-status-codes'
import { userModel } from '~/models/userModel'
import ApiError from '~/utils/ApiError'
import bcryptjs from 'bcryptjs'
import { v4 as uuidv4 } from 'uuid'
import { pickUser } from '~/utils/formatters'
import { WEBSITE_DOMAIN } from '~/utils/constants'
import { BrevoProvider } from '~/providers/BrevoProvider'
import { JwtProvider } from '~/providers/JwtProvider'
import { env } from '~/config/environment'

const createNew = async (reqBody) => {
  try {
    // step 1: kiểm tra xem email đã tồn tại chưa
    const existingUser = await userModel.findOneByEmail(reqBody.email)
    if (existingUser) {
      throw new ApiError(StatusCodes.CONFLICT, 'Email already exists')
    }

    // step 2: tạo data để lưu vào database
    const nameFromEmail = reqBody.email.split('@')[0] // ex: cuong@gmail.com -> cuong
    const newUser = {
      email: reqBody.email,
      password: bcryptjs.hashSync(reqBody.password, 8),
      username: nameFromEmail,
      displayName: nameFromEmail,
      verifyToken: uuidv4()
    }

    // step 3: thực hiện lưu thông tin user vào trong database
    const createdUser = await userModel.createNew(newUser)
    const getNewUser = await userModel.findOneById(createdUser.insertedId)

    // step 4: gửi email cho người dùng xác thực tài khoản // sẽ làm sau
    const verificationLink = `${WEBSITE_DOMAIN}/account/verification?email=${getNewUser.email}&token=${getNewUser.verifyToken}`
    const customSubject = 'Trello MERN Stack Advenced: Please verify your email before using our services!'
    const htmlContent = `
      <h3>Here is your verification link:</h3>
      <h3>${verificationLink}</h3>
      <h3>Sincerely, <br/> Cuong Web</h3>
    `
    // gọi tới provider gửi mail
    await BrevoProvider.sendVerifyEmail(getNewUser.email, customSubject, htmlContent)

    // return trả về dữ liệu cho phía controller
    return pickUser(getNewUser)
  } catch (error) { throw error }
}

const verifyAccount = async (reqBody) => {
  try {
    // query user trong database
    const existUser = await userModel.findOneByEmail(reqBody.email)
    if (!existUser) throw new ApiError(StatusCodes.NOT_FOUND, 'Account not found!')

    // check xem user đã active chưa
    if (existUser.isActive) throw new ApiError(StatusCodes.NOT_ACCEPTABLE, 'Your account already active!')

    // check token
    if (existUser.verifyToken !== reqBody.token) throw new ApiError(StatusCodes.UNAUTHORIZED, 'Invalid token')

    // update user
    const updateData = { verifyToken: null, isActive: true }
    const updatedUser = await userModel.update(existUser._id, updateData)

    return pickUser(updatedUser)
  } catch (error) { throw error }
}

const login = async (reqBody) => {
  try {
    // query user trong database
    const existUser = await userModel.findOneByEmail(reqBody.email)
    if (!existUser) throw new ApiError(StatusCodes.NOT_FOUND, 'Account not found!')

    // check xem user đã active chưa
    if (!existUser.isActive) throw new ApiError(StatusCodes.NOT_ACCEPTABLE, 'Your account not active!')

    // check password
    const isMatch = bcryptjs.compareSync(reqBody.password, existUser.password)
    if (!isMatch) throw new ApiError(StatusCodes.UNAUTHORIZED, 'Invalid password')

    // thong tin se dinh kem trong JWT token gom _id va email cua user
    const userInfo = { _id: existUser._id, email: existUser.email }

    // generate access token
    const accessToken = await JwtProvider.generateToken(
      userInfo,
      env.ACCESS_TOKEN_SECRET_SIGNATURE,
      env.ACCESS_TOKEN_LIFE
      // 5
    )
    // generate refresh token
    const refreshToken = await JwtProvider.generateToken(
      userInfo,
      env.REFRESH_TOKEN_SECRET_SIGNATUTE,
      env.REFRESH_TOKEN_SECRET_LIFE
      // 15
    )

    // return trả về dữ liệu cho phía controller
    return {
      ...pickUser(existUser),
      accessToken,
      refreshToken
    }
  } catch (error) { throw error }
}

const refreshToken = async (clientRefreshToken) => {
  try {
    // lay thong tin tu refresh token
    const refreshDecodedToken = await JwtProvider.verifyToken(clientRefreshToken, env.REFRESH_TOKEN_SECRET_SIGNATUTE)

    // thong tin se dinh kem trong JWT token gom _id va email cua user
    const userInfo = { _id: refreshDecodedToken._id, email: refreshDecodedToken.email }

    // generate access token
    const accessToken = await JwtProvider.generateToken(
      userInfo,
      env.ACCESS_TOKEN_SECRET_SIGNATURE,
      env.ACCESS_TOKEN_LIFE
    )

    return { accessToken }
  } catch (error) { throw error }
}

const update = async (userId, reqBody) => {
  try {
    // query user trong database
    const existUser = await userModel.findOneById(userId)
    if (!existUser) throw new ApiError(StatusCodes.NOT_FOUND, 'Account not found!')
    if (!existUser.isActive) throw new ApiError(StatusCodes.NOT_ACCEPTABLE, 'Your account not active!')

    // update user result
    let updatedUser = {}

    // update password
    if (reqBody.current_password && reqBody.new_password) {
      // check password
      const isMatch = bcryptjs.compareSync(reqBody.current_password, existUser.password)
      if (!isMatch) throw new ApiError(StatusCodes.NOT_ACCEPTABLE, 'Your current password is not correct!')

      updatedUser = await userModel.update(existUser._id, {
        password: bcryptjs.hashSync(reqBody.new_password, 8)
      })
    } else {
      // update other fields
      updatedUser = await userModel.update(existUser._id, reqBody)
    }

    return pickUser(updatedUser)
  } catch (error) { throw error }
}

export const userService = {
  createNew,
  verifyAccount,
  login,
  refreshToken,
  update
}
