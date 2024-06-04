import {Schema, model} from 'mongoose'



const {ObjectId} = Schema.Types


const postSchema = new Schema({
  postedBy: {
    type: ObjectId,
    ref: 'user',
  },
  postImage: {
    public_Id: {
      type: String,
    },
    url: {
      type: String,
    },
  },
  postText: {
    type: String,
  },
  postHashTag: [
    {
      hashtag: {
        type: String,
      },
      hashtagId: {
        type: ObjectId,
        ref: "hash",
      },
    },
  ],
  comments: [
    {
      user: {
        type: ObjectId,
        ref: "user",
      },
      comment: {
        type: String,
        required: true,
      },
    },
  ],
  repost: [
    {
      type: ObjectId,
      ref: "user",
    },
  ],
  likes: [
    {
      type: ObjectId,
      ref: "user",
    },
  ],
  bookmark: [
    {
      type: ObjectId,
      ref: "user",
    },
  ],
},
{
    timestamps: true
});



export default model('post', postSchema)