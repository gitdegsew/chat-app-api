const Message = require("../model/Message");
const User = require("../model/User");


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

    if (data) return res.json({ msg: "Message added successfully." });
    else return res.json({ msg: "Failed to add message to the database" });
  } catch (ex) {
    next(ex);
  }
};




const addImage = async (req, res, next) => {

  
  let {message,from,to,messageType,isPrivate,sender} = req.body
  console.log('adding image')
  console.log(req.body)
  try {
     
    // console.log("from add message ",req.body)
    if (req.file!==undefined)
    {
         message= "./messages/"+req.file["filename"]
    }
    
    if (!from && !to && !isPrivate) return res.status(400).json({ 'message': 'Invalid data' });
    // const user=await User.findOne({_id:from})
    console.log('from addImage:')
    // console.log(user)
    const data = await Message.create({
      message,
      users: [from, to],
      sender: sender,
      isPrivate:isPrivate,
      messageType
     
    });

    if (data) return res.json({ msg: "Message added successfully." });
    else return res.json({ msg: "Failed to add message to the database" });
  } catch (ex) {
    next(ex);
  }
};

module.exports = {getMessages,addMessage,addImage}