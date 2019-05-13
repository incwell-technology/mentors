const Signup = require('../models/signup')
const router = require('express').Router()


router.get('/signup',(req,res) =>{
    res.sendFile('../public/signup.html')
});

router.post('/signup',(req,res)=>{
    var user = new Signup({
    name:req.name,
    email:req.email,
    password:req.password
    })
});

module.exports = router;