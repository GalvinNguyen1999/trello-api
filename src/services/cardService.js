import { cardModel } from '~/models/cardModel'
import { columnModel } from '~/models/columnModel'
import { CloudinaryProvider } from '~/providers/CloudinaryProvider'

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

const update = async (cardId, reqBody, cardCoverFile) => {
  try {
    const updateData = {
      ...reqBody,
      updatedAt: new Date()
    }

    let updatedCard = {}

    if (cardCoverFile) {
      // upload file lên cloudinary
      const uploadResult = await CloudinaryProvider.streamUpload(cardCoverFile.buffer)
      // update cover
      updatedCard = await cardModel.update(cardId, { cover: uploadResult.secure_url })
    } else {
      updatedCard = await cardModel.update(cardId, updateData)
    }
    return updatedCard
  } catch (error) { throw error }
}

export const cardService = {
  createNew,
  update
}
