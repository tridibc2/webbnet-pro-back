const mongoose = require('mongoose')
const jwt = require('jsonwebtoken')
// const request = require("request")
const cookie = require('cookie-parser')
/* Models */
const Auth = mongoose.model('Auth')

/* Const Library */
const logger = require('./../libs/loggerLib')
const responseLib = require('./../libs/responseLib')
const check = require('./../libs/checkLib')

let isAuthenticated = (req, res, next) => {
  console.log(`------------ inside isAuthenticated function-----------------`)
  // console.log(req.header('authToken'))

  if (req.params.authToken || req.query.authToken || req.body.authToken || req.header('authToken')) {
    Auth.findOne({authToken: req.header('authToken') || req.params.authToken || req.body.authToken || req.query.authToken}, (err, authDetails) => {
      if (err) {
        console.log(err)
        logger.error(err.message, 'Authentication Middleware', 10)
        let apiResponse = responseLib.generate(true, 'Failed To Authenticate', 500, null)
        res.send(apiResponse)
      } else if (check.isEmpty(authDetails)) {
        logger.error('No Authentication Key Is Present', 'Authentication Middleware', 10)
        let apiResponse = responseLib.generate(true, 'Invalid Or Expired Authentication Key', 404, null)
        res.send(apiResponse)
      } else {
        jwt.verify(authDetails.authToken, authDetails.tokenSecret, (err, decoded) => {
          if (err) {
            if (err.name === 'TokenExpiredError') {
              logger.error(err.message, 'Authorization Middleware', 10)
              let apiResponse = responseLib.generate(true, 'Token Is Expired. Login Again to Generate New Token', 500, null)
              res.send(apiResponse)
            } else if (err.name === 'JsonWebTokenError') {
              logger.error(err.message, 'Authorization Middleware', 500)
              let apiResponse = responseLib.generate(true, 'Invalid or Malformed Token. Regenerate Token')
              res.send(apiResponse)
            } else {
              logger.error(err.message, 'Authorization Middleware', 10)
              let apiResponse = responseLib.generate(true, 'Failed To Authenticate', 500, null)
              res.send(apiResponse)
            }
          } else if (check.isEmpty(decoded)) {
            let apiResponse = responseLib.generate(true, 'Failed To Authenticate', 500, null)
            res.send(apiResponse)
          } else {
            console.log('--------------------')
            console.log(decoded.data)

            req.user = {userId: decoded.data.userId}

            next()
          }
        })
      }
    })
  } else {
    logger.error('Authentication Token Missing', 'Authentication Middleware', 5)
    let apiResponse = responseLib.generate(true, 'Authentication Token Is Missing In Request', 400, null)
    res.send(apiResponse)
  }
}

module.exports = {
  isAuthenticated: isAuthenticated
}
