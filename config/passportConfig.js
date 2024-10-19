// passportConfig.js
const session = require('express-session');
const MongoStore = require('connect-mongo');
const passport = require('passport');
const User = require('../models/users.model'); // Đảm bảo đường dẫn đến mô hình User đúng

// Cấu hình session
function configureSession(app) {
  app.use(session({
    secret: 'keyboard cat',
    resave: false,
    saveUninitialized: false,
    store: MongoStore.create({
      mongoUrl: process.env.MONGO_URL,
      collectionName: 'sessions',
      ttl: 14 * 24 * 60 * 60 // Thời gian sống của session (14 ngày)
    })
  }));
}

// Cấu hình Passport
function configurePassport(app) {
  app.use(passport.initialize());
  app.use(passport.session());

  passport.serializeUser(function(user, cb) {
    if (user && user.id) {
      cb(null, user.id);
    } else {
      cb(new Error('User object is invalid or missing id'));
    }
  });

  passport.deserializeUser(async function(id, cb) {
    try {
      const user = await User.findById(id);
      if (!user) {
        return cb(new Error('User not found'));
      }
      cb(null, user);
    } catch (err) {
      cb(err); // Xử lý lỗi
    }
  });
}

// Xuất các hàm cấu hình
module.exports = {
  configureSession,
  configurePassport
};
