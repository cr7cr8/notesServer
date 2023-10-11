
const express = require("express")
const app = express()
const cors = require("cors");
const socketIO = require("socket.io")

const user = require("./router/user")
const { User, Message } = require("./db/schema")

const image = require("./router/image")
const audio = require("./router/audio")

const fetch = require('node-fetch');
const jwt = require("jsonwebtoken")


app.use(cors());
app.use(express.json())
app.use(express.urlencoded({ extended: true }))
app.use("/api/user", user)
app.use("/api/image", image)
app.use("/api/audio", audio)


const server = app.listen(process.env.PORT || 80)

const io = socketIO(server)
let socketArr = [];

user.io = io
user.socketArr = socketArr

image.io = io
image.socketArr = socketArr

audio.io = io
audio.socketArr = socketArr

console.log("start...")

app.get("/", function (req, res, next) {
  const onlineArr = socketArr.filter(socket => socket.isAlive)

  res.send(
    `<h2>${new Date()} current online: ${onlineArr.length}</h2>
   ${onlineArr.map(socket => socket.userName)}
  
  
  
 `)

})



io.use(
  function (socket, next) {


    socket.userName = socket.handshake.auth.userName

    const decode = jwt.verify(socket.handshake.auth.token, "secretKey")
    // console.log(!!decode)

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
  socket.isAlive = true
  // setInterval(
  //   function () {
  //     socket.emit("helloFromServer", new Date().toISOString())
  //   }, 2000

  // )


  // socket.emit("toClient", "socket " + socket.id + " is established on server")
  socket.join(socket.userName)
  //console.log("socket " + socket.userName + " is connected")
  //socket.emit("receiveMsg", "hiFromServer", Date.now())
  //io.to(socket.id).emit("receiveMsg","hi0-439-freg")
  //io.to(socket.userName).emit("receiveMsg","hi0-439-freg")


  // socket.on("get")


  socket.on("sendNotiToken", function (notiToken) {
    console.log("---", notiToken)
    socket.notiToken = notiToken
    console.log("ooo", socket.notiToken)



  })

  socket.on("sendMessage", function ({ sender, toPerson, msgArr }) {
    if (sender === toPerson) {
      return
    }

    // msgArr.forEach(msg=>{
    //   msg.audio&&console.log(msg)
    // })


    const socket = socketArr.find(socket => { return socket.userName === toPerson && socket.isAlive })

    if (socket) {

      socket.emit("displayMessage" + sender, msgArr);
      socket.emit("writeMessage", sender, msgArr)
      socket.emit("notifyUser", sender, msgArr)
      socket.emit("saveUnread", sender, msgArr)

    }
    else {
      console.log("socket unfound")
      //todo write the incoming unread msg into db




      User.findOne({ userName: toPerson })
        .then(doc => {
          msgArr.forEach(msg => {

            Message.create({ ...msg, toPerson })

          })
          return doc
        })
        .then(doc => {

          console.log(doc.notiToken)

          if (doc.notiToken) {
            console.log("sending offline noti")
            fetch('https://exp.host/--/api/v2/push/send', {
              method: 'POST',
              headers: {
                Accept: 'application/json',
                'Accept-encoding': 'gzip, deflate',
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({
                to: doc.notiToken,
                sound: 'default',
                title: sender,
                body: msgArr[0].text + " made by server",
              }),
            }).then(response => {
              console.log(msgArr[0]._id, response.headers.get('content-type'), response.status)
            })
          }

          return doc
        })



    }
  })


  socket.on("fectchUnread", async function () {

    // const docs = await Message.find({toPerson:socket.userName})
    // console.log(docs)

  })



  socket.on("sendToAll", function ({ sender, toPerson, msgArr }) {

    let onlineUsers = []
    onlineUsers.push(sender)
    onlineUsers.push("AllUser")

    socketArr.forEach(socket => {
      if (socket.isAlive && (socket.userName !== sender)) {

        socket.emit("displayRoomMessage", msgArr)
        socket.emit("writeRoomMessage", sender, msgArr)

        onlineUsers.push(socket.userName)
      }
      else { }
    })

    User.find({}).then(docs => {
      onlineUsers = [...new Set(onlineUsers)];
      const allUsers = docs.map(item => item.userName)
      const offlineUsers = allUsers.filter(item => !onlineUsers.includes(item))

      // console.log(offlineUsers)

      const msg = msgArr[0]

      msg.waitingUsers = offlineUsers
    
      if (offlineUsers.length > 0) {
        Message.create(msg)
      }


    })


    //const msg = msgArr[0]
    //console.log(msg)




  })



  socket.on("disconnecting", function (reason) {
    // socket.leave(socket.userName) done automatically

    socket.isAlive = false
    console.log(`socket ${socket.userName} is disconnected`)
  })



})




