const mongoose = require("mongoose")

const orderSchema = new mongoose.Schema(
    {
        cart_id: String,
        userInfo:{
            fullName: String,
            phone: String,
            address: String,
        },
        payments: String,
        status: String,
        note: String,
        dateOrder:Date,
        products:[{
            product_id: String,
            quantity: Number,
            price: Number,
            discountPercentage: Number,
            color:String
        }]
    },{
        timestamps: true
    }
)
const Order = mongoose.model("Order",orderSchema,"orders")
module.exports =Order