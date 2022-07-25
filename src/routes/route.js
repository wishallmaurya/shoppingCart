const model=require("../model/userModel")
const userController=require("../controller/userController")
const middleware=require("../middleware/auth")
const express = require("express")
const router = express.Router();


router.post('/POST/register',userController.createUser)


router.post('')

module.exports=router