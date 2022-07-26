const model=require("../model/userModel")
const userController=require("../controller/userController")
const middleware=require("../middleware/auth")
const express = require("express")
const router = express.Router();


router.post('/register',userController.createUser)

router.post('/login',userController.loginUser)


 router.get('/user/:userId/profile',userController.getUserProfile)

router.put('/user/:userId/profile',userController.updateUser)


module.exports=router