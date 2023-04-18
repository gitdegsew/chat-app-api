const express = require('express')
const router = express.Router()
const {addNewUser} = require('../controllers/registerController')


router.post('/', addNewUser)

// router.post('/login', handleLogin)

module.exports =router