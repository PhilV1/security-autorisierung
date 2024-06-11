function roleCheck(targetRole) {
  // This is a common pattern in Express middleware
  // It's a function that returns another function
  // a "higher-order function"

  // The inner function is the actual middleware
  // It has access to the targetRole variable

  return function roleCheckMiddleware(req, res, next) {
    try {
      console.log(req.user, targetRole)
      if (req.user.role !== targetRole) {
        return res.status(403).json({ error: 'Unauthorized' })
      }
    } catch (error) {
      console.log(error.message)
    }

    next()
  }
}

export default roleCheck
