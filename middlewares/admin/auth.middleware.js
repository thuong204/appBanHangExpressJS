const Account = require("../../models/accounts.model")
const Role = require("../../models/roles.model")
const systemConfig = require("../../config/system")
module.exports.requireAuth = async (req, res, next) => {
    if (!req.cookies.token) {
        res.redirect(`${systemConfig.prefixAdmin}/auth/login`)
    }
    else {
        const user = await Account.findOne({ token: req.cookies.token }).select("-password")
        if (!user) {
            res.redirect(`${systemConfig.prefixAdmin}/auth/login`)
        }
        else {
            const role = await Role.findOne({_id: user.role_id}).select("title permissions")
            res.locals.role = role
            res.locals.user = user
            next()
        }
    }
}