const User = require('../models/user')
const jwt = require('jsonwebtoken')
const bcrypt = require('bcrypt')
const secretKey = require('../config/secretKey')
const utils = require('../validationUtil/utils')
const nodemailer = require('nodemailer')
const dotenv = require('dotenv')
const http = require('http-status-codes')

dotenv.config({
  path:'./config/.env'
})

exports.create = async(req,res)=>{
    let role = null
    const user =  await User.findOne({email:req.body.email})
    if(req.body.user_role == 1) {role="Mentors"}
    if(req.body.user_role == 0) {role="Students"}
    const data = {
        first_name : req.body.first_name,
        middle_name : req.body.middle_name,
        last_name : req.body.last_name,
        email : req.body.email,
        dob : req.body.dob,
        address : req.body.address,
        phone : req.body.phone,
        user_role : role,
    }
    if(user) {
        return res.status(http.FORBIDDEN).json({status : 'failure',
            message:http.getStatusText(http.FORBIDDEN),
            data:data})
    }
    else{
        //hash with salting add random string 
        bcrypt.hash(req.body.password, 10, async(err,hash) =>{
        if(err){
            return res.status(http.FORBIDDEN).json({status : 'failure',
            message:http.getStatusText(http.FORBIDDEN)
            });
        }
        else{
            if(req.body.first_name == '' || req.body.last_name == '' || req.body.email == '' ||
            req.body.password == '' ||req.body.address == '' ||req.body.phone == ''  || 
            req.body.user_role==''){
                return res.status(http.FORBIDDEN).json({status:"failure",
                messsage:http.getStatusText(http.FORBIDDEN),
                data:data,})
            }
            else if(req.body.password !== req.body.confirm_password){
                return res.status(http.FORBIDDEN).json({staus:"failure",
                    message:http.getStatusText(http.FORBIDDEN),
                    data : data})
            }
            else if(!utils.validateEmail(req.body.email)){
                return res.status(http.BAD_REQUEST).json({staus:"failure",
                    message:http.getStatusText(http.FORBIDDEN),
                    data : data})
            }
            else if(!utils.validatePassword(req.body.password)){
                return res.status(http.FORBIDDEN).json({staus:"failure",
                    message:http.getStatusText(http.FORBIDDEN),
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
                    phone : req.body.phone,
                    dob : req.body.dob,
                    address : req.body.address,
                    user_role : role,
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
                            from : 'no-reply@mentors.com',
                            to: user.email, 
                            subject: 'Account Verification Token', 
                            text: 'Hello,\n\n' + 'Please verify your account by clicking the link: \nhttp:\/\/' + host + '\/mentors\/confirmation/?token=' + token + '.\n' };
                        await transporter.sendMail(mailOptions, async (err)=> {
                            if (err) {
                                return res.status(http.INTERNAL_SERVER_ERROR).json({ msg: http.getStatusText(http.INTERNAL_SERVER_ERROR) }); 
                            }
                        });
                    }
                    catch(err){
                        next(err)
                        res.json(err)
                    }
                    const response = {
                        "status": "Success",
                        "token": token,
                        "refreshToken" :refreshToken,
                        "data" : user,
                        "message" : 'A verification email has been sent to ' + user.email + '.'
                    }
                    res.status(http.OK).json({response})
                })
            } 
        } 
    })
    }    
}

exports.confirmation = (req,res)=>{
    if (req.query.token) {
        try {
            decoded = jwt.verify(req.query.token, secretKey.token.key);
        } 
        catch (e) {
            return res.status(http.UNAUTHORIZED).json({message:http.getStatusText(http.UNAUTHORIZED)});
        }
        const email = decoded.email;
        User.findOne({ email: email },(err, user) => {
            if (!user) return res.status(http.BAD_REQUEST).send({ status: 'Failure',msg: 'We were unable to find a user for this token.' });
            if (user.isVerified) return res.status(http.BAD_REQUEST).send({ status: 'Failure',type: 'already-verified', msg: 'This user has already been verified.' });
            // Verify and save the user
            user.VerifiedEmail = true
            user.save(function (err) {
                if (err) { return res.status(http.INTERNAL_SERVER_ERROR).send({ msg: http.getStatusText(http.INTERNAL_SERVER_ERROR) }); }
                res.status(http.OK).send({status:"Success",message:"The account has been verified. Please log in."});
            })
        })
    }
}

exports.resendToken = (req,res)=>{
    User.findOne({ email: req.body.email }, async (err, user) =>{
        if (!user) return res.status(http.BAD_REQUEST).json({ status : 'Failure', msg: 'We were unable to find a user with that email.' });
        if (user.VerifiedEmail) return res.status(http.BAD_REQUEST).json({ status : 'Failure', msg: 'This account has already been verified. Please log in.' });
 
        // Create a verification token, save it, and send email
        const token = jwt.sign({ email: req.body.email}, secretKey.token.key, { expiresIn: '24h' }) 
            if (err) { 
                return res.status(http.INTERNAL_SERVER_ERROR).json({ msg: http.getStatusText(http.INTERNAL_SERVER_ERROR) }); 
            }
            // Send the email
            host=req.get('host');
            let transporter = nodemailer.createTransport({ service: 'gmail',
                port: 587, 
                secure :false,
                auth:{ user: process.env.GMAIL_USER, pass: process.env.GMAIL_PASSWORD } });
            let mailOptions = {  
                from : 'no-reply@mentors.com',
                to: user.email, 
                subject: 'Account Verification Token', 
                text: 'Hello,\n\n' + 'Please verify your account by clicking the link: \nhttp:\/\/' + host + '\/mentors\/confirmation/?token=' + token + '.\n' };
            await transporter.sendMail(mailOptions, async (err)=> {
                if (err) {
                    return res.status(http.INTERNAL_SERVER_ERROR).json({ status : "Success",
                        msg: http.getStatusText(http.INTERNAL_SERVER_ERROR) }); 
                }
                else{
                    return res.status(http.OK).json({message:"Token Resend"})
                }
            })
        })
}