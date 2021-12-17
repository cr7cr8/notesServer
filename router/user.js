const express = require("express");
const router = express.Router();
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs")
//const { User } = require("../db/schema")
const { authenticateToken, generateAndDispatchToken } = require('../middleware/auth')
//const fs = require("fs")

//const [{ checkConnState, getFileArray, uploadFile, deleteFileByUserName, downloadFile }] = require("../db/fileManager");
//const { getSmallImageArray, makeAvatar, makeBackPicture, getAvatarImageArray } = require("../db/picManager");




router.post("/fetchtoken", (req, res, next) => {

    console.log(req.body)

    next()
},generateAndDispatchToken)





module.exports = router