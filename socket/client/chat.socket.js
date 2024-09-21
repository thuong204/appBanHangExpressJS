const Chat = require("../../models/chat.model")
const Room = require("../../models/room.model")
const uploadToCloudinary = require("../../helpers/uploadToCloudinary")
module.exports = async (res) => {
    const userId=  res.locals.user.id
    const fullName= res.locals.user.fullName
    _io.once('connection', (socket) => {
        socket.on('CLIENT_SEND_MESSAGE', async (data) => {
            let images = []
            for (const imageBuffer of data.images) {
                const link = await uploadToCloudinary.uploadToCloudinary(imageBuffer)
                images.push(link)


            }
            const room = await Room.findOne({
                deleted: false,
                store_id: res.locals.store.id,
                user_id: res.locals.user.id
            })
            const chat = new Chat({
                sender: userId,
                room_id: room.id,
                content: data.content,
                images: images
            });
            await chat.save()
            //Trả vể tin nhắn cho A B C
            _io.emit('SERVER_RETURN_MESSAGE', {
                sender: userId,
                room_id: room.id,
                content: data.content,
                images: images
            })
        })
        // socket.on("CLIENT_SEND_TYPING", (type) => {
        //     socket.broadcast.emit('SERVER_RETURN_TYPING', {
        //         userId: userId,
        //         fullName: fullName,
        //         type: type
        //     })
        // })


    });
}