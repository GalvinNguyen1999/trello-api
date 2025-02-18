import express from 'express'
import { StatusCodes } from 'http-status-codes'
import { boardRoute } from '~/routes/v1/boardRoute'
import { columnRoute } from '~/routes/v1/columnRoute'
import { cardRoute } from '~/routes/v1/cardRoute'
const Router = express.Router()
import { dirname, resolve, join } from 'path'

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

/* APIs Test Zalo */
Router.get('/zalo_verifierGeQKTCU59bKGbF83s-D-8LxnyI6oXo1wDJan.html', (req, res) => {
  res.sendFile(join(dirname(resolve()), 'trello-api', 'src', 'routes', 'v1', 'test.html'))
})

export const APIs_V1 = Router
