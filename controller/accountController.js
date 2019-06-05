require('dotenv').config({
    path: '../config/.env'
});
const User = require('../models/user');
const httpStatus = require('http-status-codes');
const statusMsg = require('../config/statusMsg');
const bcrypt = require('bcrypt');
const { validationResult } = require('express-validator/check');

const errorJson = {
    "success": statusMsg.fail.msg,
    "payload": {},
    "error": {
        "code": httpStatus.UNPROCESSABLE_ENTITY
    }
}

exports.changePassword = async(req, res, next) => {
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
        errorJson.error.message = errors.array();
        return res.status(httpStatus.UNPROCESSABLE_ENTITY).json(errorJson);
    } else {
        try {
            const account = await User.findOne({
                email: res.locals.email
            });

            passwordMatch = account.password?
                await bcrypt.compare(req.body.current_password, account.password): //compare only if password already exists in the db
                true;

            if (passwordMatch) {
                const newPassword = await bcrypt.hash(req.body.new_password, Number(process.env.SALTING));
                account.password = newPassword;
                await account.save();
                return res.status(httpStatus.OK).json({
                    success: statusMsg.success.msg,
                    payload: {}
                });
            } else {
                errorJson.error.message = 'Incorrect password';
                return res.status(httpStatus.UNPROCESSABLE_ENTITY).json(errorJson);
            }
        } catch (error) {
            console.log(error);
            error.status = httpStatus.INTERNAL_SERVER_ERROR;
            next(error);
        }
    }
}