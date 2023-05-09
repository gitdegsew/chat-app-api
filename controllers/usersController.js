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
    const user = await User.findOne({_id:id}).populate('groups')

    return res.status(200).json(user)

}
const updateUnseen = async (req,res) => {
    const {id} = req.params
    const  {unseen} = req.body
    console.log("from update unseen ",req.body)
    const user = await User.findOneAndUpdate({_id:id},{unseen:unseen})
   

    return res.status(201).json(user)

}

module.exports ={getUsers,getUser,updateUnseen}

