const mongoose = require("mongoose")
const generate = require("../helpers/generate")
const accountSchema = new mongoose.Schema(
    {
        fullName: String,
        email: String,
        password: String,
        token:{
            type:String,
            default: generate.generateRandomString(20)
        },
        status: String,
        dateOfBirth: Date,
        phone:String,
        avatar:String,
        role_id:String,
        deleted: {type:Boolean, default:false},
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
        }]
    },
    {
        timestamps: true
    }
)

const Account = mongoose.model('Account',accountSchema,"accounts")
module.exports = Account