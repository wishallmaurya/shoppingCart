//only delete 

const deleteCart = async function (req, res) {
    try {
        const userId = req.params.userId
        if (userId.trim().length == 0)
	      return res.status(400).send({ status: false, Message: "Dont Left userId Empty" })

        if (!mongoose.isValidObjectId(userId)) 
	      return res.status(400).send({ status: true, Message: "Invalid ProductId !" })
     
        const checkCart = await cartModel.findOne({ userId: userId })
        if (!checkCart) 
        return res.status(400).send({ status: false, Message: 'cart not found ' })
       
       if (checkCart.items.length==0)
	     return res.status(400).send({ status: false, Message: "Cart is already empty" })
      
       await cartModel.findOneAndUpdate({ userId: userId }, { items: [], totalPrice: 0, totalItems: 0 })
       res.status(200).send({ status: true, Message: 'sucessfully deleted' })
    } catch (error) { 
      res.status(500).send({ status: false, Message: error.message }) }
}
