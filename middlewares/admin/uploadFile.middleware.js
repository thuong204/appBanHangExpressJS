const uploadToCloudinary = require("../../helpers/uploadToCloudinary")
module.exports.upload = async (req, res, next) => {
    console.log(req.file)
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
module.exports.uploadFields =async(req, res, next) =>{
    console.log(req["files"])
    for(const key in req["files"]){
        req.body[key] = []
        const array = req["files"][key]
        for(const item of array){
            try {
                const result  = await uploadToCloudinary.uploadToCloudinary(item.buffer)
                req.body[key].push(result)
            } catch (error) {
                console.log(error)
            }
        }
    }
    if(req.body.thumbnail) {
        if (req.body.thumbnail.length === 1) {
            req.body.thumbnail = req.body.thumbnail[0]; // Gán giá trị của phần tử đó trực tiếp
        } else {
            req.body.thumbnail = req.body.thumbnail.join(','); // Chuyển thành chuỗi cho nhiều phần tử
        }
    }
    next()
}