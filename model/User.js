const mongoose = require('mongoose')

const userSchema = new mongoose.Schema(
    {
        username:{
            type:String,
            required:true,
        },
        password:{
            type:String,
            required:true,
        },
        groups:[{
            type:mongoose.Schema.Types.ObjectId,
            ref:'Group',
           
        }],
        // groups:{
        //     type:Array,
            
        //     default:[]
        // },
        isOnline:{
            type:Boolean,
            default:false
        },
        unseen:{
            type:Array,
            default:[]
        },
        
        isAvatarImageSet: {
            type: Boolean,
            default: false,
          },
          avatarImage: {
            type: String,
            default: "",
          },
          
        


    }
)

module.exports = mongoose.model('User',userSchema)