const uploadToCloudinary = require("../../helpers/uploadToCloudinary")
module.exports.upload = async (req, res, next) => {
    if(req.file){
        const result = await uploadToCloudinary.uploadToCloudinary(req.file.buffer);
        req.body[req.file.fieldname] = result
    }
    next();
}
module.exports.uploadImages = async (req, res, next) => {
    if(req.file){
        const result = await uploadToCloudinary.uploadToCloudinary(req.file.buffer);
        req.body[req.file.fieldname] = result
    }
    next();
}