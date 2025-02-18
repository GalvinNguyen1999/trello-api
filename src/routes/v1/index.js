import express from 'express'
import { StatusCodes } from 'http-status-codes'
import { boardRoute } from '~/routes/v1/boardRoute'
import { columnRoute } from '~/routes/v1/columnRoute'
import { cardRoute } from '~/routes/v1/cardRoute'
const Router = express.Router()

/* Check API /v1/status */
Router.get('/status', (req, res) => {
  res.status(StatusCodes.OK).json({ message: 'APIs v1 already to use' })
})

/* APIs Board */
Router.use('/boards', boardRoute)

/* APIs Column */
Router.use('/columns', columnRoute)

/* APIs Card */
Router.use('/cards', cardRoute)

export const APIs_V1 = Router
