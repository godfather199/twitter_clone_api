import {Schema, model} from 'mongoose'



const {ObjectId} = Schema.Types


const hashtagSchema = new Schema(
  {
    hashWord: {
      type: String,
      required: true,
    },
    posts: [
      {
        type: ObjectId,
        ref: "post",
      },
    ],
  },
  {
    timestamps: true,
  }
);



export default model('hash', hashtagSchema)