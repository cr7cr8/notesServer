
const express = require("express")
const app = express()
const cors = require("cors");
const socketIO = require("socket.io")

const user = require("./router/user")

const fetch = require('node-fetch');


app.use(cors());
app.use(express.json())
app.use(express.urlencoded({ extended: true }))
app.use("/api/user", user)

const server = app.listen(process.env.PORT || 80)

const io = socketIO(server)
let socketArr = [];


io.use(
  function (socket, next) {

    socket.userName = socket.handshake.auth.userName
    socket.token = socket.handshake.auth.token
    socket.createdTime = Date.now()
    socket.offline = false

    console.log(socket.userName)

    socketArr.forEach(function (socketItem) {
      if (socketItem.userName === socket.userName) { socketItem.disconnect(true); socketItem.offline = true }
    })
    socketArr.push(socket)
    next()
  },
);



io.on("connection", function (socket) {

  socket.emit("toClient", "socket " + socket.id + " is established on server")
  socket.join(socket.userName)
  console.log("socket " + socket.userName + " is connected")


})