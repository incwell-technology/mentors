const statusMsg = require('../config/statusMsg')
const http = require('http-status-codes')

exports.errorHandler = (err, req, res, next) => {
  if (err.status == http.UNAUTHORIZED) {
    return res.status(http.UNAUTHORIZED).json({
      success: statusMsg.fail.msg,
      payload: {},
      error: {
        code: http.UNAUTHORIZED,
        message: http.getStatusText(http.UNAUTHORIZED)
      }
    })
  }
  else if (err.status == http.CONFLICT) {
    return res.status(http.CONFLICT).json({
      success: statusMsg.fail.msg,
      payload: {},
      error: {
        code: http.CONFLICT,
        message: http.getStatusText(http.CONFLICT)
      }
    })
  }
  else if (err.status == http.BAD_REQUEST) {
    return res.status(http.BAD_REQUEST).json({
      success: statusMsg.fail.msg,
      payload: {},
      error: {
        code: http.BAD_REQUEST,
        message: http.getStatusText(http.BAD_REQUEST)
      }
    })
  }
  else if (err.status == http.FORBIDDEN) {
    return res.status(http.FORBIDDEN).json({
      success: statusMsg.fail.msg,
      payload: {},
      error: {
        code: http.FORBIDDEN,
        message: statusMsg.error.msg
      }
    })
  }
  else {
    return res.status(http.INTERNAL_SERVER_ERROR).json({
      success: statusMsg.fail.msg,
      payload: '',
      error: {
        code: http.INTERNAL_SERVER_ERROR,
        message: statusMsg.error.msg
      }
    })
  }
}