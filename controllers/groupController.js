const  Group = require('../model/Group')
const  User = require('../model/User')

const createGroup = async(req,res) =>{
    const {groupName,userId} =req.body
    if(!groupName || !userId) return res.status(400).json({message:"Invalid data"})
    const group = await Group.findOne({groupName})
    if(group) return res.status(409).json({message:"Group already exists"})
    const createdGroup = await Group.create({
        "groupName":groupName,
        "owner":userId,
        "members":[userId]
    })

    return res.status(201).json(createdGroup)

}

const joinGroup =async(req, res) =>{
    const {groupName,userId} = req.body
    if(!groupName || !userId) return res.status(400).json({message: 'Invalid data'})
    const group = await Group.findOne({groupName})
    if(!group) return res.status(404).json({message: 'Group not found '})

    User.findOneAndUpdate({_id:userId},{$push: {"groups":{group_id}}})
    const updatedGroup = await Group.findOneAndUpdate({groupName},{$push: {"members":{userId}}})

    return res.status(201).json(updatedGroup)
}

const leaveGroup = async (req,res) =>{
    const {groupName,userId} = req.body
    if(!groupName || !userId) return res.status(400).json({message: 'Invalid data'})
    const group = await Group.findOne({groupName})
    if(!group) return res.status(404).json({message: 'Group not found '})

    User.findOneAndUpdate({_id:userId},{$pull: {"groups":{group_id}}})
    const updatedGroup = await Group.findOneAndUpdate({groupName},{$pull: {"members":{userId}}})

    return res.status(201).json(updatedGroup)
}




const findAllGroups = async (req,res) => {
    const groups = await Group.find()

    return res.status(200).json(groups)

}

module.exports = {createGroup,findAllGroups}