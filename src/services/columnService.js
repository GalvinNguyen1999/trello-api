import { columnModel } from '~/models/columnModel'
import { boardModel } from '~/models/boardModel'

const createNew = async (reqBody) => {
  try {
    const createdColumn = await columnModel.createNew({ ...reqBody })
    const getNewColumn = await columnModel.findOneById(createdColumn.insertedId)
    if (getNewColumn) {
      await boardModel.pushColumnOrderIds(getNewColumn)
    }

    return getNewColumn
  } catch (error) { throw error }
}

const update = async (columnId, columnData) => {
  try {
    const updatedColumn = await columnModel.update(columnId, {
      ...columnData,
      updatedAt: Date.now()
    })
    return updatedColumn
  } catch (error) { throw error }
}

export const columnService = {
  createNew,
  update
}
