const mongoose = require("mongoose")
const storeSchema = new mongoose.Schema(
    {
        title: String,
        description: String,
        address: Array,
        tax_id: String,
        policy: Array,
        email: String,
        phone: String},
    {
        timestamps: true
    }
)

const Store = mongoose.model('Store',storeSchema,"store")
module.exports = Store