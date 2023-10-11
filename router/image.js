const express = require("express");
const router = express.Router();
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs")
const { User } = require("../db/schema")
const { authenticateToken, generateAndDispatchToken } = require('../middleware/auth')

const { connDB, connDB2, connDB3, connDB4, connEmojiDB } = require("../db/db");

const [
  { checkConnState, getFileArray, getSmallImageArray, uploadFile, downloadFile, deleteFileById, deleteOldFile,deleteFileByUserName },

  {
    checkConnState: checkConnState2,
    getFileArray: getFileArray2,
    getSmallImageArray2,
    uploadFile: uploadFile2,
    downloadFile: downloadFile2,
    deleteFileById: deleteFileById2,
    deleteFileByPicName:deleteFileByPicName,
    deleteOldFile: deleteOldFile2
  },
] = require("../db/fileManager");


function getSocket(userName) {
  return router.socketArr.find(socket => {
    return socket.userName === userName && socket.isAlive
  })
}


router.post("/uploadimage",
  // function (req, res, next) {
  //   console.log("adsfasd")
  //   next()
  // },

  checkConnState2,
  getFileArray2,
  getSmallImageArray2,
  uploadFile2,
  (req, res, next) => {


    res.json(req.body.obj)
  }
)


router.post("/upload",

// function (req, res, next) {
//   console.log("adsfasd2222")
//   next()
// },



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
      if (socket && socket.isAlive) {
        socket.emit("updateList", "hihihi")
      }
    })


    next()



  }, generateAndDispatchToken)

router.post("/updateavatar", authenticateToken,
  checkConnState,
  getFileArray,
  deleteFileByUserName,
  uploadFile,
  function (req, res, next) {

    const randomStr = String(Math.random())
    User.updateOne({userName:req.userName},{hasAvatar:true,randomStr:randomStr}).then(doc=>{
      console.log(req.body)
      res.json(randomStr)
    })

    
  }

)



router.get("/avatar/:username",
  checkConnState,
  downloadFile,

)

router.get("/download/:id",


  checkConnState,
  downloadFile2,

)

router.get("/delete/:id", authenticateToken, checkConnState,

  async function (req, res, next) {

    //console.log(req.params.id, req.userName)
    //console.log(connDB)


    const arr = await connDB.db.collection("image.files").find({ "metadata.picName": Number(req.params.id) }).toArray()

    if (arr.length > 0) {
      let deleteByOwner = arr[0].metadata.deleteByOwner
      let deleteByToPerson = arr[0].metadata.deleteByToPerson
      const ownerName = arr[0].metadata.ownerName
      const toPerson = arr[0].metadata.toPerson

      if (req.userName === ownerName) {
        deleteByOwner = true
      }
      else if (req.userName === toPerson) {
        deleteByToPerson = true
      }

      if (deleteByOwner && deleteByToPerson) {
        req.params.id = String(arr[0]._id).replace("new ObjectId(", "").replace(")", "")
        next()
      }
      else {

        connDB.db.collection("image.files")
          .updateOne({ "metadata.picName": Number(req.params.id) }, { $set: { "metadata.deleteByOwner": deleteByOwner, "metadata.deleteByToPerson": deleteByToPerson } })
          .then(data => {
            res.json(data)
          })

      }


    }








  },

  deleteFileById2,
  function (req, res, next) {
    res.json("done")
  }


)

router.get("/deleteimage/:id",authenticateToken,checkConnState,deleteFileByPicName,function(req,res,next){
 
  res.json("deleted")
})




module.exports = router