const express = require('express')
const router = express.Router()
const {getUsers,getUser,updateUnseen} = require('../controllers/usersController')


// router.post('/', addNewUser)


router.get('/:id', getUser)
router.get('/', getUsers)
router.put('/:id',updateUnseen)

module.exports =router