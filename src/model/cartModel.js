const mongoose = require('mongoose');
let objectId =mongoose.Types.ObjectId

const cartSchema = new mongoose.Schema({

  userId: {type:objectId,ref: 'User',required: true,unique: true},

  items: [{ productId: {type:objectId,ref: 'Product',required: true},quantity: {type: Number,required: true,min: 1} }],

  totalPrice: {type: Number,required: true, default:0},

  totalItems: {type: Number,required: true, default:0},

}, { timestamps: true });

module.exports = mongoose.model('Cart', cartSchema)