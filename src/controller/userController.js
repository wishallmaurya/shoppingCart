const userModel = require("../model/userModel");

const mongoose = require("mongoose");
const aws =require("aws-sdk")
const { AppConfig } = require('aws-sdk');
const multer=require("multer")


//===============================S3 LINK =======================
aws.config.update({
    accessKeyId: "AKIAY3L35MCRVFM24Q7U",
    secretAccessKey: "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",
    region: "ap-south-1"
})

let uploadFile= async ( file) =>{
   return new Promise( function(resolve, reject) {
    let s3= new aws.S3({apiVersion: '2006-03-01'}); 

    var uploadParams= {
        ACL: "public-read",
        Bucket: "classroom-training-bucket",  
        Key: "abc/" + file.originalname,  
        Body: file.buffer
    }

    s3.upload( uploadParams, function (err, data ){
        if(err) {
            return reject({"error": err})
        }
        return resolve(data.Location)
    })
})
}


const createUser=async function(req,res){
    try{
    let data=req.body
    let files=req.files
    if (!(files&&files.length)) {
        return res.status(400).send({ status: false, message: " Please Provide The Profile coverpage" });}
    const uploadedBookcover = await uploadFile(files[0])
    body.bookCover=uploadedBookcover

    let createData = await userModel.create(data);
    res.status(201).send({ status: true, message: "Success", data: createData });
} 
catch (error) {
    console.log(error.message);
    res.status(500).send({ status: false, message: error.message });
}
}

module.exports.createUser=createUser