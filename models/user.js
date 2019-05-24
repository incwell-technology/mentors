const mongoose = require('mongoose')
var schema = mongoose.Schema({
    first_name: {type:String, required:true},
    last_name :{type:String,required:true},
    email: {type:String, required:true,  unique:true},
    password : {type:String, required:true},
    dob : {type:Date},
    phone : {type:Number},
    address : {type:String},
    user_role : {type:String, required:true},
    facebook_id : String,
    verified_email : {type: Boolean, default: false},
    refresh_token : {type:Array,required:true},
})
schema.methods.toJSON = function () {
    var obj = this.toObject()
    delete obj.password
    delete obj.refresh_token
    return obj
}
module.exports = mongoose.model("User", schema)