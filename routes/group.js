const express = require('express')
const router = express.Router()
const {creatGroup,findAllGroups, createGroup} = require('../controllers/groupController')


// router.post('/', addNewUser)

router.post('/', createGroup)
router.get('/', findAllGroups)

module.exports =router