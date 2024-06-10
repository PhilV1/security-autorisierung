import jwt from 'jsonwebtoken'

const config = process.env
const auth = (req, res, next) => {
  const token =
    req.body.token ||
    req.query.token ||
    req.headers.authorization?.split(' ')[1]

  if (!token) {
    return res.status(403).send('A token is required for authentication')
  }
  try {
    const decoded = jwt.verify(token, config.TOKEN_KEY)
    req.user = decoded

    return next()
  } catch (err) {
    return res.status(401).send(`${token} ${err.name}`)
  }
}

export default auth
