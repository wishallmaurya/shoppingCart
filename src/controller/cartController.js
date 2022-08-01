const cartModel = require("../model/cartModel");
const productModel = require("../model/productModel");
const userModel = require("../model/userModel");

const { isValidObjectId, isValidRequestBody, isValid, isValidPrice, isValidInstallment} = require("../validator/validator");

let createCart = async function(req,res){
  try {
    const userId = req.params.userId;
    
    if (!(isValidObjectId(userId))) {
      return res.status(400).send({ status: false, message: "Please provide valid User Id" });
  }
    let data = req.body
    if(!(isValidRequestBody(data))){
     return res .status(404).send({status:false,msg:"plz provide the data"})
    }
    // const { quantity, productId } = data;
    console.log(data)
    
    if(!(isValid(data.items[0].productId))){
      return res.status(400).send({ status: false, message: "Please provide the product Id" });

    }
    if(!(isValidObjectId(data.items[0].productId))){
      return res.status(400).send({ status: false, message: "Please provide valid Product Id" });

    }
    const findUser = await userModel.findById({ _id: userId });


    if (!findUser) {
        return res.status(400).send({ status: false, message: `User doesn't exist by ${userId}` });
    }

    const findProduct = await productModel.findOne({ _id: (data.items[0].productId), isDeleted: false });

    if (!findProduct) {
        return res.status(400).send({ status: false, message: `Product doesn't exist by ${(data.items[0].productId)}` });
    }
    const findUserCart = await cartModel.findOne({ userId: userId });
   
    if (!findUserCart) {
      var cartData = {
          userId: userId,
          items: [
              {
                  productId: (data.items[0].productId),
                  quantity:(data.items[0].quantity),
              },
          ],
          totalPrice: findProduct.price * (data.items[0].quantity),
          totalItems: 1,
      };
      const createCart = await cartModel.create(cartData);
      return res.status(201).send({ status: true, message: `Cart created successfully`, data: createCart });
  }
  if (findUserCart) {

    let price = findUserCart.totalPrice + (data.items[0].quantity) * findProduct.price;
    let arr = findUserCart.items;
      for (i in arr) {
        if (arr[i].productId.toString() === data.items[0].productId) {
            arr[i].quantity +=data.items[0].quantity
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
    arr.push({ productId: data.items[0].productId, quantity: data.items[0].quantity });
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
const getCart = async function (req, res) {
  try {
      const userId = req.params.userId
      if (userId.trim().length == 0)
      return res.status(400).send({ status: false, Message: "Dont Left userId Empty" })

      if (!mongoose.isValidObjectId(userId)) 
      return res.status(400).send({ status: true, Message: "Invalid UserId !" })

      const checkCart = await cartModel.findOne({ userId: userId })

      if (!checkCart) 
      return res.status(404).send({ status: false, Message: 'Cart not found' })
      if (checkCart.items.length==0)
      return res.status(400).send({ status: false, Message: "Cart is empty" })

      res.status(200).send({ status: true, Message: 'Succcess', data: checkCart })
  } catch (error) { 
    res.status(500).send({ status: false, Message: error.message }) }
}

//******************updateApi***************************/
const updateCart=async function(req,res){
  try{
     
 let data=req.body
 let userId=req.params.userId
 let userIdFromToken = req.tokenId 
 console.log(data)

 const{productId,cartId,removeProduct}=data

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


 if(!isValidObjectId(cartId)){
     return res.status(400).send({ status: false, message: "cartId is not  valid." })
     }
     let cart = await cartModel.findOne({_id:cartId})
     console.log(cart)
 if(!cart){
     return res.status(404).send({ status: false, message: "cartId not found."})
    }

//     let toUpdate = {_id:productId,isDeleted:false}
//     if(removeProduct){
//      if(typeof removeProduct===Number)
//      toUpdate.removeProduct = removeProduct
     
//      // console.log(data.items[1].quantity)
//  }
console.log(productId)
 if(!isValidObjectId(productId)){
     return res.status(400).send({ status: false, message: "ProductId is not valid." })
}
console.log(productId);
     let product = await productModel.findOne({_id:productId,isDeleted:false})
 if(!product){
     return res.status(404).send({ status: false, message: `Product is not available with this id ${productId}`})
    
 }
 //.......find if products exits in cart

 let isProductinCart = await cartModel.findOne({ items: { $elemMatch: { productId: productId } } });

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
console.log("this is findQuantity",findQuantity);

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



module.exports.createCart = createCart,
module.exports.getCart = getCart,
module.exports.updateCart = updateCart,
module.exports.deleteCart = deleteCart
