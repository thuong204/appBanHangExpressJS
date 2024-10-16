
const cloudinary = require("cloudinary").v2
const streamifier = require("streamifier")



cloudinary.config({ 
    cloud_name: process.env.CLOUD_NAME,
    api_key: process.env.CLOUD_KEY,
    api_secret: process.env.CLOUD_SECRET // Click 'View Credentials' below to copy your API secret
});

let streamUpload = (buffer) => {
    return new Promise((resolve, reject) => {
        let stream = cloudinary.uploader.upload_stream(
            { resource_type: 'auto' },
            (error, result) => {
                if (result) {
                    resolve(result);
                } else {
                    reject(error);
                }
            }
        );

        streamifier.createReadStream(buffer).pipe(stream);
    });
};

// Main upload function
module.exports.uploadToCloudinary = async (buffer) => {
    let result = await streamUpload(buffer);
    return result.url; // Return the URL of the uploaded image
};