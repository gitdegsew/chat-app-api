const mongoose = require('mongoose')

const  MONURL = "mongodb://127.0.0.1:27017/chatdb"

const connectDb=async()=>{
    try {
        await mongoose.connect(MONURL,
            {
                useUnifiedTopology: true,
                useNewUrlParser: true
            })
    } catch (error) {
        console.log(error)
    }
}

module.exports =connectDb