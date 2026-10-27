const mongoose = require("mongoose")
// Liên hệ từ form "Liên hệ" và email đăng ký nhận tin ở footer
const contactSchema = new mongoose.Schema(
    {
        type: { type: String, default: "contact" }, // contact | newsletter
        fullName: String,
        email: String,
        phone: String,
        subject: String,
        message: String,
        status: { type: String, default: "new" },
    },
    {
        timestamps: true
    }
)

const Contact = mongoose.model('Contact', contactSchema, "contacts")
module.exports = Contact
