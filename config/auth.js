const jwt = require('jsonwebtoken');
const config = { secret: "yesbankcampaign2019" };
const user11 = require('../models/organiser');
// colors
const FgRed = "\x1b[31m%s\x1b[0m";

module.exports = {
    encoded(user){
        // console.log("user line 9 encode...");
        // console.log("saaaaaaaaaaaasasasaas = "+user);
        return jwt.sign(
            {
            exp : (Math.floor(Date.now() / 1000) + (86400 * 31)),
            user,
             },
             config.secret,
        )
    },

    decoded(userjwt){
        // console.log('decode line number 21 ');
        return jwt.verify(userjwt, config.secret, (error, res)=>{
            if(error){
                return { error }
            }
            return res
        })
    },

    async platform_autheticate(req, res, next){
        try{
            var auth_token = req.get("Authorization");
            console.log("___________________"+auth_token);
            if (!auth_token) return next({ errors: [{ message: "Authorization token required." }] });
            const userJwt = auth_token.slice("Bearer ".length)
            const userFromHeader = await module.exports.decoded(userJwt)
            var { error } = userFromHeader
            if (error) return next({ errors: [{ message: error.toString() }] });
            // var query = `Select * from ` + users_collection + ` where email="` + userFromHeader.user.email + `"`;
            // var users = await services.query(query);
            var emails = await user11.findOne({ email : userFromHeader.user.email})
            var user = emails.length != 0 ? emails[0] : null;
            if (!user) return next({ errors: [{ message: "User not found." }] });
            delete user.password;
            req.user = user;
            return next();
        }catch(err){
            console.log(FgRed, " platform_autheticate() | "+ err.toString());
            return next({ errors: [{ message: err.toString() }] })
        }
    }
}