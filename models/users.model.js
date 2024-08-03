const mongoose = require("mongoose")
const generate = require("../helpers/generate")
const userSchema = new mongoose.Schema(
    {
        fullName: String,
        email: String,
        password: String,
        userToken:{
            type:String,
            default: generate.generateRandomString(20)
        },
        status: {
            type: String,
            default: "active"
        },
        dateOfBirth: Date,
        phone:String,
        avatar:String,
        deleted: {type:Boolean, default:false},
    },
    {
        timestamps: true
    }
)

const User = mongoose.model('User',userSchema,"users")
module.exports = User