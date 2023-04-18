const express = require('express')
const router = express.Router()

const { handleLogin } = require('../controllers/loginController')

// router.post('/', addNewUser)

router.post('/', handleLogin)

module.exports =router