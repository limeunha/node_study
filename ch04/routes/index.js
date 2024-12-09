const express = require('express')
const User = require('../models/user')

const router = express.Router()

router.get('/', async (req, res, next) => {
   try {
      const users = await User.findAll()
      res.status(200).json(users)
   } catch (error) {
      console.error(error)
      next(error)
   }
})

module.exports = router
