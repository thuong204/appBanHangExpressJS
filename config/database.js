const mongoose = require('mongoose');
const mongodb = process.env.MONGO_URL

module.exports.connect = async () =>{
    try {
        await mongoose.connect(`${mongodb}`, {
            serverSelectionTimeoutMS: 5000, // Timeout after 5s instead of 30s
            socketTimeoutMS: 45000, // Close sockets after 45s of inactivity
        })
        console.log("MongoDB Connect Success")
        
        mongoose.connection.on('error', (err) => {
            console.error('MongoDB connection error:', err);
        });
        
        mongoose.connection.on('disconnected', () => {
            console.log('MongoDB disconnected');
        });
        
    } catch (error) {
        console.error("MongoDB connection error:", error)
        // Không throw error để app vẫn có thể chạy (nhưng sẽ có vấn đề với database)
    }
}
