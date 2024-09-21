const User = require("../../models/users.model")
const Store  = require("../../models/store.model")
module.exports.infoUser =  async (req,res,next) =>{
    if(req.cookies.tokenUser){
        const user = await  User.findOne({
            userToken: req.cookies.tokenUser
        }).select("-password")
        const store = await Store.findOne({
        })
        if(user){
            res.locals.user = user
        }
        if(store){
            res.locals.store= store
        }

    }
    next()
}