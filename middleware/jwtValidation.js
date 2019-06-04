const jwt = require('jsonwebtoken');
const httpStatus = require('http-status-codes');
const secret = require('../config/secretKey');

exports.verifyToken = (req, res, next) => {
    let token = req.headers['authorization'];
    if (token) {
        if (token.startsWith('Bearer')) {
            token = token.split(' ')[1];
        }
        jwt.verify(token, secret.token.key, (error, decoded) => {
            if (error) {
                error.status = httpStatus.UNAUTHORIZED;
                next(error);
            } else {
                res.locals.email = decoded.email;
                next();
            }
        });
    } else {
        error = Error("A valid bearer token must be sent in the header.");
        error.status = httpStatus.UNAUTHORIZED;
        next(error);
    }
}