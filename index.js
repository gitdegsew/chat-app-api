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
app.use('/messages',messages)
app.use('/users',users)


const io= socketIo(server,{cors: {
  origin: "*",
  
}})

global.onlineUsers = new Map();


io.on('connection', async(socket) =>{
    console.log("we have new connection")
    const groups = await Group.find()
    const groupRooms= groups.map(group => group.groupName)
    global.chatSocket = socket;
    socket.on("login", (userId) => {
      
      
      socket.join(groupRooms)
      onlineUsers.set(userId, socket.id);

    });


  
    socket.on("send-msg", async(data,callback) => {
      console.log('send msg event');
     if(data.isPrivate){
      // console.log(data.isPrivate,dato.to)
      const sendUserSocket = onlineUsers.get(data.to);
      if (sendUserSocket) {
        console.log("receive event emited to user")
        socket.to(sendUserSocket).emit("msg-receive", data);
        const tdata = await Message.create({
          message: { text: data.message },
          users: [data.from, data.to],
          sender: !data.isPrivate?data.sender:undefined,
          isPrivate:data.isPrivate
         
        });
        

      }else{
        console.log('user not found')
        const tdata = await Message.create({
          message: { text: data.message },
          users: [data.from, data.to],
          sender: !data.isPrivate?data.sender:undefined,
          isPrivate:data.isPrivate
         
        });
       
      }
     }else{
      console.log("receive event emited to group")

        const group = groups.find(group=>group._id==data.to)
        const room=group.groupName
        socket.to(room).emit("msg-receive", data)
        const tdata = await Message.create({
          message: { text: data.message },
          users: [data.from, data.to],
          sender: !data.isPrivate?data.sender:undefined,
          isPrivate:data.isPrivate
         
        });
        
     }

     callback(null)
    });


    socket.on('join', ({name,room},callback)=>{

        // const {error,user} =addNewUser({id:socket.id,name,room})

        if(error) return callback(error)
        socket.emit('message', {user:'admin', text:`welcome ${user.name} to room ${user.room}`})
        socket.broadcast.to(user.room).emit('message', {user: 'admin', text: `${user.name} has joined!`})
        socket.join(user.room)
        callback()


    })

    socket.on('sendMessage', (message,callback) => {
        const user = getUser(socket.id)
        io.to(user.room).emit('message', {user: user.name,text:message})
        callback()
    })

    socket.on("disconnect", () =>{
        console.log("User had left")
    })
})



mongoose.connection.once("open",() =>{
    server.listen(3001,()=>{
        console.log("listening on port 3001")
    })
})
