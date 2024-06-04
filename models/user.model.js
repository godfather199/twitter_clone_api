import {Schema, model} from 'mongoose'
import bcrypt from 'bcrypt'



const {ObjectId} = Schema.Types


const userSchema = new Schema({
    name: {
        type: String,
        required: true
    },
    username: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true
    },
    password: {
        type: String,
        required: true,
        select: false
    },
    displayPicture: {
        public_Id: {
            type: String
        },
        url: {
            type: String
        },
    },
    coverPicture: {
        public_Id: {
            type: String
        },
        url: {
            type: String
        },
    },
    posts: [
        {
            type: ObjectId,
            ref: 'post'
        }
    ],
    bookmarks: [
        {
            type: ObjectId,
            ref: 'post'
        }
    ],
    reposted: [
        {
            type: ObjectId,
            ref: 'post'
        }
    ],
    followers: [
        {
            type: ObjectId,
            ref: 'user'
        }
    ],
    following: [
        {
            type: ObjectId,
            ref: 'user'
        }
    ],
    
},
{
    timestamps: true
})



// Hashing & saving password
userSchema.pre('save', async function(next) {
    if(this.isModified('password')) {
        const salt = await bcrypt.genSalt(10)
        this.password = await bcrypt.hash(this.password, salt)
    }

    next()
})



// Verify Password
userSchema.methods.verifyPassword = async function(userPassword) {
    return  await bcrypt.compare(userPassword, this.password)
}




export default model('user', userSchema)