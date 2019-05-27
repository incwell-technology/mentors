const mongoose = require('mongoose');
require('dotenv').config({
    path: './config/.env'
});

var schema = mongoose.Schema({
    first_name: {type:String, required:true},
    last_name :{type:String,required:true},
    email: {type:String, required:true,  unique:true},
    password : String,
    google_id: Number,
    dob : {type:Date},
    phone : {type:Number},
    address : {type:String},
    user_role : {type:String},
    verified_email : {type: Boolean, default: false},
    refresh_token : {type:Array,required:true, expires: process.env.refresh_token_exp },
})
schema.methods.toJSON = function () {
    var obj = this.toObject()
    delete obj.password
    delete obj.refresh_token
    return obj
}
module.exports = mongoose.model("User", schema)

