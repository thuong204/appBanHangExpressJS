const mongoose = require("mongoose")

const orderSchema = new mongoose.Schema(
    {
        cart_id: String,
        userInfo:{
            fullName: String,
            phone: String,
            // Địa chỉ đầy đủ đã ghép sẵn (giữ để tương thích các đơn/trang cũ)
            address: String,
            addressDetail: String,
            ward: String,
            wardCode: Number,
            province: String,
            provinceCode: Number,
            location: {
                lat: Number,
                lng: Number,
            },
        },
        payments: String,
        status: String,
        payosOrderCode: Number,
        note: String,
        dateOrder:Date,
        products:[{
            product_id: String,
            quantity: Number,
            price: Number,
            discountPercentage: Number,
            color:String
        }]
    },{
        timestamps: true
    }
)
const Order = mongoose.model("Order",orderSchema,"orders")
module.exports =Order