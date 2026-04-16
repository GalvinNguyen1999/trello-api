import { cardModel } from '~/models/cardModel'
import { columnModel } from '~/models/columnModel'

const createNew = async (reqBody) => {
  try {
    const createdCard = await cardModel.createNew({ ...reqBody })
    const getNewCard = await cardModel.findOneById(createdCard.insertedId)
    if (getNewCard) {
      await columnModel.pushCardOrderIds(getNewCard)
    }

    return getNewCard
  } catch (error) { throw error }
}

const update = async (cardId, reqBody) => {
  try {
    const updateData = {
      ...reqBody,
      updatedAt: new Date()
    }

    const updatedCard = await cardModel.update(cardId, updateData)
    return updatedCard
  } catch (error) { throw error }
}

export const cardService = {
  createNew,
  update
}
