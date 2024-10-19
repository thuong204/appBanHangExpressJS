const express = require("express")
const router = express.Router()
const controller = require("../../controlller/client/user.controller")
const validate = require("../../validates/admin/validate-user")
const validateLogin = require("../../validates/admin/validate-login")
const authMiddleware = require("../../middlewares/clients/auth.middleware")
const cartMiddleware = require("../../middlewares/clients/carts.middleware")
const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const User = require("../../models/users.model")
const FederatedCredential = require("../../models/federatedCredential.model")
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
  
  passport.use(new GoogleStrategy({
    clientID: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    callbackURL: '/user/oauth2/redirect/google',
    scope: ['profile', 'email'],
  }, async (accessToken, refreshToken, profile, cb) => {
    try {
      let user = await User.findOne({ googleId: profile.id });
      if (!user) {
        // Tạo người dùng mới nếu không tìm thấy
        user = await User.create({
          googleId: profile.id,
          fullName: profile.displayName,
          email: profile.emails ? profile.emails[0].value : '',
          avatar: profile.photos ? profile.photos[0].value : ''
        });
      }

  
      if (!user.id) {
        return cb(new Error('User ID is missing'));
      }
  
      return cb(null, user); // Trả về người dùng
    } catch (err) {
      return cb(err); // Xử lý lỗi
    }
  }));
  
  

module.exports = router;