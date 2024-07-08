const express = require('express')
require("dotenv").config()

const methodOverride=  require("method-override")

const route = require("./routes/client/index.route")
const routeAdmin = require("./routes/admin/index.route")

const systemConfig= require("./config/system.js")

const bodyParser = require("body-parser")

const database = require("./config/database.js")

const app = express()
const port = process.env.PORT

app.use(methodOverride('_method'))

database.connect()


app.set('views', './views')
app.set('view engine', 'pug')

//App local variable
app.locals.prefixAdmin =  systemConfig.prefixAdmin

app.use(bodyParser.urlencoded({extended: false}))


route(app);
routeAdmin(app);
app.use(express.static('public'))


app.listen(port, () => {
    console.log(`Example app listening on port ${port}`)
})