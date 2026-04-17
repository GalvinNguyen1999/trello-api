import Joi from 'joi'
import { ObjectId } from 'mongodb'
import { GET_DB } from '~/config/mongodb'
import { BOARD_INVITATION_STATUS, INVITATION_TYPES } from '~/utils/constants'
import { OBJECT_ID_RULE, OBJECT_ID_RULE_MESSAGE } from '~/utils/validators'
import { boardModel } from './boardModel'
import { userModel } from './userModel'

const INVITATION_COLLECTION_NAME = 'invitations'
const INVITATION_COLLECTION_SCHEMA = Joi.object({
  inviterId: Joi.string().required().pattern(OBJECT_ID_RULE).message(OBJECT_ID_RULE_MESSAGE),
  inviteeId: Joi.string().required().pattern(OBJECT_ID_RULE).message(OBJECT_ID_RULE_MESSAGE),
  type: Joi.string().required().valid(...Object.values(INVITATION_TYPES)),
  boardInvitation: Joi.object({
    boardId: Joi.string().required().pattern(OBJECT_ID_RULE).message(OBJECT_ID_RULE_MESSAGE),
    status: Joi.string().required().valid(...Object.values(BOARD_INVITATION_STATUS))
  }).optional(),
  createdAt: Joi.date().timestamp('javascript').default(Date.now),
  updatedAt: Joi.date().timestamp('javascript').default(null),
  _destroy: Joi.boolean().default(false)
})

const INVALID_UPDATE_FIELDS = ['_id', 'createdAt', 'inviterId', 'inviteeId', 'type']

/**
 * Validate dữ liệu trước khi tạo lời mời
 * @param {Object} data - Dữ liệu lời mời
 * @returns {Promise<Object>} - Kết quả validate
 */
const validateBeforeCreate = async (data) => {
  return await INVITATION_COLLECTION_SCHEMA.validateAsync(data, { abortEarly: false })
}

/**
 * Tạo lời mời mới
 * @param {Object} data - Dữ liệu lời mời
 * @returns {Promise<Object>} - Kết quả tạo lời mời
 */
const createNewInvitation = async (data) => {
  try {
    const validData = await validateBeforeCreate(data)
    const newInvitationToAdd = {
      ...validData,
      inviterId: new ObjectId(validData.inviterId),
      inviteeId: new ObjectId(validData.inviteeId)
    }

    if (validData.boardInvitation) {
      newInvitationToAdd.boardInvitation = {
        ...validData.boardInvitation,
        boardId: new ObjectId(validData.boardInvitation.boardId)
      }
    }

    const createdInvitation = await GET_DB().collection(INVITATION_COLLECTION_NAME).insertOne(newInvitationToAdd)
    return createdInvitation
  } catch (error) { throw new Error(error)}
}

/**
 * Tìm kiếm lời mời theo ID
 * @param {string} id - ID của lời mời
 * @returns {Promise<Object>} - Kết quả tìm kiếm
 */
const findOneById = async (id) => {
  try {
    const result = await GET_DB().collection(INVITATION_COLLECTION_NAME).findOne({ _id: new ObjectId(id) })
    return result
  } catch (error) { throw new Error(error)}
}

/**
 * Cập nhật lời mời
 * @param {string} id - ID của lời mời
 * @param {Object} data - Dữ liệu cập nhật
 * @returns {Promise<Object>} - Kết quả cập nhật
 */
const update = async (id, data) => {
  try {
    Object.keys(data).forEach(field => {
      if (INVALID_UPDATE_FIELDS.includes(field)) {
        delete data[field]
      }
    })

    if (data.boardInvitation) {
      data.boardInvitation = {
        ...data.boardInvitation,
        boardId: new ObjectId(data.boardInvitation.boardId)
      }
    }

    const result = await GET_DB().collection(INVITATION_COLLECTION_NAME).findOneAndUpdate(
      { _id: new ObjectId(id) },
      { $set: data },
      { returnDocument: 'after' }
    )
    return result
  } catch (error) { throw new Error(error)}
}

/**
 * Lấy tất cả lời mời của người nhận
 * @param {string} userId - ID của người nhận lời mời
 * @returns {Promise<Array>} - Mảng các lời mời
 */
const findByUser = async (userId) => {
  try {
    const queryConditions = [
      { inviteeId: new ObjectId(userId) }, // người nhận lời mời
      { _destroy: false } // chưa bị hủy
    ]

    const results = await GET_DB().collection(INVITATION_COLLECTION_NAME).aggregate([ // aggregate để lấy thông tin bảng, người gửi lời mời và người nhận lời mời
      { $match: { $and: queryConditions } },
      // lấy thông tin bảng
      { $lookup: {
        from: boardModel.BOARD_COLLECTION_NAME, // tên collection của bảng
        localField: 'boardInvitation.boardId', // field của bảng trong boardInvitation
        foreignField: '_id', // field của bảng trong board
        as: 'board' // tên của bảng trong board
      } },
      // lấy thông tin người gửi lời mời
      { $lookup: {
        from: userModel.USER_COLLECTION_NAME, // tên collection của người gửi lời mời
        localField: 'inviterId', // field của người gửi lời mời trong invitation
        foreignField: '_id', // field của người gửi lời mời trong user
        as: 'inviter', // tên của người gửi lời mời trong invitation dùng để trả về dưới dạng object
        pipeline: [{ $project: { 'password': 0, 'verifyToken': 0 } }] // pipeline để ẩn các field password và verifyToken
      } },
      // lấy thông tin người nhận lời mời
      { $lookup: {
        from: userModel.USER_COLLECTION_NAME,
        localField: 'inviteeId', // field của người nhận lời mời trong invitation
        foreignField: '_id', // field của người nhận lời mời trong user
        as: 'invitee', // tên của người nhận lời mời trong invitation dùng để trả về dưới dạng object
        pipeline: [{ $project: { 'password': 0, 'verifyToken': 0 } }] // pipeline để ẩn các field password và verifyToken
      } }
    ]).toArray()

    return results || [] // trả về mảng các lời mời hoặc mảng rỗng nếu không tìm thấy
  } catch (error) { throw new Error(error) } // ném lỗi nếu có lỗi
}

export const invitationModel = {
  INVITATION_COLLECTION_NAME,
  INVITATION_COLLECTION_SCHEMA,
  createNewInvitation,
  findOneById,
  update,
  findByUser
}
