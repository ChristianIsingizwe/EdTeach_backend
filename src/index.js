import express from 'express'
import dotenv from 'dotenv'
import cors from 'cors'

dotenv.config(); 

app.use(cors())
app.use(express.json())



const port = process.env.APP_PORT || 5000
const app = express()
