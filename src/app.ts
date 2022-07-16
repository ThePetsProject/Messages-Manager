import express from 'express'
import cors, { CorsOptions } from 'cors'
import { routesArray } from './infrastructure/routes'
import dotenv from 'dotenv'
require('newrelic')

dotenv.config()

const app = express()
const router = express.Router()

const corsOptions: CorsOptions = {
  origin: 'https://thepetsproject.org',
  optionsSuccessStatus: 200,
}

app.use(cors())
app.use(express.urlencoded({ extended: true }))
app.use(express.json())

app.use('/api/v1/messaging', routesArray(router))

export default app
