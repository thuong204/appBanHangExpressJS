const Chat = require("../../models/chat.model")
const User = require("../../models/users.model")
module.exports.index = async(req,res) =>{
    const userId=  res.locals.user.id
    const fullName= res.locals.user.fullName
    _io.once('connection', (socket) => {
        console.log("a user connected", socket.id)
        socket.on('CLIENT_SEND_MESSAGE', async(data)  =>{
            const chat = new Chat({
                user_id: userId,
                content: data
            }); 
            await chat.save()
            //Trả vể tin nhắn cho A B C
            _io.emit('SERVER_RETURN_MESSAGE',{
                userId: userId,
                fullName: fullName,
                content: data
            })
        })


    });
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