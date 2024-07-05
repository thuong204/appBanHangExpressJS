const mongoose = require('mongoose');

module.exports.connect = () =>{
    try {
        mongoose.connect('mongodb://127.0.0.1:27017/product-management')
        console.log("Connect Success")
        
    } catch (error) {
        console.log(error)
        
    }
}
