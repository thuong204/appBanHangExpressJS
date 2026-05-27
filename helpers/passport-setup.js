const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const FacebookStrategy = require('passport-facebook');
const User = require("../models/users.model");

function trimEnv(name) {
  return (process.env[name] || "").trim();
}

function getOAuthBaseUrl(req) {
  const fromEnv = process.env.BASE_URL?.trim().replace(/\/$/, "");
  if (fromEnv) return fromEnv;
  if (req) {
    const host = req.get("host");
    if (host) {
      const proto =
        req.get("x-forwarded-proto")?.split(",")[0]?.trim() || req.protocol;
      return `${proto}://${host}`;
    }
  }
  return process.env.NODE_ENV === "production"
    ? "https://thuongelectronics.vercel.app"
    : "http://localhost:3000";
}

function getGoogleCallbackURL(req) {
  return `${getOAuthBaseUrl(req)}/user/oauth2/redirect/google`;
}

module.exports.getGoogleCallbackURL = getGoogleCallbackURL;
module.exports.getOAuthBaseUrl = getOAuthBaseUrl;

module.exports.setupGoogleStrategy = () => {
  const callbackURL = getGoogleCallbackURL();
  console.log("Google OAuth callbackURL (default):", callbackURL);
  console.log(
    "→ Thêm URI này vào Google Console → Credentials → OAuth client",
    trimEnv("GOOGLE_CLIENT_ID").slice(0, 20) + "..."
  );

  passport.use(new GoogleStrategy({
    clientID: trimEnv("GOOGLE_CLIENT_ID"),
    clientSecret: trimEnv("GOOGLE_CLIENT_SECRET"),
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
        clientID: trimEnv("FACEBOOK_CLIENT_ID"),
        clientSecret: trimEnv("FACEBOOK_CLIENT_SECRET"),
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
