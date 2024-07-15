const dashboardRoutes = require("./dashboard.route.js")
const productRoutes = require("./product.route.js")
const categoryProductRoutes =require("./categoryproducts.route.js")


const systemConfig = require("../../config/system")

module.exports = (app) =>{
    const PATH_ADMIN = systemConfig.prefixAdmin
    app.use(PATH_ADMIN+"/dashboard", dashboardRoutes)
    app.use(PATH_ADMIN+"/products",productRoutes)
    app.use(PATH_ADMIN+"/category-products",categoryProductRoutes)

}