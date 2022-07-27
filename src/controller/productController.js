const productModel = require("../model/productModel");
const mongoose = require("mongoose");
const aws = require("aws-sdk")
const jwt = require('jsonwebtoken')

const { isValidName, isValidN, isValidObjectId, isValidRequestBody, isValid, isValidPrice, } = require("../validator/validator");


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
    const { title, description, price, currencyId, currencyFormat,productImage } = data

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

        
            
        
    const uploadedproductImage = await uploadFile(files[0])
    data.productImage = uploadedproductImage

    let productData = await productModel.create(data)
    res.status(201).send({ status: true, message: "Successfully created", data: productData })
}
catch(err){
    res.status(500).send({status:false,message:err.message})
}
}

module.exports.createProduct = createProduct