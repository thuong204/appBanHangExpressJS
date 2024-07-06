const express = require('express')
require("dotenv").config()

const route = require("./routes/client/index.route")
const routeAdmin = require("./routes/admin/index.route")

const systemConfig= require("./config/system.js")

const database = require("./config/database.js")

const app = express()
const port = process.env.PORT

database.connect()


app.set('views', './views')
app.set('view engine', 'pug')

//App local variable
app.locals.prefixAdmin =  systemConfig.prefixAdmin


route(app);
routeAdmin(app);
app.use(express.static('public'))


app.listen(port, () => {
    console.log(`Example app listening on port ${port}`)
})