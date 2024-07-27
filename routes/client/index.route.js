const productRouter =require("./product.route")
const homeRouter = require("./home.route")
const searchRouter = require("./search.route")
const cartRouter = require("./cart.route")

const categoryMiddledware = require("../../middlewares/clients/category.middleware")
const cartsMiddledware = require("../../middlewares/clients/carts.middleware")

module.exports = (app) =>{
    app.use(categoryMiddledware.category)
    app.use(cartsMiddledware.cartId)
    app.use('/',  homeRouter)
    app.use("/products",productRouter)
    app.use("/search", searchRouter)
    app.use("/cart", cartRouter)
}