

const mongoose = require('mongoose')

//Body validation
const isValidRequestBody = function(data) {
    return Object.keys(data).length > 0; // it checks, is there any key  available or not in request body
};

//Name Validation
const isValidName = function(name) {
    const nameRegex = /^[a-zA-Z ]+$/
    return nameRegex.test(name)
}

// Price Validation
const isValidPrice = (price) => {
    if (/^(?:[1-9]\d*|0)?(?:\.\d+)?$/.test(price)&&price>0)
        return true
}


//Email Validation 
const isValidEmail = function(email) {
    const emailRegex = /^[a-z0-9][a-z0-9-_\.]+@([a-z]|[a-z0-9]?[a-z0-9-]+[a-z0-9])\.[a-z0-9]{2,10}(?:\.[a-z]{2,10})?$/
    return emailRegex.test(email.toLowerCase())
}

//Mobile Validation
const isValidPhone = function(phone) {
    const mobileRegex = /^[6-9]{1}[0-9]{9}$/;
    return mobileRegex.test(phone)
}
//password Validation
const isValidPassword = function(password) {
    const passwordRegex = /^[a-zA-Z0-9@$!%*#?&]{8,15}$/
    return passwordRegex.test(password)
}

const isValidAddress = function(address) {
        if (typeof address === 'undefined' || address === null) return false
        if (Object.keys(address).length === 0) return false
        return true;
    }


//Value Validation
const isValid = function(value) {
    if (typeof value === 'undefined' || value === null) return false
    if (typeof value === "string" && value.trim().length === 0) return false
    return true
}
const isValidN = function(value) {
    if (typeof value === 'undefined' || value === null) return false
    if (typeof value === Number && value.trim().length === 0) return false
    return true
}

//ObjectId validation
const isValidObjectId = function(ObjectId) {
    return mongoose.Types.ObjectId.isValid(ObjectId)
}
// pinCode Validation
// const isValidPinCode = function (pinCode) {
//     const pinCodeRegex = /^[1-9][0-9]{6}$/;
//     return pinCodeRegex.test(pinCode);
//   };
//pincode
const isValidPincode = (pin) => {
    if (/^[1-9][0-9]{5}$}*$/.test(pin))
        return true
}
//Installment Validation 
const isValidInstallment = function isInteger(value) {
    if(value < 0) return false
     if(value % 1 == 0 ) return true
}
module.exports= { isValidName, isValidEmail, isValidPhone,isValidN, isValidPassword, isValidObjectId, isValidRequestBody, isValid, isValidAddress,isValidPincode,isValidInstallment,isValidPrice }