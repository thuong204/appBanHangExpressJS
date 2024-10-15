const mongoose = require("mongoose")
const slug= require("mongoose-slug-updater")
mongoose.plugin(slug)
const productSchema = new mongoose.Schema(
    {
        title: String,
        price:Number,
        totalQuantity: Number,
        discountPercentage: Number,
        total: Number,
        description: String,
        listImage: [{
            type: String
        }],
        featured: String,
        content: String,
        position:Number,
        categoryProduct:{
            type: String,
            default:""
        },
        screen: String,
        screenType:String,
        storage: String,
        status:String,
        delete: {type:Boolean, default:false},
        thumbnail:String,
        createdBy:{
            account_id: String,
            createdAt: {
                type: Date,
                default: Date.now

            }
        },
        deletedBy:{
            account_id: String,
            deletedAt: Date
        },
        updatedBy:[{
            account_id: String,
            updatedAt: Date
        }],
        variations: [{
            color: {
                type: String,
                required: true
            },
            quantity: {
                type: Number,
                required: true
            }
        }],
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