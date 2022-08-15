const model=require("../model/userModel")
const userController=require("../controller/userController")
const productController=require("../controller/productController")
const cartController=require("../controller/cartController")
const orderController=require("../controller/orderController")
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

router.post('/users/:userId/cart',middleware.authenticate,cartController.createCart)
router.put('/users/:userId/cart',middleware.authenticate, cartController.updateCart)
router.get('/users/:userId/cart',middleware.authenticate,cartController.getCart)
router.delete('/users/:userId/cart',cartController.deleteCart)

router.post('/users/:userId/orders',middleware.authenticate,orderController.createOrder)
router.put('/users/:userId/orders',middleware.authenticate,orderController.updateOrder)

router.all("/*", async function (req, res) {
    res.status(404).send({ status: false, msg: "Page Not Found!!!" });
  });
module.exports=router

