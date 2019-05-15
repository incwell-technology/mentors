const mongoose = require('mongoose')
module.exports =  mongoose.model('User', mongoose.Schema({
    name: {type:String, required:true},
    email: {type:String, required:true,  unique:true,
         match : /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/},
    password : {type:String, required:true, 
        match:/^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#\$%\^&\*])(?=.{8,})/},
    refreshToken : {type:Array}
}))

