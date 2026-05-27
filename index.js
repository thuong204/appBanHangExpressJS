const express = require('express')
var path = require('path');
require("dotenv").config()
process.env.TZ = process.env.TZ || "Asia/Ho_Chi_Minh"  

const passport= require("passport")


const session = require('express-session');
const MongoStore = require('connect-mongo')

const methodOverride=  require("method-override")
const multer = require('multer');

const route = require("./routes/client/index.route")
const routeAdmin = require("./routes/admin/index.route")

const systemConfig= require("./config/system.js")

const bodyParser = require("body-parser")

const flash = require("express-flash")
const moment = require("moment")
const formatDateVN = require("./helpers/formatDate")
const cookieParser =require("cookie-parser")

const database = require("./config/database.js")
const mongoose = require('mongoose')

const app = express()
const port = process.env.PORT

const http = require('http')
const { Server } = require("socket.io");
const User = require('./models/users.model.js');
const { configureSession, configurePassport } = require('./config/passportConfig.js');

app.use(methodOverride('_method'))
app.use('/tinymce', express.static(path.join(__dirname, 'node_modules', 'tinymce')));

// Kết nối database (async nhưng không block app)
database.connect()

app.set('views', `${__dirname}/views`)
app.set('view engine', 'pug')

//App local variable
app.locals.prefixAdmin =  systemConfig.prefixAdmin
app.locals.moment = moment
app.locals.formatDateVN = formatDateVN
app.locals.formatDateOnlyVN = formatDateVN.dateOnly
app.locals.formatTimeOnlyVN = formatDateVN.timeOnly

app.use(bodyParser.urlencoded({extended: false}))
app.use(express.json()); 

//flash
app.use(cookieParser("JHGJKLKLGFLJK"))

// Cấu hình session (chỉ 1 lần, trước routes)
app.use(session({
    secret: process.env.SESSION_SECRET || 'keyboard cat',  
    resave: false,
    saveUninitialized: false,
    cookie: { 
        maxAge: 14 * 24 * 60 * 60 * 1000, // 14 days
        secure: process.env.NODE_ENV === 'production', // HTTPS only in production
        httpOnly: true
    },
    store: MongoStore.create({
      mongoUrl: process.env.MONGO_URL,  
      collectionName: 'sessions',       
      ttl: 14 * 24 * 60 * 60,
      autoRemove: 'native'          
    })
}));

app.use(flash())

// Cấu hình session và Passport
configureSession(app);
configurePassport(app);

// Routes
route(app);
routeAdmin(app);
app.use(express.static(`${__dirname}/public`))

//Socket IO
const server = http.createServer(app)
const io = new Server(server)
global._io = io

// Health check endpoint
app.get('/health', (req, res) => {
    try {
        const mongoState = mongoose.connection.readyState;
        const mongoStatus = mongoState === 1 ? 'connected' : 
                           mongoState === 2 ? 'connecting' : 
                           mongoState === 3 ? 'disconnecting' : 'disconnected';
        
        res.status(200).json({ 
            status: 'ok', 
            timestamp: new Date().toISOString(),
            mongodb: mongoStatus,
            port: port
        });
    } catch (error) {
        res.status(500).json({ 
            status: 'error', 
            error: error.message 
        });
    }
});

// Error handling middleware
app.use((err, req, res, next) => {
    console.error('Error:', err);
    res.status(500).send('Internal Server Error');
});

// Start server
if (!port) {
    console.error('PORT environment variable is not set');
    process.exit(1);
}

server.listen(port, '0.0.0.0', () => {
    console.log(`Server listening on port ${port}`)
}).on('error', (err) => {
    console.error('Server error:', err);
    process.exit(1);
})