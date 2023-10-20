import express from 'express'
import { StatusCodes } from 'http-status-codes'
import { boardRoute } from '~/routes/v1/boardRoute'
const Router = express.Router()

/* Check API /v1/status */
Router.get('/status', (req, res) => {
  res.status(StatusCodes.OK).json({ message: 'APIs v1 already to use' })
})

/* APIs Board */
Router.use('/boards', boardRoute)

export const APIs_V1 = Router
