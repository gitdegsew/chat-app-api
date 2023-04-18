const express = require('express')
const router = express.Router()
const {getUsers,getUser} = require('../controllers/usersController')


// router.post('/', addNewUser)


router.get('/:id', getUser)
router.get('/', getUsers)

module.exports =router