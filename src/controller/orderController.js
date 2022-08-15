const cartModel = require("../model/cartModel");
const userModel = require("../model/userModel");
const orderModel = require("../model/orderModel");
const { isValidObjectId,} = require("../validator/validator");

const createOrder = async function (req, res) {
    try {
        let userId = req.params.userId
        let userIdFromToken = req.tokenId
        if (!isValidObjectId(userId)) {
            return res.status(400).send({ status: false, message: `${userId} is not a valid user id` })

        }
        if (userId != userIdFromToken) {
            return res.status(403).send({ status: false, message: `Unauthorized access! User's info doesn't match` });

        }
        let { cartId, cancellable } = req.body

        if (Object.keys(req.body).length < 1) return res.status(400).send({ status: false, msg: "Data is required." })
        if (!isValidObjectId(cartId)) {
            return res.status(400).send({ status: false, message: `${cartId} is not a valid cart id` })

        }
 
        let cart = await cartModel.findById(cartId)
        if (!cart) return res.status(400).send({ status: false, msg: "No cart with given cartId." })
        let userIdFromCart = cart.userId
        if (userId != userIdFromCart) {
            return res.status(403).send({ status: false, message: `Unauthorized access! User not allowed to oreder for other user` });

        }

        let totalQuantity = 0
        for (let i = 0; i < cart.items.length; i++) {
            totalQuantity += cart.items[i].quantity
        }

        let order = {
            userId: userId,
            items: cart.items,
            totalPrice: cart.totalPrice,
            totalItems: cart.totalItems,
            totalQuantity: totalQuantity,
            cancellable: cancellable,
            status: "pending"
        }


        let createdOrder = await orderModel.create(order)
        await cartModel.findOneAndUpdate({ _id: cartId }, { items: [], totalPrice: 0, totalItems: 0 })
        res.status(201).send({ status: true, data: createdOrder })

    } catch (err) {
        res.status(500).send({ status: false, msg: err.message })
    }
}

const updateOrder = async function (req, res) {
    try {
        let userIdP = req.params.userId
        let userIdFromToken = req.tokenId
        if (!isValidObjectId(userIdP)) {
            res.status(400).send({ status: false, message: `${userIdP} is not a valid user id` })
            return
        }
        if (userIdP != userIdFromToken) {
            return res.status(403).send({ status: false, message: `Unauthorized access! User's info doesn't match` });

        }
        let user = await userModel.findById(userIdP)
        if (!user) return res.status(404).send({ status: false, msg: "no user with given userId." })

        let { orderId, status } = req.body
        let order = await orderModel.findOne({ _id: orderId, isDeleted: false })
        if (!order) return res.status(404).send({ status: false, msg: "no order with given orderId." })
        if (userIdP != order.userId) return res.status(403).send({ status: false, message: `Unauthorized access! User not allowed to cancel order` });
        if (order.cancellable == false) return res.status(400).send({ status: false, msg: "not cancellable order" })
        if (!["completed", "canceled"].includes(status)) return res.status(400).send({ status: false, msg: 'enter status from this "pending", "completed", "canceled"' })
        if(order.status=="completed"){
            return res.status(400).send({ status: false, msg: "order all ready completed"})
        }
        if(order.status=="canceled"){
            return res.status(400).send({ status: false, msg: "order all ready canceled"})
        }
        let updatedOrder = await orderModel.findOneAndUpdate({ _id: orderId }, { status: status }, { new: true })
        res.status(200).send({ status: true, data: updatedOrder })

    } catch (err) {
        res.status(500).send({ status: false, msg: err.message })
    }
}


module.exports = { createOrder, updateOrder }