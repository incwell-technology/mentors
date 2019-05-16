const User = require('../models/user')
const router = require('express').Router()
const jwt = require('jsonwebtoken')
const bcrypt = require('bcrypt')
const secretKey = require('../config/secretKey')
const errorMsg = require('../config/errorMsg')
const statusCode = require('../config/statusCode')

router.post('/signup', async(req,res)=>{
    const user =  await User.findOne({email:req.body.email})
    if(user) {
        return res.status(statusCode.forbidden.code).json(errorMsg.user_exists.message)
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
            const token = jwt.sign({name : req.body.name, email: req.body.email}, secretKey.token.key, { expiresIn: '24h' })
            const refreshToken = await jwt.sign({name : req.body.name, email: req.body.email},secretKey.token.key,{expiresIn: '30d'})
            try{
                const user = new User({
                    name: req.body.name,
                    email: req.body.email,
                    password: hash,
                    refreshToken : refreshToken
                })
                user.save()
                const response = {
                    "status": "Logged in",
                    "token": token,
                    "refreshToken": refreshToken,
                }
                tokenList[refreshToken] = response
                res.status(statusCode.ok.code).json({data : user, tokenResponse: response})
            }
            catch(err){
                next(err)
                res.json(err)
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
                    // update the token in the list
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