import { StatusCodes } from 'http-status-codes'
import { invitationService } from '~/services/invitationService'

const createNewBoardInvitation = async (req, res, next) => {
  try {
    const inviterId = req.jwtDecoded._id
    const resInvitation = await invitationService.createNewBoardInvitation(req.body, inviterId)
    res.status(StatusCodes.CREATED).json(resInvitation)
  } catch (error) { next(error) }
}

const getInvitations = async (req, res, next) => {
  try {
    const userId = req.jwtDecoded._id
    const resInvitations = await invitationService.getInvitations(userId)
    res.status(StatusCodes.OK).json(resInvitations)
  } catch (error) { next(error) }
}

/**
 * Cập nhật trạng thái lời mời
 * @param {Object} req - Request object
 * @param {Object} res - Response object
 * @param {Function} next - Next function
 * @returns {Promise<Object>} - Kết quả cập nhật
 */
const updateBoardInvitation = async (req, res, next) => {
  try {
    const userId = req.jwtDecoded._id
    const { invitationId } = req.params
    const { status } = req.body

    const updatedInvitation = await invitationService.updateBoardInvitation(invitationId, userId, status)
    res.status(StatusCodes.OK).json(updatedInvitation)
  } catch (error) { next(error) }
}

export const invitationController = {
  createNewBoardInvitation,
  getInvitations,
  updateBoardInvitation
}
