const mongoose = require("mongoose")
const slug= require("mongoose-slug-updater")
mongoose.plugin(slug)
const categoryProductSchema = new mongoose.Schema(
    {
        title: String,
        parent_id:{
            type: String,
            default:"",
        },
        total: Number,
        description: String,
        position:Number,
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
        updatedBy:{
            account_id: String,
            updatedAt: Date
        },
        slug:{
            type:String,
            slug:"title",
            unique: true,
            index: true
        }
    },{
        timestamps: true
    }
)

const CategoryProduct = mongoose.model('CategoryProduct',categoryProductSchema,"category-products")
module.exports = CategoryProduct