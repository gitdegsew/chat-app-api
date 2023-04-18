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
        
        message: msg.message.text,
        users:msg.users,
        isPrivate:msg.isPrivate,
        sender:msg.sender
      };
    });
    res.json(projectedMessage);
  } catch (ex) {
    next(ex);
  }
};

const addMessage = async (req, res, next) => {
  try {
    const { from, to,message,isPrivate } = req.body;
    
    if (!from && !to && !isPrivate) return res.status(400).json({ 'message': 'Invalid data' });
    const user=await User.findOne({_id:from})
    const data = await Message.create({
      message: { text: message },
      users: [from, to],
      sender: !isPrivate?user:undefined,
      isPrivate:isPrivate
     
    });

    if (data) return res.json({ msg: "Message added successfully." });
    else return res.json({ msg: "Failed to add message to the database" });
  } catch (ex) {
    next(ex);
  }
};

module.exports = {getMessages,addMessage}