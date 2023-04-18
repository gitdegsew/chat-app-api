const mongoose = require("mongoose");

const MessageSchema = mongoose.Schema(
  {
    message: {
      text: { type: String, required: true },
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
      type: Object,
      
      
    },
   
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Message", MessageSchema);