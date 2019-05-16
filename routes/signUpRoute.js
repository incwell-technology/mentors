const User = require('../models/user')
const Token = require('../models/token')
const router = require('express').Router()
const jwt = require('jsonwebtoken')
const bcrypt = require('bcrypt')
const secretKey = require('../config/secretKey')
const errorMsg = require('../config/errorMsg')
const statusCode = require('../config/statusCode')
const utils = require('../validationUtil/utils')
const nodemailer = require('nodemailer')
const dotenv = require('dotenv')

dotenv.config({
  path:'./config/.env'
})

router.post('/signup', async(req,res)=>{
    const user =  await User.findOne({email:req.body.email})
    const data = {
        first_name : req.body.first_name,
        middle_name : req.body.middle_name,
        last_name : req.body.last_name,
        email : req.body.email,
        education : req.body.education,
        gender : req.body.gender
    }
    if(user) {
        return res.status(statusCode.forbidden.code).json({status : 'failure',
            message:errorMsg.user_exists.message,
            data:data})
    }
    else{
        //hash with salting add random string 
        bcrypt.hash(req.body.password, 10, async(err,hash) =>{
        if(err){
            return res.status(statusCode.forbidden.code).json({
                error:errorMsg.forbidden.message
            });
        }
        else{
            if(req.body.first_name == '' || req.body.last_name == '' || req.body.email == '' ||
            req.body.password == '' ||req.body.education == '' ||req.body.gender == ''  ){
                return res.status(statusCode.bad_request.code).json({status:"failure",
                messsage:errorMsg.empty.message,
                data:data,})
            }
            else if(req.body.password !== req.body.confirm_password){
                return res.status(statusCode.bad_request.code).json({staus:"failure",
                    message:errorMsg.pass.message,
                    data : data})
            }
            else if(!utils.validateEmail(req.body.email)){
                return res.status(statusCode.bad_request.code).json({staus:"failure",
                    message:errorMsg.email.message,
                    data : data})
            }
            else if(!utils.validatePassword(req.body.password)){
                return res.status(statusCode.bad_request.code).json({staus:"failure",
                    message:errorMsg.password.message,
                    data : data})
            }
            else{
                const token = jwt.sign({ email: req.body.email}, secretKey.token.key, { expiresIn: '24h' })
                const refreshToken = await jwt.sign({email: req.body.email},secretKey.token.key,{expiresIn: '30d'})
                const user = new User({
                    first_name : req.body.first_name,
                    middle_name : req.body.nmiddle_name,
                    last_name : req.body.last_name,    
                    email: req.body.email,
                    password: hash,
                    education : req.body.education,
                    gender : req.body.gender,
                    refreshToken : refreshToken
                })
                user.save(async(err)=>{
                    try{
                        host=req.get('host');
                        let transporter = nodemailer.createTransport({ service: 'gmail',
                            port: 587, 
                            secure :false,
                            auth:{ user: process.env.GMAIL_USER, pass: process.env.GMAIL_PASSWORD } });
                        let mailOptions = {  
                            to: user.email, 
                            subject: 'Account Verification Token', 
                            text: 'Hello,\n\n' + 'Please verify your account by clicking the link: \nhttp:\/\/' + host + '\/confirmation\/' + token + '.\n' };
                        await transporter.sendMail(mailOptions, async (err)=> {
                            if (err) {
                                return res.status(500).json({ msg: "err message" }); 
                            }
                            // res.status(200).json('A verification email has been sent to ' + user.email + '.');
                        });
                    }
                    catch(err){
                        next(err)
                        res.json(err)
                    }
                    const response = {
                        "status": "sucess",
                        "token": token,
                        "refreshToken" :refreshToken,
                        "data" : user,
                        "message" : 'A verification email has been sent to ' + user.email + '.'
                    }
                    res.status(statusCode.ok.code).json({response})
    
                })
            } 
        } 
    })
    }    
});

router.post('/users', verifyToken, (req,res)=>{
    
    const bearerHeader = req.headers['authorization'];
    jwt.verify(req.token,secretKey.token.key, (err,authData)=>{
        if(err) res.status(statusCode.forbidden.code).json(errorMsg.forbidden.message)
        else{   
            res.json({
                message: 'OK good',
                authData: authData
            })
        }
    })
})

router.post('/token', async (req,res) => {
    // refresh the token
    let user =  await User.findOne({refreshToken: req.body.refreshToken})
    if(!user) res.json({message:errorMsg.ref_token.message})
    if(user){
        bcrypt.compare(req.body.password, user.password ,(err,result)=>{
            if(!result) {
                res.status(statusCode.forbidden.code).json({message:errorMsg.forbidden.message})
            }
            if(result) {
                // if refresh token exists
                if(req.body.refreshToken) {
                    const token = jwt.sign({name : req.body.name, email: req.body.email}, secretKey.token.key, { expiresIn: '24h'})
                    res.status(statusCode.ok.code).json({token:token});        
                } 
                else {
                    res.json(errorMsg.invalid.message)
                }
            }
        })
    }
})

function verifyToken(req,res,next){
    // Get auth header value
    const bearerHeader = req.headers['authorization'];
    // Check if bearer is undefined
    if(typeof bearerHeader !== 'undefined') {
        // Split at the space
        const bearer = bearerHeader.split(' ');
        // Get token from array
        const bearerToken = bearer[1];
        // Set the token
        req.token = bearerToken;
        // Next middleware
        next();
    }
    else{
        res.sendStatus(statusCode.forbidden.code);
    }
}

module.exports = router;