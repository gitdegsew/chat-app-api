const mongoose = require('mongoose')

const groupSchema = new mongoose.Schema(
    {
        groupName:{
            type:String,
            required:true,
        },
        owner:{
            type:String,
            required:true,
        },
        members:[{
            type:mongoose.Schema.Types.ObjectId,
            ref:"User",
           
        }],
        chats:{type:Array, default:[]},
        


    }
)

module.exports = mongoose.model('Group',groupSchema)