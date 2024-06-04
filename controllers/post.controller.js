import Post from '../models/post.model.js'
import User from '../models/user.model.js'
import {v2 as cloudinary} from 'cloudinary'


export const create_Post = async (req, res, next) => {
    try {
        const {id: userId} = req.user
        const {postString, postPic} = req.body

        let new_Post 

        if (postPic) {
          const { public_id, secure_url } = await cloudinary.uploader.upload(
            postPic,
            {
              folder: "Twitter/Twitter_Post_Image",
            }
          );

          new_Post = await Post.create({
            ...req.body,
            postedBy: userId,
            postText: postString,
            postImage: {
              public_Id: public_id,
              url: secure_url,
            },
          })
        } else {
          new_Post = await Post.create({
            ...req.body,
            postedBy: userId,
            postText: postString,
          });
        }

        
        const user = await User.findById(userId)
        
        user.posts.push(new_Post._id)
        await user.save()

        new_Post = {
          ...new_Post,
          postedBy: user
        }

        res.status(201).json({
            msg: 'Post created successfully',
            new_Post
        })
    } catch (error) {
        next(error)
    }
}



export const edit_Post = async () => {}



export const timeline_Post = async (req, res, next) => {
    try {
        const {id} = req.user

        const user = await User.findById(id)

        let posts = []

        if(user.following.length === 0) {
          posts = await Post.aggregate([
            {$sample: {size: 5}}
          ])

          await Post.populate(posts, {path: 'postedBy'})
        }
        else {
          posts = await Post.find({
            postedBy: {
              $in: user.following,
            },
          })
            .populate("postedBy")
            .populate({
              path: "comments",
              populate: {
                path: "user",
              },
            });
        }


        res.status(201).json({
          msg: 'Timeline posts',
          posts
        })

    } catch (error) {
        next(error)
    }
}



export const fetch_Users_Post = async (req, res, next) => {
  try {
    const {userId} = req.params

    const user_posts = await User.findById(userId).populate({
      path: 'posts',
      populate: {
        path: 'postedBy'
      },
      options: {
        sort: {
          createdAt: -1
        }
      }
    })

    const {posts, ...details} = user_posts

    res.status(201).json({
      msg: "User Post's fetched",
      posts
    })
  } catch (error) {
    next(error)
  }
}



export const comment_On_Post = async (req, res, next) => {
  try {
    const {id} = req.user
    const {postId} = req.params
    const {comment_Text} = req.body

    const post = await Post.findById(postId)

    post.comments.push({
      user: id,
      comment: comment_Text
    })    

    await post.save()

    res.status(201).json({
      msg: 'Comment posted',
      post
    })
  } catch (error) {
    next(error)
  }
}



export const fetch_Post_All_Comments = async (req, res, next) => {
  try {
    const {postId} = req.params

    const post = await Post.findById(postId).populate({
      path: 'comments',
      populate: {
        path: 'user'
      }
    })

    const {comments, ...postDetails} = post

    res.status(201).json({
      msg: 'Fetched all comments',
      comments
    })
  } catch (error) {
    next(error)
  }
}



export const toggle_Repost = async () => {}



export const toggle_Like_Post = async () => {}



export const toggle_Bookmark = async () => {}



export const logged_In_User_Posts = async () => {
    // Include resposts as well
}



// export const trending_Page_Posts = async () = {}




