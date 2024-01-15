import { slugify } from '~/utils/formatters'
import { boardModel } from '~/models/boardModel'
import { columnModel } from '~/models/columnModel'
import { cardModel } from '~/models/cardModel'
import ApiError from '~/utils/ApiError'
import { StatusCodes } from 'http-status-codes'
import { cloneDeep } from 'lodash'

const createNew = async (reqBody) => {
  try {
    const newBoard = {
      ...reqBody,
      slug: slugify(reqBody.title)
    }

    const createdBoard = await boardModel.createNew(newBoard)

    const getNewBoard = await boardModel.findOneById(createdBoard.insertedId)

    return getNewBoard
  } catch (error) { throw error }
}

const getDetails = async (boardId) => {
  try {
    const board = await boardModel.getDetails(boardId)
    if (!board) {
      throw new ApiError(StatusCodes.NOT_FOUND, 'Board not found')
    }

    const resBoard = cloneDeep(board)
    resBoard.columns.forEach(column => {
      column.cards = resBoard.cards.filter(card => card.columnId.equals(column._id))
    })
    delete resBoard.cards

    return resBoard
  } catch (error) { throw error }
}

const update = async (boardId, boardData) => {
  try {
    const updatedBoard = await boardModel.update(boardId, {
      ...boardData,
      updatedAt: Date.now()
    })
    return updatedBoard
  } catch (error) { throw error }
}

const moveCardToDifferentColumn = async (reqBody) => {
  try {
    // update cardOrderIds in previous column
    await columnModel.update(reqBody.prevColumnId, {
      updatedAt: Date.now(),
      cardOrderIds: reqBody.prevCardOrderIds
    })

    // update cardOrderIds in next column
    await columnModel.update(reqBody.nextColumnId, {
      updatedAt: Date.now(),
      cardOrderIds: reqBody.nextCardOrderIds
    })

    // update card in column
    await cardModel.update(reqBody.currentCardId, {
      updatedAt: Date.now(),
      columnId: reqBody.nextColumnId
    })

    return { updateResult: 'Successfully' }
  } catch (error) { throw error }
}

export const boardService = {
  createNew,
  getDetails,
  update,
  moveCardToDifferentColumn
}
