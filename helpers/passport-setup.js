const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const FacebookStrategy = require('passport-facebook');
const User = require("../models/users.model");

function getOAuthBaseUrl() {
  const fromEnv = process.env.BASE_URL?.trim().replace(/\/$/, "");
  if (fromEnv) return fromEnv;
  return process.env.NODE_ENV === "production"
    ? "https://thuongelectronics.vercel.app"
    : "http://localhost:3000";
}

module.exports.setupGoogleStrategy = () => {
  const baseURL = getOAuthBaseUrl();
  const callbackURL = `${baseURL}/user/oauth2/redirect/google`;
  console.log("Google OAuth callbackURL:", callbackURL);

  passport.use(new GoogleStrategy({
    clientID: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    callbackURL: callbackURL,
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

module.exports.setupFacebookStrategy = () => {
    const baseURL = getOAuthBaseUrl();
    const callbackURL = `${baseURL}/user/oauth2/redirect/facebook`;
    console.log("Facebook OAuth callbackURL:", callbackURL);

    passport.use(new FacebookStrategy({
        clientID: process.env.FACEBOOK_CLIENT_ID,
        clientSecret: process.env.FACEBOOK_CLIENT_SECRET,
        callbackURL: callbackURL,
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
