const mongoose = require("mongoose")
const slug= require("mongoose-slug-updater")
mongoose.plugin(slug)
const productSchema = new mongoose.Schema(
    {
        title: String,
        price:Number,
        quantity: Number,
        discountPercentage: Number,
        total: Number,
        position:Number,
        status:String,
        delete: {type:Boolean, default:false},
        thumbnail:String,
        deletedAt:Date,
        slug:{
            type:String,
            slug:"title",
            unique: true
        }
    },{
        timestamps: true
    }
)

const Product = mongoose.model('Product',productSchema,"products")
module.exports = Product