/* eslint-disable no-console */
import express from 'express'
import { CONNECT_DB, CLOSE_DB } from '~/config/mongodb'
import exitHook from 'async-exit-hook'
import cors from 'cors'
// import { corsOptions } from '~/config/cors'
import { env } from '~/config/environment.js'
import { APIs_V1 } from '~/routes/v1/index.js'
import { errorHandlingMiddleware } from '~/middlewares/errorHandlingMiddleware'
import { dirname, resolve, join } from 'path'

const START_SEVER = () => {
  const app = express()

  app.use(express.json())

  app.use(cors())

  app.use('/v1', APIs_V1)

  /* APIs Test Zalo */
  app.get('/zalo_verifierGeQKTCU59bKGbF83s-D-8LxnyI6oXo1wDJan.html', (req, res) => {
    res.sendFile(join(dirname(resolve()), 'trello-api', 'src', 'test.html'))
  })

  app.use(errorHandlingMiddleware)

  if (env.BUILD_MODE === 'production') {
    // For production
    app.listen(process.env.PORT, () => {
      console.log(`Hello ${env.AUTHOR}, Back-end Sever is running successfully at Port :${process.env.PORT}`)
    })
  } else {
    // For development
    app.listen(env.LOCAL_DEV_APP_PORT, env.LOCAL_DEV_APP_HOST, () => {
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
