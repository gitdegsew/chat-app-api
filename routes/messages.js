const express = require('express')
const router = express.Router()
const {addMessage, getMessages} = require('../controllers/messageController.js')


// router.post('/', addNewUser)

router.post('/', addMessage)
router.get('/:from/:to/:priv', getMessages)

module.exports =router