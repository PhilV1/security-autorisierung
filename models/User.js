import mongoose from 'mongoose'

const userSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  token: { type: String },
  role: { type: String, default: 'benutzer' },
})

const User = mongoose.model('SecureUsers', userSchema)
export default User
