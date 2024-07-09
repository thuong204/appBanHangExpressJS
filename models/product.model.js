const mongoose = require("mongoose")
const productSchema = new mongoose.Schema(
    {
        title: String,
        price:Number,
        quantity: Number,
        discountPercentage: Number,
        total: Number,
        position:Number,
        status:String,
        delete:Boolean,
        thumbnail:String,
        deletedAt:Date
    }
)

const Product = mongoose.model('Product',productSchema,"products")
module.exports = Product