const User = require('../model/User');



const findUserGroups = async (req, res) =>{
    const {userId} = req.body
    if(!userId) return res.sendStatus(400)
    const groupIds = await User.find({_id:userId}, 'groups')
    console.log(groupIds)

    res.status(200).json(groupIds)

}

const getUsers = async (req,res) => {
    
    
    const users = await User.find()

    return res.status(200).json(users)

}
const getUser = async (req,res) => {
    const {id} = req.params
    const user = await User.findOne({_id:id})

    return res.status(200).json(user)

}

module.exports ={getUsers,getUser}

