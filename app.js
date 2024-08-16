import userRouter from './routes/user.route.js'
import postRouter from './routes/post.route.js'
import hashtagRouter from './routes/hashtag.route.js'
import express from 'express'
import {config} from 'dotenv'
import morgan from 'morgan'
import cors from 'cors'
import cookieParser from 'cookie-parser'
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import fs from 'fs';



// Initialize express
const app = express()
config()



// Saving logs
// const __filename = fileURLToPath(import.meta.url);

// const __dirname = dirname(__filename);

// const accessLogStream = fs.createWriteStream(join(__dirname, "access.log"), {
//   flags: 'a' 
// });


// Middleware
app.use(express.json({limit: '10mb', extended: true}))
app.use(express.urlencoded({ limit: "10mb", extended: true }));
app.use(morgan("dev"));
app.use(cookieParser())
app.use(cors({
    origin: 'http://localhost:5173',
    credentials: true
}))
 


// Route Middleware
app.use('/api/user', userRouter)
app.use('/api/post', postRouter)
app.use('/api/hashtag', hashtagRouter)


// Error Middleware
app.use((err, req, res, next) => {
    const errorStatus = err.status || 500
    const errorMessage = err.message || 'Something went wrong'

    res.status(errorStatus).json({
        success: false,
        status: errorStatus,
        message: errorMessage,
        stack: err.stack
    })
})



export default app