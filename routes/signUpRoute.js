const User = require('../models/user')
const router = require('express').Router()
const jwt = require('jsonwebtoken')
const bcrypt = require('bcrypt')
const tokenList = {}

router.get('/signup',(req,res) =>{
    res.sendFile('../public/signup.html')
});

router.post('/signup', (req,res)=>{
    const user = User.findOne({email:req.body.email})
    if(user.length>=1) {
        return res.status(403).json('User Already exists')
    }
    else{
        //hash with salting add random string 
        bcrypt.hash(req.body.password, 10, (err,hash) =>{
        if(err){
            return res.status(500).json({
                error:err
            });
        }
        else{
            const user = new User({
                name: req.body.name,
                email: req.body.email,
                password: hash
            });
            user.save()
            const token = jwt.sign({user : user}, 'secretkey', { expiresIn: '24h' })
            const refreshToken = jwt.sign({user:user},'secretkey123',{expiresIn: '30d'})
            const response = {
                "status": "Logged in",
                "token": token,
                "refreshToken": refreshToken,
            }
            tokenList[refreshToken] = response
            res.json({data : user, tokenResponse: response})
        } 
    })
    }    
});

router.post('/users', verifyToken, (req,res)=>{
    
    const bearerHeader = req.headers['authorization'];
    jwt.verify(req.token,'secretkey', (err,authData)=>{
        if(err) res.status(403).json(err)
        else{   
            res.json({
                message: 'OK good',
                authData: authData
            })
        }
    })
})


router.post('/login',async(req,res) => {
    let user =  await User.findOne({email: req.body.email})
    if(!user) res.json({message:'Auth failed'})
    bcrypt.compare(req.body.password, user.password ,(err,result)=>{
        if(err) {
            res.status(403).json({message:'Auth failed'})
        }
        if(result) {
            const token = jwt.sign({user : user}, 'secretkey', { expiresIn: '24h' })
            const refreshToken = jwt.sign({user:user},'secretkey123',{expiresIn: '30d'})
            const response = {
                "status": "Logged in",
                "token": token,
                "refreshToken": refreshToken,
            }
            tokenList[refreshToken] = response
            res.json(response);
        }
    })
})

router.post('/token', async (req,res) => {
    // refresh the token
    let user =  await User.findOne({email: req.body.email})
    if(!user) res.json({message:'Auth failed'})
    bcrypt.compare(req.body.password, user.password ,(err,result)=>{
        if(err) {
            res.status(403).json({message:'Auth failed'})
        }
        if(result) {
            // if refresh token exists
            if((req.body.refreshToken) && (req.body.refreshToken in tokenList)) {
                const token = jwt.sign({user: user}, 'secretkey', { expiresIn: '24h'})
                // update the token in the list
                tokenList[req.body.refreshToken].token = token
                res.json({token:token});        
            } 
            else {
                res.json('Invalid request')
            }
        }
    })
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
        res.sendStatus(403);
    }
}

module.exports = router;