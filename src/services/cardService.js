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

const update = async (cardId, reqBody, cardCoverFile, userInfo) => {
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
    } else if (updateData.commentToAdd) {
      // tạo dữ liệu comment để thêm vào database, cần bổ sung thêm những field cần thiết
      const commentData = {
        ...updateData.commentToAdd,
        commentAt: new Date(),
        userId: userInfo._id,
        userEmail: userInfo.email
      }
      // thêm comment vào đầu danh sách comments của card
      updatedCard = await cardModel.unShiftNewComment(cardId, commentData)
    }
    else {
      updatedCard = await cardModel.update(cardId, updateData)
    }
    return updatedCard
  } catch (error) { throw error }
}

export const cardService = {
  createNew,
  update
}
