const model=require("../model/userModel")
const userController=require("../controller/userController")
const middleware=require("../middleware/auth")
const express = require("express")
const router = express.Router();


router.post('/register',userController.createUser)


 router.get('/user/:userId/profile',userController.getUserProfile)

module.exports=router