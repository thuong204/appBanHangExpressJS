const Chat = require("../../models/chat.model")
const User = require("../../models/users.model")
const chatSocket =require("../../socket/client/chat.socket")
const Store = require("../../models/store.model")
const Room = require("../../models/room.model")
module.exports.index = async(req,res) =>{
    //Socket

    chatSocket(res)
    //Socket
   
    // Tạo phòng chat
    const room = await Room.findOne({
        deleted: false,
        user_id: res.locals.user.id
    })
    if(!room){
        const room = new Room({
            user_id: res.locals.user.id,
            store_id: res.locals.store.id
        });
        room.save()
    }



    //End tạo phòng chat
    console.log(room.id)

    const chats = await Chat.find({
        deleted: false,
        room_id: room.id 
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