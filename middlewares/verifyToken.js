import errorHandler from "./errorHandler.js"
import jwt from 'jsonwebtoken'


export const verify_Token = async (req, res, next) => {
    const token = req.cookies.access_token_twitter
    if(!token) {
        return next(errorHandler(401, "You're not authenticated"))
    }
    
    jwt.verify(token, process.env.JWT_SECRET, (err, data) => {
        if(err) {
          return next(errorHandler(401, "You're not authorized"));
        }

        req.user = data

        next()
    })
}