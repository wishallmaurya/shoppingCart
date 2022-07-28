const model=require("../model/userModel")
const userController=require("../controller/userController")
const productController=require("../controller/productController")
const middleware=require("../middleware/auth")
const express = require("express")
const router = express.Router();


router.post('/register',userController.createUser)
router.post('/login',userController.loginUser)
router.get('/user/:userId/profile',middleware.authenticate,userController.getUserProfile)
router.put('/user/:userId/profile',middleware.authenticate,userController.updateUser)

router.post('/products',productController.createProduct)
router.get('/products',productController.getProducts)
router.get('/products/:productId',productController.getProductById)
router.put('/products/:productId',productController.updateProduct)
router.delete('/products/:productId',productController.deleteProduct)


router.all("/*", async function (req, res) {
    res.status(404).send({ status: false, msg: "Page Not Found!!!" });
  });

module.exports=router