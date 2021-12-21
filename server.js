
const express = require("express")
const app = express()
const cors = require("cors");
const socketIO = require("socket.io")

const user = require("./router/user")
const image = require("./router/image")

const fetch = require('node-fetch');
const jwt = require("jsonwebtoken")


app.use(cors());
app.use(express.json())
app.use(express.urlencoded({ extended: true }))
app.use("/api/user", user)
app.use("/api/image", image)

const server = app.listen(process.env.PORT || 80)

const io = socketIO(server)
let socketArr = [];

user.io = io
user.socketArr = socketArr

image.io = io
image.socketArr = socketArr

io.use(
  function (socket, next) {


    socket.userName = socket.handshake.auth.userName

    const decode = jwt.verify(socket.handshake.auth.token, "secretKey")
    console.log(!!decode)

    if (decode) {
      socket.token = socket.handshake.auth.token
      socket.createdTime = Date.now()
      socket.isAlive = true

      // console.log(socket.userName)

      socketArr.forEach(function (socketItem) {
        if (socketItem.userName === socket.userName) { socketItem.disconnect(true); socketItem.isAlive = false }
      })
      socketArr.push(socket)
      next()
    }
  },
);



io.on("connection", function (socket) {

  console.log("socket " + socket.userName + " is connected")




  // socket.emit("toClient", "socket " + socket.id + " is established on server")
  socket.join(socket.userName)
  //console.log("socket " + socket.userName + " is connected")
  //socket.emit("receiveMsg", "hiFromServer", Date.now())
  //io.to(socket.id).emit("receiveMsg","hi0-439-freg")
  //io.to(socket.userName).emit("receiveMsg","hi0-439-freg")


  // socket.on("get")

  socket.on("sendMessage", function (toPerson, msg) {


    
    // socket.emit("messageFeedback", ...msg.map(item => { return item._id }))

    const socket = socketArr.find(socket => { return socket.userName === toPerson && socket.isAlive })
   

    if (socket) { socket.emit("displayMessage", msg); }
    else {
      console.log("no socket found")
    }
  })


  socket.on("disconnecting", function (reason) {
    // socket.leave(socket.userName) done automatically
    console.log(`socket ${socket.userName} is disconnected`)
  })



}) 