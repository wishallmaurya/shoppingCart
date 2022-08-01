const jwt = require("jsonwebtoken");
const bookModel = require("../model/userModel");



// AUTHENTICATION
const authenticate = function (req, res, next) {
  try {
    let token = req.headers.authorization;
    // console.log(token)
    if (!token)
      return res
        .status(400)
        .send({ status: false, msg: "TOKEN MUST BE PRESENT" });
        token= token.split(' ')[1]

    let decodedToken = jwt.verify(token, "project5",function(err,token){
      if(err){ return res
        .status(401)
        .send({ status: false, msg: "TOKEN  IS NOT VALID" });}
        else{
          return token
        }
    }) 
    req.tokenId = decodedToken.userId;
    next();
  } catch (err) {
    return res.status(500).send({ Status: "SERVER ERROR", Msg: err.message });
  }
};

module.exports.authenticate = authenticate;