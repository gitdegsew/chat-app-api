const Message = require("../model/Message");
const User = require("../model/User");
const Group = require("../model/Group");


const getMessages = async (req, res, next) => {
  try {
    const { from, to,priv } = req.params;
    if (!from && !to ) return res.status(400).json({ 'message': 'Invalid data' });
    const queryArray=priv==1?[from,to]:[to]
    const message = await Message.find({
      users: {
        $all: queryArray,
      },
    }).sort({ updatedAt: 1 });

    const projectedMessage = message.map((msg) => {
      return {
        
        message: msg.message,
        users:msg.users,
        messageType:msg.messageType,
        isPrivate:msg.isPrivate,
        sender:msg.sender,
        createdAt:msg.createdAt
      };
    });
    res.json(projectedMessage);
  } catch (ex) {
    next(ex);
  }
};

const addMessage = async (req, res, next) => {
  try {
    const { from, to,message,messageType,sender,isPrivate } = req.body;
    console.log("from add message ",req.body)
    if (req.file!==undefined)
    {
         message= "./messages/"+req.file["filename"]
    }
    
    if (!from && !to && !isPrivate) return res.status(400).json({ 'message': 'Invalid data' });
    // const user=await User.findOne({_id:from})
    const data = await Message.create({
      message,
      users: [from, to],
      sender: sender,
      isPrivate:isPrivate,
      messageType
     
    });

    if(isPrivate){
      const user = await User.findOne({_id:to})
      user.unseen=[...user.unseen,{check:from,isPrivate:true}]
      await user.save()
    }else{
            const gF =await Group.findById(to).populate('members')
           const uI=gF.members.map(user =>user._id)
           const utu= await User.updateMany({_id:{$in:uI}},{ $push: { unseen: {check:to,isPrivate:false} } })
    }

    if (data) return res.status(201).status(201).json({ msg: "Message added successfully." });
    else return res.json({ msg: "Failed to add message to the database" });
  } catch (ex) {
    next(ex);
  }
};




const addImage = async (req, res, next) => {

  
  let {message,from,to,messageType,isPrivate,sender} = req.body
  // console.log('adding image')
  // console.log(typeof isPrivate)
  // console.log(req.body)
  try {
     
    // console.log("from add message ",req.body)
    if (req.file!==undefined)
    {
         message= "./messages/"+req.file["filename"]
    }
    
    if (!from && !to && !isPrivate) return res.status(400).json({ 'message': 'Invalid data' });
    // const user=await User.findOne({_id:from})
    // console.log('from addImage:')
    // console.log(user)
    const data = await Message.create({
      message,
      users: [from, to],
      sender: sender,
      isPrivate:isPrivate,
      messageType
     
    });
    if(isPrivate==="true"){
      const user = await User.findOne({_id:to})
      user.unseen=[...user.unseen,{check:from,isPrivate:true}]
      await user.save()
    }else if(isPrivate==="false"){
      //  console.log('from addImage not private updateMany:')
      const gF =await Group.findById(to).populate('members')
      const uI=gF.members.map(user =>user._id)
      const utu= await User.updateMany({_id:{$in:uI}},{ $push: { unseen: {check:to,isPrivate:false} } })
      // updateMany({},{ $push: { unseen: {check:to,isPrivate:false} } })
      // const users =await  User.find()
    }

    if (data) return res.status(201).json({ msg: "Message added successfully." });
    else return res.status(201).json({ msg: "Failed to add message to the database" });
  } catch (ex) {
    next(ex);
  }
};

module.exports = {getMessages,addMessage,addImage}