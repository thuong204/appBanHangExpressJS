const mongoose = require('mongoose');
const mongodb = process.env.MONGO_URL

module.exports.connect = () =>{
    try {
        mongoose.connect(`${mongodb}`)
        console.log("Connect Success")
        
    } catch (error) {
        console.log(error)
        
    }
}
