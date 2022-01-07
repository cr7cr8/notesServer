const express = require("express");
const router = express.Router();
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs")
const { User } = require("../db/schema")
const { authenticateToken, generateAndDispatchToken } = require('../middleware/auth')

const { connDB, connDB2, connDB3, connDB4, connEmojiDB } = require("../db/db");

const [
  { },
  { },

  { checkConnState, getFileArray, getSmallImageArray, uploadFile, downloadFile, deleteFileById, deleteOldFile },


] = require("../db/fileManager");

function getSocket(userName) {
  return router.socketArr.find(socket => {
    return socket.userName === userName && socket.isAlive
  })
}


router.post("/uploadaudio",

  checkConnState,
  getFileArray,
  uploadFile,
  (req, res, next) => {

    //console.log(req.body.obj)
    const { sender, toPerson, filename, durationMillis } = req.body.obj

    res.json(req.body.obj)

  }
)

router.get("/download/:id",


  checkConnState,
  downloadFile,

)

router.get("/delete/:id",

  deleteFileById,
  function (req, res, next) {
    res.json("deleted")
  }

)


module.exports = router