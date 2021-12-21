const express = require("express");
const router = express.Router();
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs")
const { User } = require("../db/schema")
const { authenticateToken, generateAndDispatchToken } = require('../middleware/auth')

const [{ checkConnState, getFileArray, getSmallImageArray, uploadFile, downloadFile, deleteFileById, deleteOldFile }] = require("../db/fileManager");


function getSocket(userName) {
  return router.socketArr.find(socket => {
      return socket.userName === userName && socket.isAlive
  })
}




router.post("/upload",

  checkConnState,
  getFileArray,


  getSmallImageArray,
  uploadFile,
  async (req, res, next) => {

    const userName = req.body.userName
    const docs = await User.find({})
    const listOrder = docs.map(item => item.userName)
    listOrder.unshift(userName)
    await User.create({ userName, listOrder, hasAvatar: true })
    
    docs.forEach(doc => {
      const socket = getSocket(doc.userName)
      if (socket&&socket.isAlive) {
          socket.emit("updateList","hihihi")
      }
  })
    
    
    next()



  }, generateAndDispatchToken)

router.get("/avatar/:username",
  checkConnState,
  downloadFile,

)



module.exports = router