const express = require('express')
const router = express.Router()
const {addMessage, getMessages,addImage} = require('../controllers/messageController.js')


// router.post('/', addNewUser)

router.post('/', addMessage)
router.get('/:from/:to/:priv', getMessages)
router.post('/image', addImage)

module.exports =router