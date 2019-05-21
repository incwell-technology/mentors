var exports =module.exports={}

const nodemailer = require('nodemailer')
const User = require('../models/user')

exports.verifyEmail = async (email,host,token)=>{ 
    let transporter = nodemailer.createTransport({ service: process.env.GMAIL_SERVICE,
        port: process.env.PORT, 
        secure :false,
        auth:{ user: process.env.GMAIL_USER, pass: process.env.GMAIL_PASSWORD } });
    let mailOptions = {  
        from : 'no-reply@mentors.com',
        to: email, 
        subject: 'Account Verification Token', 
        text: 'Hello,\n\n' + 'Please verify your account by clicking the link: \nhttp:\/\/' + host + '\/mentors\/confirmation/?token=' + token + '.\n' };
    await transporter.sendMail(mailOptions,(err)=> {
        if (err) {
            return console.log(err) 
        }
    });
}
