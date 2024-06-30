import Post from '../models/post.model.js'
import User from '../models/user.model.js'
import Hashtag from '../models/hashtag.model.js'
import {v2 as cloudinary} from 'cloudinary'
import { hashtag_Picker } from '../utils/hashtagPicker.js'


export const extract_Hashtag_Function = async (post_String, postId) => {
  try {
    const hashtag_Array = hashtag_Picker(post_String);

    if (!hashtag_Array) {
      return 
    }

    
    const processHashtags = async () => {
      let word_Hashtag_Combo = []

      for (const item of hashtag_Array) {
        const previous_Hashstag = await Hashtag.findOne({ hashWord: item });

        if (previous_Hashstag) {
          previous_Hashstag.posts.push(postId);
          await previous_Hashstag.save();

          word_Hashtag_Combo.push({
            hashtag: item,
            hashtagId: previous_Hashstag._id,
          });
        } else {
          const new_Hashtag = await Hashtag.create({
            hashWord: item,
            posts: [postId],
          });

          word_Hashtag_Combo.push({
            hashtag: item,
            hashtagId: new_Hashtag._id,
          });
        }
      }

      return word_Hashtag_Combo
    };

    return await processHashtags()


    // const processHashtags = async () => {
    // let word_Hashtag_Combo = [];

    //   const promises = hashtag_Array.map(async (item) => {
    //     const previous_Hashtag = await Hashtag.findOne({ hashWord: item });

    //     if (previous_Hashtag) {
    //       previous_Hashtag.posts.push(postId);
    //       await previous_Hashtag.save();

    //       word_Hashtag_Combo.push({
    //         hashtag: item,
    //         hashtagId: previous_Hashtag._id,
    //       });
    //     } else {
    //       const new_Hashtag = await Hashtag.create({
    //         hashWord: item,
    //         posts: [postId],
    //       });

    //       word_Hashtag_Combo.push({
    //         hashtag: item,
    //         hashtagId: new_Hashtag._id,
    //       });
    //     }
    //   });

    //   await Promise.all(promises); // Wait for all promises to resolve
    //   return word_Hashtag_Combo
    // };

    // console.log("Word combo: ", word_Hashtag_Combo);
    // return await processHashtags();


    //  return processHashtags().then(() => {
    //   return word_Hashtag_Combo
    //  });


  } catch (error) {
    console.log(error);
  }
};



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

        // Hashtag functionality
         
        extract_Hashtag_Function(postString, new_Post._id).then(
          async (result) => {
            if(result) {
              // console.log('Inside result')
              new_Post.postHashTag = [...new_Post.postHashTag, ...result]
              await new_Post.save()
            }
    
            const user = await User.findById(userId)
            
            user.posts.push(new_Post._id)
            await user.save()
    
            new_Post = {
              ...new_Post._doc,
              postedBy: user
            }
    
            res.status(201).json({
                msg: 'Post created successfully',
                new_Post
            })
          }
        );
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
      path: "posts",
      populate: [
        { path: "postedBy" },
        {
          path: "comments",
          populate: {
            path: "user",
          },
        },
      ],
      options: {
        sort: {
          createdAt: -1,
        },
      },
    });

    const user_Reposted_Posts = await Post.find({
      repost: {
        $in: userId
      }
    }).populate('postedBy')

    
    let {posts, ...details} = user_posts
    posts = [...user_Reposted_Posts, ...posts ]

    res.status(201).json({
      msg: "User Post's fetched",
      posts,
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

    // const populatedPost = await post.populate('comments.user').execPopulate()
    await post.populate({
      path: 'comments',
      populate: { 
        path: 'user'
      }
    })


    res.status(201).json({
      msg: 'Comment posted',
      post
      // post: populatedPost
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



export const toggle_Repost = async (req, res, next) => {
  try {
    const {id: logged_In_User_Id} = req.user
    const {postId} = req.params

    const logged_In_User = await User.findById(logged_In_User_Id)
    const post = await Post.findById(postId)

    let message

    if(post.repost.includes(logged_In_User_Id)) {
      post.repost = post.repost.filter(
        (item) => item.toString() !== logged_In_User_Id.toString()
      );

      logged_In_User.reposted = logged_In_User.reposted.filter(
        (item) => item.toString() !== postId.toString()
      );

      message = "Post Unreposted";
    }
    else {
      post.repost.push(logged_In_User_Id)

      logged_In_User.reposted.push(postId)

      message = 'Post Reposted'
    }

    await post.save()
    await logged_In_User.save()

    res.status(201).json({
      msg: message,
      post,
    })

  } catch (error) {
    next(error)
  }
}




export const toggle_Like_Post = async (req, res, next) => {
  try {
    const {id: logged_In_User} = req.user
    const {postId} = req.params

    const post = await Post.findById(postId)
    let post_Msg

    if (post.likes.includes(logged_In_User)) {
      post.likes = post.likes.filter(
        (item) => item.toString() !== logged_In_User.toString()
      );

      post_Msg = "Post Unliked";
    } else {
      post.likes.push(logged_In_User);

      post_Msg = "Post Liked";
    }

    await post.save()

    res.status(201).json({
      msg: post_Msg,
      post
    })

  } catch (error) {
    next(error)
  }
}



export const bookmarked_Posts = async (req, res, next) => {
  try {
    const {id} = req.user

    const posts = await User.findById(id).populate({
      path: 'bookmarks',
      populate: {
        path: 'postedBy'
      }
    })

    const {bookmarks, ...others} = posts
    // console.log('Posts: ', posts)


    res.status(201).json({
      msg: 'User bookmarked posts fetched',
      bookmarks
      // posts
    })
  } catch (error) {
    next(error)
  }
}




export const logged_In_User_Posts = async () => {
    // Include resposts as well
}




export const trending_Hashtags_Posts = async (req, res, next) => {
  try {
    const {hashtagId} = req.params

    const hashtag_Posts = await Hashtag.findById(hashtagId).populate({
      path: "posts",
      populate: [
        { path: "postedBy" },
        {
          path: "comments",
          populate: {
            path: "user",
          },
        },
      ],
    });

    const {posts, ...details} = hashtag_Posts._doc
    

    res.status(201).json({
      msg: 'Hashtags posts fetched',
      posts
    })

  } catch (error) {
    next(error)
  }
}