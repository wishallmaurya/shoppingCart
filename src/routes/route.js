const model=require("../model/userModel")
const userController=require("../controller/userController")
const middleware=require("../middleware/auth")
const express = require("express")
const router = express.Router();


router.post('/register',userController.createUser)

router.post('/login',userController.loginUser)


 router.get('/user/:userId/profile',middleware.authenticate,userController.getUserProfile)

router.put('/user/:userId/profile',middleware.authenticate,userController.updateUser)

router.all("/*", async function (req, res) {
    res.status(404).send({ status: false, msg: "Page Not Found!!!" });
  });

module.exports=router