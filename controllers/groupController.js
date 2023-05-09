const Group = require("../model/Group");
const User = require("../model/User");

const createGroup = async (req, res) => {
  const { groupName, userId } = req.body;
  if (!groupName || !userId)
    return res.status(400).json({ message: "Invalid data" });
  const group = await Group.findOne({ groupName });
  if (group) return res.status(409).json({ message: "Group already exists" });
  let createdGroup;
  let upG;
  try {
    createdGroup = await Group.create({
      groupName: groupName,
      owner: userId,
    });
    const id = createdGroup._id;
    // const updatedUser= User.findByIdAndUpdate(userId,{$push: {groups:id}}, { new: true, useFindAndModify: false })
    // const user =User.findOne({_id:userId})
    // if(!user.groups){
    //     user.groups =[id]
    //     await user.save()
    // }

    //  upG= Group.findByIdAndUpdate(id,{$push: {members:userId}}, { new: true, useFindAndModify: false })

    const upGroup = await Group.findByIdAndUpdate(
      id,
      { $push: { members: userId } },
      { new: true, useFindAndModify: false }
    );
    const upUser = await User.findByIdAndUpdate(
      userId,
      { $push: { groups: id } },
      { new: true, useFindAndModify: false }
    );
    // const toseeG= await Group.findById(id).populate('members')
    // const toseeU= await User.findById(userId).populate('groups')
    // console.log('updated user ',toseeU)
  } catch (error) {
    console.log("from createGroup");
    console.log(error);
  }
  return res.status(201).json(createdGroup);
};

const joinGroup = async (req, res) => {
  const { groupId, userId } = req.body;
  if (!groupId || !userId)
    return res.status(400).json({ message: "Invalid data" });

  const upGroup = await Group.findByIdAndUpdate(
    groupId,
    { $push: { members: userId } },
    { new: true, useFindAndModify: false }
  );
  const upUser = await User.findByIdAndUpdate(
    userId,
    { $push: { groups: groupId } },
    { new: true, useFindAndModify: false }
  );

  return res.status(201).json(upGroup);
};

const leaveGroup = async (req, res) => {
  const { groupId, userId } = req.body;
  if (!groupId || !userId)
    return res.status(400).json({ message: "Invalid data" });

  const upGroup = await Group.findByIdAndUpdate(
    groupId,
    { $pull: { members: userId } },
    { new: true, useFindAndModify: false }
  );
  const upUser = await User.findByIdAndUpdate(
    userId,
    { $pull: { groups: groupId } },
    { new: true, useFindAndModify: false }
  );

  return res.status(201).json(upGroup);
};

const getUserGroups = async (req, res) => {
  const { id } = req.params;
  if (!id) return res.status(400).json({ message: "Invalid data" });
  const groups = await User.findOne({ _id: id }).groups;
  const user = await User.findOne({ _id: id }).populate("groups");

  return res.status(200).json(user.groups);
};
const getGroupMembers = async (req, res) => {
  const { id } = req.params;
  if (!id) return res.status(400).json({ message: "Invalid data" });
  const users = await Group.findOne({ _id: id }).populate("members");
  // if(!user) return res.status(404).json({message: 'User not found '})
  // const groupIds=user.groups
  // console.log('from getUserGroups ',groupIds)
  // const groups=Group.find({_id:{
  //     $in:groupIds
  // }})

  return res.status(200).json(users);
};

const findAllGroups = async (req, res) => {
  const groups = await Group.find();

  return res.status(200).json(groups);
};

module.exports = { createGroup, findAllGroups, getUserGroups, joinGroup,leaveGroup };
