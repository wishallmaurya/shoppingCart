const userModel = require("../model/userModel");
const mongoose = require("mongoose");
const aws =require("aws-sdk")
const jwt = require('jsonwebtoken')
const { AppConfig } = require('aws-sdk');
const { isValidName, isValidEmail, isValidPhone, isValidN,isValidPassword, isValidObjectId, isValidRequestBody, isValid, isValidAddress,isValidPincode } = require("../validator/validator");
const bcrypt = require('bcrypt')


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
        Key: "Hercules/User/" + file.originalname,
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
    const{fname,lname,email,phone,address,password}=data
    console.log(address)
    if(!isValidRequestBody(data))
    return res.send({status:false,message:"Field cannot be empty."})

    if (!isValid(fname)) {
        return res.status(400).send({ status: false, message: "fname is required." })
    }
    if (!/^[a-zA-Z ]+$/.test(fname))
        return res.status(400).send({ status: false, message: "Invalid fname." })
    
    if (!isValid(lname)) {
        return res.status(400).send({ status: false, message: "lname is required." })
    }
    if (!/^[a-zA-Z ]+$/.test(lname))
        return res.status(400).send({ status: false, message: "Invalid lname." })
         //validating email using RegEx.
         if (!isValid(email)) {
            return res.status(400).send({ status: false, message: "Email id is required" })
        }
    if (!isValidEmail(email))
    return res.status(400).send({ status: false, message: "Invalid Email id." })
    
    let emailAlredyPresent = await userModel.findOne({ email: email })
    if (emailAlredyPresent) {
        return res.status(400).send({ status: false, message: `Email Already Present` });
    }
   
    if (!isValid(phone)) {
        return res.status(400).send({ status: false, message: "Phone number is required" })
    }
    //validating phone number of 10 digits only by using RegEx. 
    if (!/^[6-9]{1}[0-9]{9}$/.test(phone))
        return res.status(400).send({ status: false, message: "Invalid Phone number." })

        let phoneAlredyPresent = await userModel.findOne({ phone: phone })
        if (phoneAlredyPresent) {
            return res.status(400).send({ status: false, message: `Phone Number Already Present` });
        }

   
   

    if (!isValid(password)) {
        return res.status(400).send({ status: false, message: "password is required" })
    }
    //setting password's mandatory length in between 8 to 15 characters.
    if (!isValidPassword(password)) {
        return res.status(400).send({ status: false, message: "Password criteria not fulfilled." })
    }

    if (!isValid(address)) {
        return res.status(400).send({ status: false, message: "Address cannot be empty if it is mentioned." })
    };
    console.log("hhhh",address.shipping.street)
     // ------- Address Validation  --------
     if (address) {
        data.address = address;
        if (address.shipping) {
          // let { street, city, pincode } = address.shipping;
          if (!isValid(address.shipping.street)) {
            return res
              .status(400)
              .send({ status: "false", message: "street must be present" });
          }
          if (!isValid(address.shipping.city)) {
            return res
              .status(400)
              .send({ status: "false", message: "city must be present" });
          }
          let pinn = parseInt(address.shipping.pincode)
        //   if (!isValidN(pinn)) {
        //     return res
        //       .status(400)
        //       .send({ status: "false", message: "shipping pincode must be IN number" });
        //   }
        
         if(!pinn){
            return res
            .status(400)
            .send({ status: "false", message: "shipping must be present and in digits!!!" });
       
         }

         console.log(pinn)
          if(!isValidName(address.shipping.street)) {
             return  res
              .status(400)
              .send({ status: "false", message: "street should be in alphabetical order" });
          }
          if(!isValidName(address.shipping.city)) {
             return res
              .status(400)
              .send({ status: "false", message: "city should be in alphabetical order" });
          }
          if(!isValidPincode(pinn)) {
             return res
              .status(400)
              .send({ status: "false", message: "shipping pincode should be valid " });
         }
        }
        if (address.billing) {
          // let { street, city, pincode } = address.billing;
          if (!isValid(address.billing.street)) {
            return res
              .status(400)
              .send({ status: "false", message: "street must be present" });
          }
          if (!isValid(address.billing.city)) {
            return res
              .status(400)
              .send({ status: "false", message: "city must be present" });
          }
         // let pin = parseInt(address.billing.pincode)
          //address.billing.pincode =pin;
          let pin = parseInt(address.billing.pincode)
          if(!pin){
            return res
            .status(400)
            .send({ status: "false", message: "billing must be present and in digits!!!" });
       
         }

        //   if (!isValidN(address.billing.pincode)) {
        //    return res
        //       .status(400)
        //       .send({ status: "false", message: "pincode must be present" });
        //   }
          if(!isValidName(address.billing.street)) {
             return res
              .status(400)
              .send({ status: "false", message: "street should be in alphabetical order" });
          }
          if(!isValidName(address.billing.city)) {
             return res
              .status(400)
              .send({ status: "false", message: "city should be in alphabetical order" });
          }
        //   if (!isValidN(address.billing.pincode)) {
        //     return res
        //       .status(400)
        //       .send({ status: "false", message: "billing pincode must be IN number" });
        //   }
          if(!isValidPincode(pin)) {
           return res
              .status(400)
              .send({ status: "false", message: "Billing pincode should be valid " });
          }
        }
      }
    let files=req.files
    
    if (!(files&&files.length)) {
        return res.status(400).send({ status: false, message: " Please Provide The Profile coverpage" });}
    const uploadedprofileImage = await uploadFile(files[0])

    data.profileImage = uploadedprofileImage

    const salt = await bcrypt.genSalt(10);
    
    data.password = await bcrypt.hash(password, salt)
    
    let userData = await userModel.create(req.body)
    
   return res.status(201).send({ status: true, message: "Success", data: userData });
} 
catch (error) {
    console.log(error.message);
    res.status(500).send({ status: false, message: error.message });
}
}

const loginUser = async function (req, res) {

    try {
        if (Object.keys(req.body).length<1) return res.status(400).send({ msg: "Data is required." })
        
        let email = req.body.email;
        if(!email) return res.status(400).send({status:false,msg:"enter email"})

        let password = req.body.password;
        if(!password) return res.status(400).send({status:false,msg:"enter password"})

        let user = await userModel.findOne({email: email});
        if (!user)
            return res.status(401).send({
                status: false,
                msg: "email or the password is not correct",
            });

        let decPassword = await bcrypt.compare(password,user.password)
        if(!decPassword) return  res.status(401).send({ error: "Invalid Password" });

        let token = jwt.sign(
            {
                userId: user._id.toString(),
            },
            "project5",
            {expiresIn:'10h'}
        );
        return res.status(200).send({ status: true,msg:"User login successfull", data: {userId:user._id,token: token} });
    }
    catch (error) {
        res.status(500).send({ msg: error.message })
    }
}

const getUserProfile = async (req, res) => {

    try {
        let userId = req.params.userId
        console.log("controller 11",userId)
        let userIdFromToken = req.tokenId 



        if (!userId) {
            return res.status(400).send({ status: false, message: "plz provied userId ." })
        }
        if (!isValidObjectId(userId)) {
            return res.status(400).send({ status: false, message: "enter  valid userId ." })
        }


        const findUserProfile = await userModel.findById({ _id: userId })
        if (!findUserProfile) {
            return res.status(400).send({
                status: false, message: `User doesn't exists by ${userId}`
            })
        }
      
        if (userIdFromToken != findUserProfile._id) {
            return res.status(403).send({
                status: false,
                message: "Unauthorized access."
            })
        }

        return res.status(200).send({ status: true, message: "Profile found successfully.", data: findUserProfile })
    } catch (err) {
        return res.status(500).send({ status: false, msg: err.message })
    }
}





const updateUser = async function(req,res){
    try{
        let fromRequestBody= req.body
        let { fname, lname, email, phone, password, address} = fromRequestBody
        let userId = req.params.userId
        let userIdFromToken = req.tokenId 
        if (!isValidObjectId(userId)) {
            res.status(400).send({ status: false, message: `${userId} is not a valid user id` })
            return
        }
        if (userId != userIdFromToken) {
            res.status(403).send({ status: false, message: `Unauthorized access! User's info doesn't match` });
            return
        }

        const findUserProfile = await userModel.findOne({ _id: userId })
        if (!findUserProfile) {
            return res.status(400).send({
                status: false,
                message: `User doesn't exists by ${userId}`
            })
        }
      
       
        if(Object.keys(req.body).length<1&&req.files=== undefined)  return res.status(400).send({status:false,msg:"Enter data to update"})
        // if(req.files.length==0) return res.status(400).send({status:false,msg:"Enter what you want to update"})
        if(!isValidName(fname)) return res.status(400).send({status:false,msg:"enter valid firstname"})
      if(!isValidName(lname)) return res.status(400).send({status:false,msg:"enter valid lastname"})
        
        if(email){
            let emailCheck = await userModel.findOne({email:email})
            if(emailCheck)  return res.status(400).send({status:false,msg:"email is already in use"})
            if(!isValidEmail(email)) return res.status(400).send({status:false,msg:"enter valid email"})
        }
        
        if(phone){
           let phoneCheck = await userModel.findOne({phone:phone})
           if(phoneCheck)  return res.status(400).send({status:false,msg:"phone is already in use"})
           if(!isValidPhone(phone))  return res.status(400).send({status:false,msg:"enter valid phone number"})
         }
        if(password){
            
            if(!isValidPassword(password)) return res.status(400).send({status:false,msg:"enter valid password "})
            const salt = await bcrypt.genSalt(10)
            fromRequestBody.password= await bcrypt.hash(password, salt)
        }
         // ------- Address Validation  --------
     if (address) {
        fromRequestBody.address = address;
        if (address.shipping) {
          
          let pinn = parseInt(address.shipping.pincode)
       
          if(!isValidName(address.shipping.street)) {
             return  res
              .status(400)
              .send({ status: "false", message: "street should be in alphabetical order" });
          }
          if(!isValidName(address.shipping.city)) {
             return res
              .status(400)
              .send({ status: "false", message: "city should be in alphabetical order" });
          }
          if((pinn)) {
            if((!isValidPincode(pinn)) )
             return res
              .status(400)
              .send({ status: "false", message: "shipping pincode should be valid " });
         }
        }
        if (address.billing) {
         
          let pin = parseInt(address.billing.pincode)
        
          if(!isValidName(address.billing.street)) {
             return res
              .status(400)
              .send({ status: "false", message: "street should be in alphabetical order" });
          }
          if(!isValidName(address.billing.city)) {
             return res
              .status(400)
              .send({ status: "false", message: "city should be in alphabetical order" });
          }
          if(!isValidPincode(pin)) {
           return res
              .status(400)
              .send({ status: "false", message: "Billing pincode should be valid " });
          }
        }
    //   }
    let files=req.files
     
    if (files.length>0) {
       //return res.status(400).send({ status: false, message: " Please Provide The Profile coverpage" });
       const uploadedprofileImage = await uploadFile(files[0])

   fromRequestBody.profileImage = uploadedprofileImage

   }
   
    
     }
      let updatedUser = await userModel.findOneAndUpdate({ _id: userId }, { $set: req.body }, { new: true })
        res.status(200).send({status:true,msg:"User profile updated",data:updatedUser})
    

    }catch(error){
        console.log(error);
        res.status(500).send({ msg: error.message })
    }
}


module.exports.createUser=createUser
module.exports.loginUser = loginUser
module.exports.updateUser= updateUser
module.exports.getUserProfile = getUserProfile

