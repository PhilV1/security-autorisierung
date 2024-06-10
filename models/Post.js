import mongoose from 'mongoose'

const postSchema = new mongoose.Schema({
  owner: {
    type: mongoose.Types.ObjectId,
    required: true,
    ref: 'SecureUsers',
  },
  content: String,
})

const Post = mongoose.model('UserPosts', postSchema)
export default Post
