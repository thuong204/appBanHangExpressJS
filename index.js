const express = require('express')
var path = require('path');
require("dotenv").config()  

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
const cookieParser =require("cookie-parser")

const database = require("./config/database.js")

const app = express()
const port = process.env.PORT

const http = require('http')
const { Server } = require("socket.io");
const User = require('./models/users.model.js');
const { configureSession, configurePassport } = require('./config/passportConfig.js');

app.use(methodOverride('_method'))
app.use('/tinymce', express.static(path.join(__dirname, 'node_modules', 'tinymce')));

database.connect()


app.set('views', `${__dirname}/views`)
app.set('view engine', 'pug')

//Socket IO
const server = http.createServer(app)
const io = new Server(server)
global._io = io



//App local variable
app.locals.prefixAdmin =  systemConfig.prefixAdmin
app.locals.moment = moment

app.use(bodyParser.urlencoded({extended: false}))


app.use(bodyParser.urlencoded({extended: false}))


app.use(express.json()); 

//flash
app.use(cookieParser("JHGJKLKLGFLJK"))
app.use(session({cookie: {maxAge: 60000}}))
app.use(flash())
//end flash

route(app);
routeAdmin(app);
app.use(express.static(`${__dirname}/public`))


app.use(session({
    secret: 'keyboard cat',  
    resave: false,
    saveUninitialized: false,
    store: MongoStore.create({
      mongoUrl: process.env.MONGO_URL,  
      collectionName: 'sessions',       
      ttl: 14 * 24 * 60 * 60           
    })
  }));

// Cấu hình session và Passport
configureSession(app);
configurePassport(app);
server.listen(port, () => {
    console.log(`Example app listening on port ${port}`)
})