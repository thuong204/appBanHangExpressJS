const User = require("../../models/users.model")
module.exports.requireAuth = async (req, res, next) => {
    if (!req.cookies.tokenUser) {
        res.redirect(`/user/login`)
    }
    else {
        const user = await User.findOne({ userToken: req.cookies.tokenUser })
        if (!user) {
            res.redirect(`/user/login`)
        }
        next()
    }
}