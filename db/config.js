const mongoose = require('mongoose')

const  MONURL = "mongodb+srv://degsew:1234@cluster0.pzg4zhe.mongodb.net/chat?retryWrites=true&w=majority"

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