//.................................... Import Models for using in this module ....................//
const mongoose = require("mongoose");
//................................. Create Schema .........................//
const userSchema = new mongoose.Schema(
  {
    fname: {
      type: String,
      require: true,
      trim: true
    },
    lname: {
      type: String,
      require: true,
      trim: true
    },
    email: {
      type: String,
      require: true,
      unique: true,
      trim: true,

  },
  profileImage: {
    type:String,
    require:true,
    trim:true
  },                                      // s3 link
  phone: {
    type:String,
    require:true,
    unique:true,
    trim:true
}, 
  password: {
    type:String,
    require:true,
    trim:true,
    min: 8 , 
    max: 15
  },                          
  address: {
    shipping: {
      street: {
        type:String,
        require:true
      },
      city: {
        type:String,
        require:true
      },
      pincode: {
        type:Number,
        require:true
      }
    },
    profileImage: {
      type: String,
      require: true,
      trim: true
    },                                      // s3 link
    phone: {
      type: String,
      require: true,
      unique: true,
      trim: true
    },
    password: {
      type: String,
      require: true,
      trim: true,
      min: 8,
      max: 15
    },                                        // encrypted password
    address: {
      shipping: {
        street: {
          type: String,
          require: true
        },
        city: {
          type: String,
          require: true
        },
        pincode: {
          type: Number,
          require: true
        }
      },
    billing: {
        street: {
          type: String,
          require: true
        },
        city: {
          type: String,
          require: true
        },
        pincode: {
          type: Number,
          require: true
        }
      }
    }
  },
},
  { timestamps: true });

module.exports = mongoose.model('User',userSchema)


