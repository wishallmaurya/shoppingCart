const jwt = require("jsonwebtoken");
const bookModel = require("../model/userModel");



// AUTHENTICATION
const authenticate = function (req, res, next) {
  try {
    let token = req.headers('Authorization','Bearer Token');
    if (!token)
      return res
        .status(400)
        .send({ status: false, msg: "TOKEN MUST BE PRESENT" });

    let decodedToken = jwt.verify(token, "group-11", function (err, token) {
      if (err) {
        return res
          .status(401)
          .send({ status: false, msg: "TOKEN  IS NOT VALID" });
      } else {
        return token;
      }
    });
    

    req.tokenId = decodedToken.userId;
    next();
  } catch (err) {
    res.status(500).send({ Status: "SERVER ERROR", Msg: err.message });
  }
};

module.exports.authenticate = authenticate;