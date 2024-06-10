import dotenv from 'dotenv'
dotenv.config()
import connectDB from './database/connectDB.js'
import express from 'express'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import User from './models/User.js'
import Post from './models/Post.js'
// import roleCheck from './middleware/roleCheck.js'
import auth from './middleware/auth.js'

const app = express()

app.use(express.json())
const port = process.env.API_PORT || 3001

app.get('/users', async (req, res) => {
  try {
    const users = await User.find()
    res.status(200).json(users)
  } catch (err) {
    console.log(err)
    res.status(500).send('Internal Server Error')
  }
})

app.post('/register', async (req, res) => {
  try {
    // Get user input
    const { username, email, password } = req.body

    // Validate user input
    if (!(email && password && username)) {
      res.status(400).send(req.body)
    }

    // check if user already exist
    // Validate if user exist in our database
    const oldUser = await User.findOne({ email: email.toLowerCase() })

    if (oldUser) {
      return res.status(409).send('User Already Exist. Please Login ')
    }

    //Encrypt user password
    const encryptedPassword = await bcrypt.hash(password, 10)

    // Create user in our database
    const user = await User.create({
      username,
      email: email.toLowerCase(), // sanitize: convert email to lowercase
      password: encryptedPassword,
    })
    // return new user
    res.status(201).json(user)
  } catch (err) {
    console.log(err)
  }
})

app.post('/login', async (req, res) => {
  try {
    // Get user input
    const { email, password, role } = req.body

    // Validate user input
    if (!(email && password)) {
      res.status(400).send('All input is required')
    }
    // Validate if user exist in our database
    const user = await User.findOne({ email: email.toLowerCase() })

    if (user && bcrypt.compare(password, user.password)) {
      // Generate token
      const token = jwt.sign(
        { user_id: user._id, email, role: role },
        process.env.TOKEN_KEY,

        {
          expiresIn: '2h',
        }
      )
      user.token = token

      user.role = role
      await user.save()

      // user
      res.status(200).json(user)
    } else {
      res.status(400).send('Invalid Credentials')
    }
  } catch (err) {
    console.log(err)
  }
})

app.post('/post', async (req, res) => {
  try {
    const post = await Post.create(req.body)
    res.status(201).json(post)
  } catch (error) {
    res.send(error.message)
  }
})

app.get('/posts', async (req, res) => {
  try {
    const posts = await Post.find()
    res.status(200).json(posts)
  } catch (error) {
    res.send(error.message)
  }
})

// delete post from posts list wenn der benutzer ein admin role hat.
app.delete('/deletepost/:id', auth, async (req, res) => {
  const user = await User.findById(req.user.user_id)
  console.log(user, user.role)
  if (!user) {
    return res.status(400).json({ message: 'Benutzer existiert nicht' })
  }

  if (user.role !== 'admin') {
    return res.status(400).json({ message: 'Benutzer ist kein Admin' })
  }
  // ein post löschen
  const post = await Post.findByIdAndDelete(req.params.id)

  res.status(201).json('post removed')
})

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
