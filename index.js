import mongoConnect from "./config/db.js";
import app from './app.js'
import { v2 as cloudinary } from "cloudinary";


// Database connection
mongoConnect()



// Cloudinary Configuration
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});



// Start server
const PORT = process.env.PORT || 5000
app.listen(PORT, () => {
    console.log(`Server started on port: ${PORT}`)
})






