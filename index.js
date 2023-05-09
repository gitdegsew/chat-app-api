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
// const {addNewUser} = require('./controllers/registerController')
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
global.storedGroups= new Map()

Group.find().then(groups =>{
  groups.forEach(group =>{
    storedGroups.set(group._id.toString(),group.groupName)
  })
})

io.on('connection', async(socket) =>{
    console.log("we have new connection")
    // console.log(storedGroups)
    let groups =[]
    let loggedUserId
    let groupRooms=[]
    global.chatSocket = socket;

    socket.on("login", async(user) => {
      loggedUserId= user.id
      onlineUsers.set(user.id, socket.id);
      User.findById(user.id).populate('groups').then((myUser)=>{
          groups=myUser.groups
          
          groupRooms= groups.map(group => group.groupName)
          socket.join(groupRooms)
         
      })
      
      io.emit('onlineUsers',Array.from(onlineUsers.keys()))
      // for (let v of onlineUsers.keys()) { 
      //   console.log("vegetable ",v)
      // }
      socket.broadcast.emit("user-loggedIn", user.id)
      console.log('login event received ',Array.from(onlineUsers.keys()))
      
      

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
            isPrivate:data.isPrivate,
            messageType:data.messageType,
            
            
           
          });
          const user = await User.findOne({_id:data.to})
          user.unseen=[...user.unseen,{check:data.from,isPrivate:true}]
          await user.save()

         }
       
       
      }
     }else{
      // console.log("receive event emited to group")
        // console.log(event, data.to)
        // const group = groups.find(group=>group._id==data.to)
        
        const room=storedGroups.get(data.to)
        // console.log("sent room ",room)
        socket.to(room).emit(event, data)
        
       if(event=='send-msg'){
        const tdata = await Message.create({
          message: data.message ,
          users: [data.from, data.to],
          sender: !data.isPrivate?data.sender:undefined,
          isPrivate:data.isPrivate,
          messageType:data.messageType,
          
          
         
        });
        

        try {
           const gF =await Group.findById(data.to).populate('members')
           const uI=gF.members.map(user =>user._id)
           const utu= await User.updateMany({_id:{$in:uI}},{ $push: { unseen: {check:data.to,isPrivate:false} } })

          //  await groupF.save()
          // const rusers=await  User.updateMany({$where:function() { return (this.groups.includes(new ObjectId(this.comp))) }},{ $push: { unseen: {check:id,isPrivate:false} } })
          // console.log('selected users')
          // console.log(utu)
        } catch (error) {
          console.log('error updating group unseen')
          console.log(error)
          
        }
       
       
       }
        
     }
  
     
    }


    socket.on('groupCreated',(data)=>{
      console.log('groupcreated event received')
      socket.join(data.groupName)
      storedGroups.set(data.groupId,data.groupName)
      // groupRooms.push(groupName)
      
      // console.log(storedGroups)

      const messageToSend = {
        message: `${data.username} has created the group`,
        from: data.userId,
  
        to: data.groupId,
        messageType: "notification",
        isPrivate:  false,
        sender: "ADMIN",
        createdAt: new Date(),
      };

      // socket.to(data.groupName).emit('send-msg',messageToSend)
      // socket.to(socket.id).emit('send-msg',messageToSend)
       Message.create({
        message: messageToSend.message ,
        users: [messageToSend.from, messageToSend.to],
        sender: !messageToSend.isPrivate?messageToSend.sender:undefined,
        isPrivate:messageToSend.isPrivate,
        messageType:messageToSend.messageType,
        
        
       
      });


      
    })

    socket.on('join-group', async(data) =>{
      socket.join(data.groupName)
      // socket.to(data.groupName).emit('join-group', data)
      console.log('join-group event received')
      const messageToSend = {
        message: `${data.username} has joind the group`,
        from: data.userId,
  
        to: data.groupId,
        messageType: "notification",
        isPrivate:  false,
        sender: "ADMIN",
        createdAt: new Date(),
      };

      socket.to(data.groupName).emit('send-msg',messageToSend)
      // socket.to(socket.id).emit('send-msg',messageToSend)
      const tdata = await Message.create({
        message: messageToSend.message ,
        users: [messageToSend.from, messageToSend.to],
        sender: !messageToSend.isPrivate?messageToSend.sender:undefined,
        isPrivate:messageToSend.isPrivate,
        messageType:messageToSend.messageType,
        
        
       
      });

      
      
    })

    socket.on('leave-group', async(data) =>{
        // socket.to(data.groupName).emit('leave-group', data)
        

        const messageToSend = {
          message: `${data.username} has left the group`,
          from: data.userId,
    
          to: data.groupId,
          messageType: "text",
          isPrivate:  false,
          sender: "ADMIN",
          createdAt: new Date(),
        };

        socket.to(data.groupName).emit('send-msg',messageToSend)
        const tdata = await Message.create({
          message: messageToSend.message ,
          users: [messageToSend.from, messageToSend.to],
          sender: !messageToSend.isPrivate?messageToSend.sender:undefined,
          isPrivate:messageToSend.isPrivate,
          messageType:messageToSend.messageType,
          
          
         
        });

        
        socket.leave(data.groupName)

        

    })


  
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
  socket.on ("istyping",(data)=>{
    handleMessageEvent('istyping',data)
  })
  socket.on ("finished",(data)=>{
    handleMessageEvent('finished',data)
  })

 
  




   



   


    //video calls
    
  socket.on('start-call',({from,to,isVideo})=>{
    const id=to._id?to._id:to.id
    const receiver= onlineUsers.get(id);
    console.log('start call received to ',isVideo)
    
    socket.to(receiver).emit('receive-call',{from,to,isVideo})

  })

  
  socket.on('cancel-call',({from,to})=>{
    const receiver= onlineUsers.get(to._id);
    console.log('cancel-call received')
    
    socket.to(receiver).emit('cancel-call',{from,to})

  })

  

  socket.on('reject-call',({from,to})=>{
    const receiver= onlineUsers.get(to);
    
    console.log('reject-call received')
    console.log('from dthis',from)
    console.log('to dthis',to)
    console.log('receiver',receiver)
    socket.to(receiver).emit('reject-call',{from,to})

  })


  socket.on('accept-request',({from,to})=>{
    const receiver= onlineUsers.get(to);
    console.log('accept-request received' ,to)
    
    socket.to(receiver).emit('accept-request',{from,to})

  })
  socket.on('reject-request',({from,to})=>{
    
    const receiver= onlineUsers.get(to);
    console.log('reject-request received')
    console.log('from this',from)
    console.log('to this',to)
    
    socket.to(receiver).emit('reject-request',{from,to})

  })
	
  

  socket.on('send-offer', ({offer,from,to}) => {
    const id=to._id?to._id:to.id
    console.log('send offer is received to ',to)
    const receiver= onlineUsers.get(id);
    
    
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


  

  socket.on('logout',(userId)=>{
    console.log('logout user id ',userId)
    onlineUsers.delete(userId)
    socket.disconnect()
    // socket.broadcast.emit('user-loggedout',Array.from(onlineUsers.keys()))
  })


	




    socket.on("disconnect", () =>{
      
        console.log("User had left ",loggedUserId)
        onlineUsers.delete(loggedUserId)
      io.emit('user-loggedout',Array.from(onlineUsers.keys()))
      // io.emit('logout',loggedUserId)
    })



})



mongoose.connection.once("open",() =>{
    server.listen(3001,()=>{
        console.log("listening on port 3001")
    })
})
