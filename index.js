const express = require('express')
const http = require('http')
const socketIo=require('socket.io')
const register= require('./routes/register')
const login= require('./routes/login')
const groups= require('./routes/group')
const messages = require('./routes/messages')
const users = require('./routes/users')
const cors=require('cors')
// const { addUser, removeUser, getUser, getUsersInRoom }=require('./users')
const {addNewUser} = require('./controllers/registerController')
const mongoose = require('mongoose')
const connectDb = require('./db/config')
const verifyJWT= require('./middleware/verifyJwt')
const   morgan = require('morgan')
const dotenv = require("dotenv")
const Group = require('./model/Group')
const Message = require('./model/Message')
const User = require('./model/User')
const multer =require('multer')



const Storage2 = multer.diskStorage (
  {destination: "../client/public/messages/",
  filename :(req,file,cb)=>{
      cb(null,Date.now() + file.originalname)
  }
}
)

const Upload2 = multer({
  storage:Storage2
})



dotenv.config()

connectDb()




const app=express()
app.use(cors())
app.use(express.urlencoded({ extended: false }));
app.use(express.json());
app.use(morgan('tiny'))
const server= http.createServer(app)




app.use('/register',register)
app.use('/login',login)


app.use(verifyJWT)
app.use('/groups',groups)
app.use('/messages',Upload2.single('imageMessage'),messages)
app.use('/users',users)


const io= socketIo(server,{cors: {
  origin: "*",
  
}})

global.onlineUsers = new Map();


io.on('connection', async(socket) =>{
    console.log("we have new connection")
    const groups = await Group.find()
    let loggedUserId
    const groupRooms= groups.map(group => group.groupName)
    global.chatSocket = socket;
    socket.on("login", async(user) => {
      loggedUserId= user.id
      socket.broadcast.emit("user-loggedIn", {user})
      console.log('login event received '+user.id)
      socket.join(groupRooms)
      onlineUsers.set(user.id, socket.id);

    });

    const handleMessageEvent =async(event,data) => {


      // console.log(`${event} received`);
      
     if(data.isPrivate){
      // console.log(data.isPrivate,dato.to)
      const sendUserSocket = onlineUsers.get(data.to);
      if (sendUserSocket) {
        
        socket.to(sendUserSocket).emit(event, data);
        if(event=='send-msg'){
          const tdata = await Message.create({
            message: data.message ,
            users: [data.from, data.to],
            sender: !data.isPrivate?data.sender:undefined,
            isPrivate:data.isPrivate
           
          });
         }
        
  
      }else{
        console.log('user not found')
        if(event=='send-msg'){
          const tdata = await Message.create({
            message: data.message ,
            users: [data.from, data.to],
            sender: !data.isPrivate?data.sender:undefined,
            isPrivate:data.isPrivate
           
          });
         }
       
       
      }
     }else{
      console.log("receive event emited to group")
        console.log(event, data.to)
        const group = groups.find(group=>group._id==data.to)
        const room=group.groupName
        socket.to(room).emit(event, data)
        
       if(event=='send-msg'){
        const tdata = await Message.create({
          message: data.message ,
          users: [data.from, data.to],
          sender: !data.isPrivate?data.sender:undefined,
          isPrivate:data.isPrivate
         
        });
       }
        
     }
  
     
    }


  
    socket.on("send-msg", (data)=>{
      handleMessageEvent('send-msg',data)
    });

    socket.on ("file-meta",(data)=>{
      handleMessageEvent('file-meta',data)
    }) 


  socket.on ("fs-start",(data)=>{
    handleMessageEvent("fs-start",data)
  }) 


  socket.on ("file-raw",(data)=>{
    handleMessageEvent('file-raw',data)
  })


  




   



   


    //video calls
    
  socket.on('start-call',({from,to})=>{
    const receiver= onlineUsers.get(to._id);
    console.log('start call received')
    
    socket.to(receiver).emit('receive-call',{from,to})

  })
  socket.on('accept-request',({from,to})=>{
    const receiver= onlineUsers.get(to);
    console.log('accept-request received' ,to)
    
    socket.to(receiver).emit('accept-request',{from,to})

  })
  socket.on('reject-request',({from,to})=>{
    
    const receiver= onlineUsers.get(to);
    console.log('reject-request received')
    console.log('from',from)
    console.log('to',to)
    
    socket.to(receiver).emit('reject-request',{from,to})

  })
	
  

  socket.on('send-offer', ({offer,from,to}) => {
    console.log('send offer is received')
    const receiver= onlineUsers.get(to._id);
    
    
    socket.to(receiver).emit('receive-offer',{offer,from,to})
  })
  socket.on('send-candidate', ({candidate,from,to}) => {
    const receiver= onlineUsers.get(to._id);
    console.log('candidate received')

    // console.log(candidate)
    socket.to(receiver).emit('receive-candidate',{candidate,from,to})
  })

  socket.on('send-answer', ({answer,from, to})=>{
    const receiver = onlineUsers.get(to)
    console.log('send answer is received',to)
    socket.to(receiver).emit('receive-answer',({answer,from, to}))
  })
  socket.on('toggle-cam', ({from, to})=>{
    const receiver = onlineUsers.get(to)
    console.log('toggle-cam is received',to)
    socket.to(receiver).emit('toggle-cam',({from, to}))
  })
  socket.on('end-call', ({from, to})=>{
    const receiver = onlineUsers.get(to)
    console.log('end-call is received',to)
    socket.to(receiver).emit('end-call',({from, to}))
  })


  module.exports={Upload2}


	




    socket.on("disconnect", () =>{
        console.log("User had left")
      socket.broadcast.emit('logout',loggedUserId)
    })



})



mongoose.connection.once("open",() =>{
    server.listen(3001,()=>{
        console.log("listening on port 3001")
    })
})
