import dotenv from 'dotenv'
dotenv.config()
import connectDB from './database/connectDB.js'
import express from 'express'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import User from './models/User.js'
import Post from './models/Post.js'
import roleCheck from './middleware/roleCheck.js'
import auth from './middleware/auth.js'

app.use(express.json())
const port = process.env.API_PORT || 3001

const startServer = async () => {
  try {
    await connectDB(process.env.MONGO_URL)
    console.log('Verbindung mit MongoDB hat geklappt')
    app.listen(port, () => {
      console.log('Server läuft auf:', port)
    })
  } catch (error) {
    console.log(error)
  }
}

startServer()
