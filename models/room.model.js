const mongoose= require("mongoose")
const roomSchema = new mongoose.Schema({
    user_id: String,
    store_id: String,
    last_message_at: Date,
    deleted:{
        type:Boolean,
        default: false
    }
},{
    timestamps: true
})

const Room = mongoose.model("Room",roomSchema,"room")
module.exports = Room
