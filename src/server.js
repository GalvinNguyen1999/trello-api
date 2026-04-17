/* eslint-disable no-console */
import express from 'express'
import { CONNECT_DB, CLOSE_DB } from '~/config/mongodb'
import exitHook from 'async-exit-hook'
import cors from 'cors'
import { corsOptions } from '~/config/cors'
import { env } from '~/config/environment.js'
import { APIs_V1 } from '~/routes/v1/index.js'
import { errorHandlingMiddleware } from '~/middlewares/errorHandlingMiddleware'
import cookieParser from 'cookie-parser'
import socketIo from 'socket.io'
import http from 'http'
import { inviteUserToBoardSocket } from '~/sockets/inviteUserToBoardSocket'

const START_SEVER = () => {
  const app = express()

  // Fix cache from disk cuar express
  app.use((req, res, next) => {
    res.set('Cache-Control', 'no-store')
    next()
  })

  app.use(express.json())

  app.use(cookieParser())

  app.use(cors(corsOptions))

  app.use('/v1', APIs_V1)

  app.use(errorHandlingMiddleware)

  // Create HTTP server
  const server = http.createServer(app)

  // Create Socket.IO instance
  const io = new socketIo.Server(server, { cors: corsOptions })

  // Handle socket connection
  io.on('connection', (socket) => {
    inviteUserToBoardSocket(socket)
  })

  if (env.BUILD_MODE === 'production') {
    // For production
    server.listen(process.env.PORT, () => {
      console.log(`Hello ${env.AUTHOR}, Back-end Sever is running successfully at Port :${process.env.PORT}`)
    })
  } else {
    // For development
    server.listen(env.LOCAL_DEV_APP_PORT, env.LOCAL_DEV_APP_HOST, () => {
      console.log(`Hello ${env.AUTHOR}, Back-end Sever is running successfully at Host: ${env.LOCAL_DEV_APP_HOST} and Port :${env.LOCAL_DEV_APP_PORT}`)
    })
  }

  exitHook(() => {
    CLOSE_DB()
  })
}

CONNECT_DB()
  .then(() => console.log('Connected to Mongodb Cloud Atlas'))
  .then(() => START_SEVER())
  .catch(error => {
    console.error(error)
    process.exit(0)
  })
