const express = require("express");
const router = express.Router();
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs")
const { User } = require("../db/schema")
const { authenticateToken, generateAndDispatchToken } = require('../middleware/auth')
//const fs = require("fs")

//const [{ checkConnState, getFileArray, uploadFile, deleteFileByUserName, downloadFile }] = require("../db/fileManager");
//const { getSmallImageArray, makeAvatar, makeBackPicture, getAvatarImageArray } = require("../db/picManager");


function getSocket(userName) {
    return router.socketArr.find(socket => {


        return socket.userName === userName && socket.isAlive

    })
}


router.post("/fetchtoken", (req, res, next) => {

    //console.log(req.body)

    const userName = req.body.userName
    const displayName = req.body.userName

    const token = jwt.sign({ userName: req.body.userName }, 'secretKey', { expiresIn: "1000d" })

    User.create({ userName, displayName, discription: "" })


    res.header("x-auth-token", token)
        .header("access-control-expose-headers", "x-auth-token")
        .json({ userName, displayName, discription: "" })




    // next()
})

router.post("/isnewname", (req, res, next) => {

    const userName = req.body.userName
    User.findOne({ userName }).then(docs => {
        res.json(!Boolean(docs))
    })
})

router.post("/reguser", async (req, res, next) => {

    const userName = req.body.userName
    const docs = await User.find({})



    const listOrder = docs.map(item => item.userName)
    listOrder.unshift(userName)



    await User.create({ userName, listOrder })

    docs.forEach(doc => {


        const socket = getSocket(doc.userName)
        if (socket && socket.isAlive) {
            socket.emit("updateList", "hihihi")
        }

    })


    next()








}, generateAndDispatchToken)


router.get("/fetchuserlist", authenticateToken, async (req, res, next) => {

    const userName = req.userName
    const docs = await User.find({})
    const listOrder = docs.find(item => { return item.userName === userName }).listOrder
    let arr = []
    listOrder.forEach(item => {
        const doc = docs.find(doc => { return doc.userName === item })
        if (doc) { arr.push(doc) }
    })
    docs.forEach(doc => {
        const hasDoc = listOrder.includes(doc.userName)
        if (!hasDoc) { arr.push(doc) }
    })
    arr = arr.map((item) => {
        return {
            name: item.userName,
            hasAvatar: item.hasAvatar,
            key: Math.random()
        }
    });
    res.json(arr)
})

router.post("/resortuserlist", authenticateToken, async (req, res, next) => {

    //console.log(req.body)

    await User.updateOne({ userName: req.userName }, { listOrder: req.body })
    res.json("order updated")

})

router.post("/updatenotitoken", authenticateToken,  (req, res, next) => {

    console.log(req.userName, req.body.notiToken)

    User.updateOne({ userName: req.userName }, { notiToken: req.body.notiToken }).exec()
    res.json("aa")

})



module.exports = router