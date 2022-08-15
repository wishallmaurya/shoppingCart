let cartModel = require("../model/cartModel");
let productModel = require("../model/productModel");
let userModel = require("../model/userModel");

let { isValidObjectId, isValidRequestBody, isValid,} = require("../validator/validator");

let createCart = async function(req,res){
  try {
    let userId = req.params.userId;
    
    if (!(isValidObjectId(userId))) {
      return res.status(400).send({ status: false, message: "Please provide valid User Id" });
  }
    let data = req.body
    if(!(isValidRequestBody(data))){
     return res .status(404).send({status:false,msg:"plz provide the data"})
    }
    let {quantity, productId } = data;
  
    
    if(!(isValid(productId))){
      return res.status(400).send({ status: false, message: "Please provide the product Id" });

    }
    if(!(isValidObjectId(productId))){
      return res.status(400).send({ status: false, message: "Please provide valid Product Id" });

    }
    let findUser = await userModel.findById({ _id: userId });


    if (!findUser) {
        return res.status(400).send({ status: false, message: `User doesn't exist by ${userId}` });
    }

    let findProduct = await productModel.findOne({ _id: productId, isDeleted: false });
 
    if (!findProduct) {
        return res.status(400).send({ status: false, message: `Product doesn't exist by ${productId}` });
    }
  
    let findUserCart = await cartModel.findOne({ userId: userId });
  
    if (!quantity) {
      quantity = 1;
    }

    if (!findUserCart) {
      var cartData = {
          userId: userId,
          items: [
              {
                  productId: productId,
                  quantity:quantity,
              },
          ],
          totalPrice: findProduct.price * quantity,
          totalItems: 1,
      };
      let createCart = await cartModel.create(cartData);
      return res.status(201).send({ status: true, message: `Cart created successfully`, data: createCart });
  }
  if (findUserCart) {

    let price = findUserCart.totalPrice + (quantity) * findProduct.price;
    let arr = findUserCart.items;
      for (i in arr) {
        if (arr[i].productId.toString() === productId) {
            arr[i].quantity +=quantity
            let updatedCart = {
                items: arr,
                totalPrice: price,
                totalItems: arr.length,
            };

            let responseData = await cartModel.findOneAndUpdate(
                { _id: findUserCart._id },
                updatedCart,
                { new: true }
            );
            console.log(responseData);
            return res.status(200).send({ status: true, message: `Product added successfully`, data: responseData });
        }
    }
    arr.push({ productId: productId, quantity: quantity });
    let updatedCart = {
      items: arr,
      totalPrice: price,
      totalItems: arr.length,
  };

  let responseData = await cartModel.findOneAndUpdate({ _id: findUserCart._id }, updatedCart, { new: true });
  return res.status(200).send({ status: true, message: `Product added successfully`, data: responseData });
}
} catch (error) {
    return res.status(500).send({msg:error.message})
  }
}
//******************************getApi************/
let getCart = async function (req, res) {
  try {
      let userId = req.params.userId
      if (userId.trim().length == 0)
      return res.status(400).send({ status: false, Message: "Dont Left userId Empty" })

      if (!isValidObjectId(userId)) 
      return res.status(400).send({ status: true, Message: "Invalid UserId !" })

      let checkCart = await cartModel.findOne({ userId: userId,isDeleted:false}).populate([{ path: "items.productId" }])

      if (!checkCart) 
      return res.status(404).send({ status: false, Message: 'Cart not found' })
      if (checkCart.items.length==0)
      return res.status(400).send({ status: false, Message: "Cart is empty" })

      res.status(200).send({ status: true, Message: 'Succcess', data: checkCart })
  } catch (error) { 
    res.status(500).send({ status: false, Message: error.message }) }
}

//******************updateApi***************************/
let updateCart=async function(req,res){
  try{
     
 let data=req.body
 let userId=req.params.userId
 let userIdFromToken = req.tokenId 
 console.log(data)

 let{productId,cartId,removeProduct}=data

 if (!isValidRequestBody(data)) return res.status(400).send({ msg: "Data is required." })

  if(!isValidObjectId(userId)){
     return res.status(400).send({ status: false, message: "UserId is not valid." })
     }
     let checkingUser = await userModel.findById({_id:userId})
 if(!checkingUser){
     return res.status(404).send({ status: false, message:"UserId not found."})
    }

//================Authorization=================================//

     if (userIdFromToken != checkingUser._id) {
     return res.status(403).send({
         status: false,
         message: "Unauthorized access."
     }) 
 }

 if(!isValid(cartId)){
    return res.status(400).send({ status: false, message: "provide cartId ." })
    }
 if(!isValidObjectId(cartId)){
     return res.status(400).send({ status: false, message: "cartId is not  valid." })
     }
     let cart = await cartModel.findOne({_id:cartId})
 if(!cart){
     return res.status(404).send({ status: false, message: "cartId not found."})
    }
    if(!isValid(productId)){
        return res.status(400).send({ status: false, message: "provide productId." })
        }   
 if(!isValidObjectId(productId)){
     return res.status(400).send({ status: false, message: "ProductId is not valid." })
}
     let product = await productModel.findOne({_id:productId,isDeleted:false})
 if(!product){
     return res.status(404).send({ status: false, message: `Product is not available with this id ${productId}`})
    
 }
 //.......find if products exits in cart

 let isProductinCart = await cartModel.findOne({_id:cartId, items: { $elemMatch: {productId: productId } } });

 if (!isProductinCart) {
     return res.status(400).send({ status: false, message: `This ${productId} product does not exits in the cart` });
 }
  //*...... removeProduct validation

  if (isNaN(removeProduct)) {
    return res.status(400).send({ status: false, message: `removeProduct should be a valid number either 0 or 1` });
}
if (!(removeProduct === 0 || removeProduct === 1)) {
  return res.status(400).send({
      status: false, message: "removeProduct should be 0 (product is to be removed) or 1(quantity has to be decremented by 1) "
  });
}
let findQuantity = cart.items.find((x) => x.productId.toString() === productId);

        if (removeProduct === 0) {
            let totalAmount = cart.totalPrice - product.price * findQuantity.quantity; // substract the amount of product*quantity

            await cartModel.findOneAndUpdate({ _id: cartId }, { $pull: { items: { productId: productId } } }, { new: true }); //?pull the product from itmes  //https://stackoverflow.com/questions/15641492/mongodb-remove-object-from-array

            let quantity = cart.totalItems - 1;

            let data = await cartModel.findOneAndUpdate({ _id: cartId }, { $set: { totalPrice: totalAmount, totalItems: quantity } }, { new: true }); //*update the cart with total items and totalprice

            return res.status(200).send({ status: true, message: `${productId} is been removed`, data: data });
        }

//* decrement quantity

let totalAmount = cart.totalPrice - product.price;
let arr = cart.items;
// await cartModel.findOneAndUpdate({ items: { $elemMatch: { productId: productId } } },)
for (i in arr) {
    if (arr[i].productId.toString() == productId) {
        arr[i].quantity = arr[i].quantity - 1;
        if (arr[i].quantity < 1) {
            await cartModel.findOneAndUpdate({ _id: cartId }, { $pull: { items: { productId: productId } } }, { new: true });

            let quantity = cart.totalItems - 1;
            let data = await cartModel.findOneAndUpdate({ _id: cartId }, { $set: { totalPrice: totalAmount, totalItems: quantity } }, { new: true }); 
            return res.status(400).send({ status: false, message: "no such Quantity present in this cart", data: data });
        }
    }
}
let datas = await cartModel.findOneAndUpdate({ _id: cartId }, { items: arr, totalPrice: totalAmount }, { new: true });
return res.status(200).send({ status: true, message: `${productId} quantity is been reduced By 1`, data: datas });


}catch(error){
 console.log(error);
 res.status(500).send({ msg: error.message })
}
}
//********************deleteApi************************************* 

let deleteCart = async function (req, res) {
    try {
        let userId = req.params.userId
        if (userId.trim().length == 0)
	      return res.status(400).send({ status: false, Message: "Dont Left userId Empty" })

        if (!isValidObjectId(userId)) 
	      return res.status(400).send({ status: true, Message: "Invalid ProductId !" })
     
        let checkCart = await cartModel.findOne({ userId: userId })
        if (!checkCart) 
        return res.status(400).send({ status: false, Message: 'cart not found ' })
       
       if (checkCart.items.length==0)
	     return res.status(400).send({ status: false, Message: "Cart is already empty" })
      
       await cartModel.findOneAndUpdate({ userId: userId }, { items: [], totalPrice: 0, totalItems: 0 })
       res.status(204).send({ status: true, Message: 'sucessfully deleted' })
    } catch (error) { 
      res.status(500).send({ status: false, Message: error.message }) }
}



module.exports.createCart = createCart,
module.exports.getCart = getCart,
module.exports.updateCart = updateCart,
module.exports.deleteCart = deleteCart
