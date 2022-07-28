const productModel = require("../model/productModel");
const mongoose = require("mongoose");
const aws = require("aws-sdk")
const jwt = require('jsonwebtoken')

const { isValidObjectId, isValidRequestBody, isValid, isValidPrice, isValidInstallment} = require("../validator/validator");


//===============================S3 LINK =======================
aws.config.update({
    accessKeyId: "AKIAY3L35MCRVFM24Q7U",
    secretAccessKey: "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",
    region: "ap-south-1"
})

let uploadFile = async (file) => {
    return new Promise(function (resolve, reject) {
        let s3 = new aws.S3({ apiVersion: '2006-03-01' });

        var uploadParams = {
            ACL: "public-read",
            Bucket: "classroom-training-bucket",
            Key: "Hercules/User/" + file.originalname,
            Body: file.buffer
        }

        s3.upload(uploadParams, function (err, data) {
            if (err) {
                return reject({ "error": err })
            }
            return resolve(data.Location)
        })
    })
}

const createProduct = async function (req, res) {
    try{
    let data = req.body
    let { title, description, price, currencyId, currencyFormat,productImage,availableSizes } = data

    if (Object.keys(req.body).length < 1) return res.status(400).send({ msg: "Data is required." })

    if (!isValid(title)) {
        return res.status(400).send({ status: false, message: "Title must be present." })
    }
    let productTitle = await productModel.findOne({ title: title })
        if (productTitle) {
            return res.status(400).send({ status: false, message: 'Title already Present' });
        }

    if (!isValid(description)) {
        return res.status(400).send({ status: false, message: "description must be present." })
    }

    if (!isValid(price)) {
        return res.status(400).send({ status: false, message: "Price must be present." })
    }
    if (!isValidPrice(price)) {
        return res.status(400).send({ status: false, message: "Price must be in number." })
    }


    if (!isValid(currencyId)) {
        return res.status(400).send({ status: false, message: "currencyId must be present." })
    }
    if (!isValid(currencyFormat)) {
        return res.status(400).send({ status: false, message: "currencyFormat must be present." })
    }
    
        let files=req.files
    
    if (!(files&&files.length)) {
        return res.status(400).send({ status: false, message: " Please Provide The Product Image." });}

        // const isValidSize = function(availableSizes) {
            let size=availableSizes.split(',').map(x=>x.trim())
            // console.log(size)
            for(let i=0;i<size.length;i++){
            let sizeCheck =["S", "XS","M","X", "L","XXL", "XL"].includes(size[i])
             if(!sizeCheck)return res.status(400).send({status:false,message:"Enter Size from Enum only."})
            //  console.log(availableSizes)
            }
           req.body.availableSizes=size
        // } 
    //     if(availableSizes){
    //     if (!isValidSize(availableSizes)) {
    //         return res.status(400).send({ status: false, message: "Available size not  present." })
    //     }
    // }
            
        
    const uploadedproductImage = await uploadFile(files[0])
    data.productImage = uploadedproductImage

    let productData = await productModel.create(data)
    res.status(201).send({ status: true, message: "Successfully created", data: productData })
}
catch(err){
    res.status(500).send({status:false,message:err.message})
}
}

const getProducts = async function(req,res){
    try{

        let {size,name,priceGreaterThan,priceLessThan,priceSort}  = req.query
        
        if(priceSort){
        if(priceSort != 1 && priceSort != -1 ) return res.send({status:false,message:"priceSort has to be 1 or -1"})
        }
       let filter ={isDeleted:false}
              
       if(size){
        filter.availableSizes = size
       }
       if(name){
        filter.title = {$regex : name}
       }
       
       if(!priceGreaterThan){
          priceGreaterThan = 0
       }
       if(!priceLessThan){
        priceLessThan =  999999
       }

        let products = await productModel.find({$and:[filter,{price:{$gt:priceGreaterThan,$lt:priceLessThan}}]}).sort({price:priceSort})
       if(products.length===0){
        return res.status(404).send({status:false,message:"Data not found ! Use valid filters."})
       }
        res.status(200).send({status: true, message: 'Success', data: products })

    }catch(error){
        res.status(500).send({ msg: error.message })
    }
}

//////====================================GetProduct===============
// const getProductById = async function(req,res){
// try{
 
//    let productId = req.params.productId

//    if(!isValidObjectId(productId))  return res.status(404).send({status: false,  msg:"enter valid productId" })

//    let product = await productModel.findOne({_id:productId,isDeleted:false})
//    if(!product) return res.status(404).send({status: false,  msg:"products not found" })

//    res.status(200).send({status: true, message: 'Success', data: product })


// }catch(error){
//     res.status(500).send({ msg: error.message })
// }
// }

// //==========================Update Product============================
// let updateProduct = async function(req,res){
//     try {
//         let data= req.body
//          let productId = req.params.productId
//          if(!isValidObjectId(productId)){
//             return res.status(400).send({ status: false, message: `${productId} is not a valid product id` })
//             }
//             let checkingProduct = await productModel.findOne({_id:productId,isDeleted:false})
//         if(!checkingProduct){
//             return res.status(404).send({ status: false, message: `product is not available with this id ${productId}`})
           
//         }
//         if (!(isValidRequestBody(data) || req.files)) {
//             return res.status(400).send({ status: false, message: 'Enter data to update' })
//         }
        
    
//         const { title, description, price, currencyId, isFreeShipping, style, availableSizes, installments } = data;
//         let toUpdate = {_id:productId,isDeleted:false}
//         if(title){
//             const checkingTitle = await productModel.findOne({title:title,isDeleted:false});
//             if(checkingTitle){ return res.status(400).send({ status: false, message: `${title} title is already used` })}
//             toUpdate.title = title
//         }
//         if(description){
//             toUpdate.description = description
//         }
//         if(price){
//             if (price < 1) {
//                 return res.status(400).send({ status: false, message: `Price should be a valid number` })
//             }
//             toUpdate.price = price
//         }
//         if(currencyId){
//             if ((currencyId != "INR")) {
//                 return res.status(400).send({ status: false, message: 'currencyId should be a INR' })
//             }
//             toUpdate.currencyId = currencyId
//         }
//         if(isFreeShipping){
//             if (((isFreeShipping != "true") || (isFreeShipping != "false"))) {
//                 return res.status(400).send({ status: false, message: 'isFreeShipping should be a boolean value' })
//             }
//             toUpdate.isFreeShipping = isFreeShipping
//         }
//         let files = req.files;
//         if ((files && files.length > 0)) {
    
//             let updatedproductImage = await uploadFile(files[0]);
//             toUpdate.productImage= updatedproductImage
//         }
//         if(style){
//             toUpdate.style = style
//         }
//         if(availableSizes){
            
//             let sizes= availableSizes.split(",").map(x => x.trim())
    
//             for (let i = 0; i < sizes.length; i++) {
//                 if (!(["S", "XS", "M", "X", "L", "XXL", "XL"].includes(sizes[i]))) {
//                     return res.status(400).send({ status: false, message: `availableSizes should be among ${["S", "XS", "M", "X", "L", "XXL", "XL"]}` })
//                 }
//             }
//             toUpdate.availableSizes = sizes
//         }
//         if (installments) {
//             if (!isValidInstallment(installments)) {
//                 return res.status(400).send({ status: false, message: "installments can't be a decimal number & must be greater than equalto zero " })
//             }
            
//                 toUpdate.installments = installments
//         }
//         const updatedProduct = await productModel.findOneAndUpdate({ _id: productId }, toUpdate, { new: true })
    
//         return res.status(200).send({ status: true, message: 'Successfully updated product details.', data: updatedProduct });
    
//     } catch (error) {
//         return res.status(500).send({msg:error.message})
//     }
//     }
    
    
// //=======================Delete Product===================
// const deleteProduct = async function (req, res){
//     try {
 
//         const productId = req.params.productId;
//        	if (productId.trim().length == 0)
// 	return res.status(400).send({ status: false, msg: "Dont Left productId Empty" })

//         if (!mongoose.isValidObjectId(productId)) 
// 	return res.status(400).send({ status: true, Message: "Invalid ProductId !" })
      
//         const product = await productModel.findById(productId)
//         if (!product) 
// 	return res.status(404).send({ status: false, Message: "Product not found in db" })

//         if (product.isDeleted==true)
// 	return res.status(400).send({ status: false, Message: "Product already deleted!" })

// 	let date = new Date();
// 	await productModel.findOneAndUpdate({ _id: productId }, { $set: { isDeleted: true, deletedAt: date } })
//         res.status(200).send({ status: true, Message: "Product deleted !" })

//     } catch (err) {
//         res.status(500).send({ status: true, Message: err.message })
//     }
// }
module.exports.getProducts = getProducts
module.exports.getProductById = getProductById
module.exports.deleteProduct = deleteProduct
module.exports.updateProduct= updateProduct
module.exports.createProduct = createProduct