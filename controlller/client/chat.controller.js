const Chat = require("../../models/chat.model")
const User = require("../../models/users.model")
const chatSocket =require("../../socket/client/chat.socket")
module.exports.index = async(req,res) =>{
    //Socket

    chatSocket(res)
    //Socket
   
    const chats = await Chat.find({
        deleted: false
    })
    for(const chat of chats){
        const infoUser = await User.findOne({
            _id: chat.user_id
        }).select("fullName")

        chat.infoUser = infoUser
    }
    res.render("clients/pages/chat/index",{
        pageTitle:" Trang chat",
        chats: chats
    })
}