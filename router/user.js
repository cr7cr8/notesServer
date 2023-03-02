const express = require("express");
const router = express.Router();
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs")
const { User, Message } = require("../db/schema")
const { authenticateToken, generateAndDispatchToken } = require('../middleware/auth')



//const fs = require("fs")

//const [{ checkConnState, getFileArray, uploadFile, deleteFileByUserName, downloadFile }] = require("../db/fileManager");
//const { getSmallImageArray, makeAvatar, makeBackPicture, getAvatarImageArray } = require("../db/picManager");


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
    const listOrder = docs.find(item => { return item.userName === userName })?.listOrder ||[]
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
            randomStr: item.randomStr,
            hasAvatar: item.hasAvatar,
            key: Math.random()
        }
    });
    res.json(arr)
})

router.get("/fetchuserlist2", async (req, res, next) => {


    const docs = await User.find({})

    //console.log(docs)

    res.json(docs.map(item => item.userName))
})




router.post("/resortuserlist", authenticateToken, async (req, res, next) => {

    console.log(req.body)
    
    await User.updateOne({ userName: req.userName }, { listOrder: req.body })
    res.json("order updated")

})

router.get("/fecthunread", authenticateToken,


    function (req, res, next) {

        const socket = getSocket(req.userName)

        Message.find({ $and: [{ toPerson: "AllUser" }, { waitingUsers: [] }] }).then(docs => {


            if (docs.length === 0) {
                next()
            }
            else {
                docs.forEach((doc, index) => {

                    //todo delete audio if no waiting users
                    // if (Boolean(doc.mongooseID) && Boolean(doc.audioName)) {
                    //     socket.emit("deleteAudio", doc.mongooseID)
                    // }

                    Message.deleteOne({ _id: doc._id }).then(doc => {
                        //  console.log(doc)
                        if (index === docs.length - 1) {
                            next()
                        }
                    })

                })
            }

        })



    },


    async (req, res, next) => {







        let docs = await Message.find(

            {
                $or: [
                    { toPerson: req.userName },
                    {
                        $and: [{ toPerson: "AllUser" }, { waitingUsers: { "$in": [req.userName] } }]
                    }
                ]
            }
        )



        await Message.deleteMany({ toPerson: req.userName })
        await Message.updateMany({}, { "$pull": { waitingUsers: { "$in": [req.userName] } } })



        //    Message.updateMany({waitingUsers:{"$in":[req.userName]}}   ,      )


        docs = docs.map(doc => {




            const obj = doc._doc

            const image = obj.image
            const imageWidth = obj.imageWidth
            const imageHeight = obj.imageHeight

            const audio = obj.audio
            const audioName = obj.audioName


            delete obj.image
            delete obj.__v
            delete imageWidth
            delete imageHeight
            delete obj.audio
            delete obj.audioName


            return {
                ...obj,
                ...image && { image },
                ...imageWidth && { imageWidth },
                ...imageHeight && { imageHeight },

                ...audio && { audio },
                ...audioName && { audioName }

            }

        })





        res.json(docs)

    })



router.post("/updatenotitoken", authenticateToken, (req, res, next) => {
    console.log(req.userName, req.body.notiToken)
    User.updateOne({ userName: req.userName }, { notiToken: req.body.notiToken }).exec()
    res.json("aa")
})

router.get("/hasAvatar/:personName", (req, res, next) => {

    User.findOne({ userName: req.params.personName }, {}).then(doc => {


        res.json(Boolean(doc && doc.hasAvatar))

    })



})

router.get("/getdescription/:name", authenticateToken, (req, res, next) => {

    User.findOne({ userName: req.params.name }).then(doc => {

        res.json(doc.description)
    })
})

router.post("/updatedescription", authenticateToken, (req, res, next) => {

    User.updateOne({ userName: req.userName }, { description: req.body.description }).then(doc => {

        res.json(doc)
    })
})

router.get("/deleteaccount", authenticateToken, (req, res, next) => {

console.log("fdfsafsadf")

res.json("Fdsf")
})



module.exports = router