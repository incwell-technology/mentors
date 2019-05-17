const mongoose = require('mongoose')
var schema = mongoose.Schema({
    first_name: {type:String, required:true},
    middle_name : {type:String},
    last_name :{type:String,required:true},
    email: {type:String, required:true,  unique:true},
    password : {type:String, required:true},
    dob : {type:Date, required:true},
    phone : {type:Number,required:true},
    address : {type:String,required:true},
    user_role : {type:String,required:true},
    VerifiedEmail : {type: Boolean, default: false},
    refreshToken : {type:Array,required:true},
})
schema.methods.toJSON = function () {
    var obj = this.toObject()
    delete obj.password
    delete obj.refreshToken
    return obj
}
module.exports = mongoose.model("User", schema)

