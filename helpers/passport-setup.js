const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const FacebookStrategy = require('passport-facebook');
const User = require("../models/users.model"); // Đường dẫn đến model User của bạn

module.exports.setupGoogleStrategy = () => {
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
};

module.exports.setupFacebookStrategy = () =>{
    passport.use(new FacebookStrategy({
        clientID: process.env.FACEBOOK_CLIENT_ID,
        clientSecret: process.env.FACEBOOK_CLIENT_SECRET,
        callbackURL: '/user/oauth2/redirect/facebook',
        profileFields: ['id', 'displayName'] // Chọn các trường bạn muốn lấy
      },
      async (accessToken, refreshToken, profile, cb) => {
        try {
          let user = await User.findOne({ facebookId: profile.id });
    
          if (!user) {  
            // Nếu người dùng không tồn tại, tạo người dùng mới
            user = await new User({
              fullName: profile.displayName,
              facebookId: profile.id,
            }).save();
          }
          return cb(null, user);
        } catch (err) {
          return cb(err);
        }
      }
    ));
    
}
