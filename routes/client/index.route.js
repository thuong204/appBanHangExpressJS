const productRouter =require("./product.route")
const homeRouter = require("./home.route")
const searchRouter = require("./search.route")
const cartRouter = require("./cart.route")
const userRouter = require("./user.route")
const chatRouter = require("./chat.route")

const categoryMiddledware = require("../../middlewares/clients/category.middleware")
const cartsMiddledware = require("../../middlewares/clients/carts.middleware")
const infoUserMiddleware  = require("../../middlewares/clients/user.middleware")
const authMiddleware = require("../../middlewares/clients/auth.middleware")

module.exports = (app) =>{
    app.use(categoryMiddledware.category)
    app.use(cartsMiddledware.cartId)
    app.use(infoUserMiddleware.infoUser)
    app.use('/',  homeRouter)
    app.use("/products",productRouter)
    app.use("/search", searchRouter)
    app.use("/cart", cartRouter)
    app.use("/user", userRouter)
    app.use("/chat",authMiddleware.requireAuth, chatRouter)
}