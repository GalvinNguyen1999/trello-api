import { StatusCodes } from 'http-status-codes'
import { boardModel } from '~/models/boardModel'
import { invitationModel } from '~/models/invitationModel'
import { userModel } from '~/models/userModel'
import ApiError from '~/utils/ApiError'
import { BOARD_INVITATION_STATUS, INVITATION_TYPES } from '~/utils/constants'
import { pickUser } from '~/utils/formatters'

const createNewBoardInvitation = async (reqBody, inviterId) => {
  try {
    const inviter = await userModel.findOneById(inviterId)
    const invitee = await userModel.findOneByEmail(reqBody.inviteeEmail)
    const board = await boardModel.findOneById(reqBody.boardId)

    if (!inviter || !invitee || !board) {
      throw new ApiError(StatusCodes.NOT_FOUND, 'Inviter, invitee or board not found')
    }

    const newBoardInvitation = {
      inviterId,
      inviteeId: invitee._id.toString(),
      type: INVITATION_TYPES.BOARD_INVITATION,
      boardInvitation: {
        boardId: board._id.toString(),
        status: BOARD_INVITATION_STATUS.PENDING
      }
    }

    const createNewInvitation = await invitationModel.createNewInvitation(newBoardInvitation)
    const getInvitation = await invitationModel.findOneById(createNewInvitation.insertedId.toString())

    const resInvitation = {
      ...getInvitation,
      board,
      inviter: pickUser(inviter),
      invitee: pickUser(invitee)
    }

    return resInvitation
  } catch (error) { throw error }
}

const getInvitations = async (userId) => {
  try {
    const getInvitations = await invitationModel.findByUser(userId)

    const resInvitations = getInvitations.map(invitation => ({
      ...invitation,
      board: invitation.board[0] || {},
      inviter: invitation.inviter[0] || {},
      invitee: invitation.invitee[0] || {}
    }))

    return resInvitations
  } catch (error) { throw error }
}

/**
 * Cập nhật trạng thái lời mời
 * @param {string} invitationId - ID của lời mời
 * @param {string} userId - ID của người dùng
 * @param {string} status - Trạng thái lời mời
 * @returns {Promise<Object>} - Kết quả cập nhật
 */
const updateBoardInvitation = async (invitationId, userId, status) => {
  try {
    const getInvitation = await invitationModel.findOneById(invitationId)
    if (!getInvitation) throw new ApiError(StatusCodes.NOT_FOUND, 'Invitation not found')

    const boardId = getInvitation.boardInvitation.boardId
    const board = await boardModel.findOneById(boardId)
    if (!board) throw new ApiError(StatusCodes.NOT_FOUND, 'Board not found')

    const boardOwnerAndMemberIds = [...board.ownerIds, ...board.memberIds].toString()
    if (status === BOARD_INVITATION_STATUS.ACCEPTED && boardOwnerAndMemberIds.includes(userId.toString())) {
      throw new ApiError(StatusCodes.NOT_ACCEPTABLE, 'You are already a member of this board')
    }

    const updateData = {
      boardInvitation: {
        ...getInvitation.boardInvitation,
        status: status // ACCEPTED or REJECTED
      }
    }

    const updatedInvitation = await invitationModel.update(invitationId, updateData)

    if (updatedInvitation.boardInvitation.status === BOARD_INVITATION_STATUS.ACCEPTED) {
      await boardModel.pushMemberIds(boardId, userId)
    }

    return updatedInvitation
  } catch (error) { throw error }
}

export const invitationService = {
  createNewBoardInvitation,
  getInvitations,
  updateBoardInvitation
}
