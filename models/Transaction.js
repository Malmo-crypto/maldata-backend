const mongoose = require("mongoose");


const transactionSchema = new mongoose.Schema({

userId:{
 type:mongoose.Schema.Types.ObjectId,
 ref:"User",
 required:true
},

refunded: {
  type: Boolean,
  default: false
},

refundReason: {
  type: String,
  default: null
},

refundAt: {
  type: Date,
  default: null
},

type:{
 type:String,
 required:true
},


amount:{
 type:Number,
 required:true
},


reference:{
 type:String,
 unique:true
},


status:{
 type:String,
 default:"pending"
},


profit:{
 type:Number,
 default:0
},


metadata:{
 type:Object
},


providerResponse:{
 type:Object
},

processing: {
  type: Boolean,
  default: false
}

},{
timestamps:true
});


module.exports =
mongoose.model("Transaction", transactionSchema);