const express = require("express")
const router = express.Router()
const controller = require("../../controlller/client/user.controller")
const validate = require("../../validates/admin/validate-user")
const validateLogin = require("../../validates/admin/validate-login")
const authMiddleware = require("../../middlewares/clients/auth.middleware")
const cartMiddleware = require("../../middlewares/clients/carts.middleware")
const passport = require('passport');
const passportHelper = require("../../helpers/passport-setup")
router.get('/register', controller.register)
router.post('/register',
    validate.validateRegister,
    controller.registerPost)
router.get('/login', controller.login)
router.post('/login',validateLogin.validateLogin, controller.loginPost)
router.get('/logout',controller.logout)

router.get('/password/forgot', controller.forgot)
router.post('/password/forgot', controller.forgotPost)
router.get('/password/otp', controller.otpPassword)
router.post('/password/otp', controller.otpPasswordPost)
router.get('/password/reset', controller.resetPassword)
router.post('/password/reset', validate.resetPassword, controller.resetPasswordPost)
router.get('/info',authMiddleware.requireAuth,controller.info)
router.get("/login/federated/google",passport.authenticate('google'))
router.get('/oauth2/redirect/google', passport.authenticate('google', {
    failureRedirect: '/login'
  }),controller.loginSuccessGoogle);
router.get('/login/federated/facebook', passport.authenticate('facebook'));

router.get('/oauth2/redirect/facebook', passport.authenticate('facebook', {
  failureRedirect: '/login',

}),controller.loginSuccessFacebook);

passportHelper.setupGoogleStrategy()
passportHelper.setupFacebookStrategy()


  
  

module.exports = router;