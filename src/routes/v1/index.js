import express from 'express'
import { StatusCodes } from 'http-status-codes'
import { boardRoute } from '~/routes/v1/boardRoute'
import { columnRoute } from '~/routes/v1/columnRoute'
import { cardRoute } from '~/routes/v1/cardRoute'
import axios from 'axios'

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

/* APIs Zalo Test */
Router.use('/zalo', async (req, res) => {
  const { event_name, recipient } = req.body
  console.log('🚀 ~ Router.use ~ req.body:', req.body)

  if (event_name == 'user_received_message') {
    try {
      await axios.post(
        'https://openapi.zalo.me/v3.0/oa/message/cs',
        {
          recipient: {
            user_id: recipient?.id
          },
          message: {
            text: '1234'
          }
        },
        {
          headers: {
            'Content-Type': 'application/json',
            'access_token': process.env.ZALO_OA_ACCESS_TOKEN
          }
        }
      )
    } catch (error) {
      console.log('Error: ', error)
    }
  }
  res.status(StatusCodes.OK).json({ message: 'Successfully' })
})

export const APIs_V1 = Router
