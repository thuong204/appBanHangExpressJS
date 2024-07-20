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
        description: String,
        content: String,
        position:Number,
        categoryProduct:{
            type: String,
            default:""
        },
        status:String,
        delete: {type:Boolean, default:false},
        thumbnail:String,
        deletedAt:Date,
        slug:{
            type:String,
            slug:"title",
            unique: true,
            index: true
        }
    },
    {
        timestamps: true
    }
)

const Product = mongoose.model('Product',productSchema,"products")
module.exports = Product