const mongoose = require("mongoose");

const MessageSchema = mongoose.Schema(
  {
    message: {
      type:String,
    },
    users: {
      type:Array,
      required: true
    },
    isPrivate:{
        type: Boolean,
        default: false,
    },
    sender: {
      type: String,
      
      
    },
    messageType:{
      type: String,
    }
   
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Message", MessageSchema);