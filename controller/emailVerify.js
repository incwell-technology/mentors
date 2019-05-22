const nodemailer = require('nodemailer')
const path = require('path');
var EmailTemplate = require('email-templates');
exports.verifyEmail = async (email, host, token) => {
    let transporter = nodemailer.createTransport({
        service: process.env.GMAIL_SERVICE,
        port: process.env.PORT,
        secure: false,
        auth: { user: process.env.GMAIL_USER, pass: process.env.GMAIL_PASSWORD }
    });
    const emails = new EmailTemplate({
        send: true,
        message: {
            from: process.env.GMAIL_USER
        },
        transport: transporter,
        preview: false
    });
    emails.send({
        template: path.join(__dirname, '..', 'email', 'mentors'),
        message: {
            to: email
        },
        locals: {
            host: host,
            token: token
        }
    })
}
