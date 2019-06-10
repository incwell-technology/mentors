const User = require('../models/user');
const httpStatus = require('http-status-codes');
const statusMsg = require('../config/statusMsg')

module.exports.setRole = async(req, res, next) => {
    if (req.body.userRole === "Mentor" | req.body.userRole === "Student") {
        try {
            const userData = await User.findOneAndUpdate({
                email: res.locals.email
            }, {
                user_role: req.body.userRole
            }, {
                new: true
            });

            return res.status(httpStatus.OK).json({
                success: statusMsg.success.msg,
                payload: {
                    data: userData
                }
            });
        } catch (error) {
            error.status = httpStatus.INTERNAL_SERVER_ERROR;
            next(error);
        }
    } else {
        error = Error("User Role must be specified.");
        error.status = httpStatus.BAD_REQUEST;
        next(error);
    }
}