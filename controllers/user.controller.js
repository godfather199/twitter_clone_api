import errorHandler from '../middlewares/errorHandler.js';
import User from '../models/user.model.js'
import jwt from 'jsonwebtoken'
import {v2 as cloudinary} from 'cloudinary'



export const register_User = async (req, res, next) => {
    // console.log('Inside register_User')
    try {
        const {name, username, email} = req.body

        const user = await User.findOne({
            $or: [{name}, {username}, {email}]
        })

        if(user) {
          if (user.name === name) {
            return next(errorHandler(400, "Name already taken"));
          }

          if (user.username === username) {
            return next(errorHandler(400, "Username already taken"));
          }

          return next(errorHandler(400, "Email already taken"));
        }

        const newUser = await User.create({...req.body})

        const {password, ...userDetails} = newUser._doc

        res.status(201).json({
            msg: 'User registered successfully',
            userDetails
        })

    } catch (error) {
        next(error)
    }
}



export const login_User = async (req, res, next) => {
  try {
    const { userInfo, userPassword } = req.body;

    const user = await User.findOne({
      $or: [{ username: userInfo }, { email: userInfo }],
    }).select("+password");

    if (!user) {
      return next(errorHandler(401, "Invalid email/username"));
    }

    const check_Password = await user.verifyPassword(userPassword);

    if (!check_Password) {
      return next(errorHandler(401, "Invalid password"));
    }

    const token = jwt.sign(
      {
        id: user._id,
      },
      process.env.JWT_SECRET,
      {
        expiresIn: "2d",
      }
    );

    const { password, ...userDetails } = user._doc;

    res
      .status(201)
      .cookie("access_token_twitter", token, {
        httpOnly: true,
        expires: new Date(Date.now() + 1000 * 60 * 60 * 24 * 2),
        secure: true,
        sameSite: 'None'
      })
      .json({
        msg: "Login successfull",
        userDetails,
      });
  } catch (error) {
    next(error);
  }
}


  
export const logout_User = async (req, res, next) => {
  try {
    res
      .status(201)
      .cookie("access_token_twitter", "", {
        httpOnly: true,
      })
      .json({
        msg: "Logout successful",
      });
  } catch (error) {
    next(error);
  }
};



export const authenticate_User = async (req, res, next) => {
  try {
    res.status(201).json({
      success: true
    })
  } catch (error) {
    next(error)
  }
}



export const user_By_Id = async (req, res, next) => {
  try {
    const {userId} = req.params

    const user = await User.findById(userId)

    res.status(201).json({
      msg: 'User fetched by Id',
      user
    })
  } catch (error) {
    next(error)
  }
}



export const toggle_Follow_Users = async (req, res, next) => {
  try {
    const {id: logged_In_User_Id} = req.user
    const {userId: user_To_Follow_Id} = req.params

    const logged_In_User = await User.findById(logged_In_User_Id)
    const user_To_Follow = await User.findById(user_To_Follow_Id)
    let message

    if (logged_In_User.following.includes(user_To_Follow_Id)) {
      logged_In_User.following = logged_In_User.following.filter(
        (item) => item.toString() !== user_To_Follow_Id.toString()
      );

      user_To_Follow.followers = user_To_Follow.followers.filter(
        (item) => item.toString() !== logged_In_User_Id.toString()
      );

      await logged_In_User.save()
      await user_To_Follow.save()

      message = `Unfollowed ${user_To_Follow.name}`
    } else {
      logged_In_User.following.push(user_To_Follow_Id)
      user_To_Follow.followers.push(logged_In_User_Id)
      
      await logged_In_User.save()
      await user_To_Follow.save()

      message = `Followed ${user_To_Follow.name}`
    }

    res.status(201).json({
      msg: message,
      logged_In_User
    })

  } catch (error) {
    next(error)
  }
}



export const toggle_Bookmark_Post = async (req, res, next) => {
  try {
    const {id} = req.user
    const {postId} = req.params

    const user = await User.findById(id)

    let message

    if(user.bookmarks.includes(postId)) {
      user.bookmarks = user.bookmarks.filter(
        (item) => item.toString() !== postId.toString()
      );

      message = 'Post removed from Bookmarks'
    }
    else {
      user.bookmarks.push(postId)

      message = 'Post Bookmarked'
    }

    await user.save()

    res.status(201).json({
      msg: message,
      user
    })
    
  } catch (error) {
    next(error)
  }
}



export const suggested_Users = async (req, res, next) => {
  try {
    const { id } = req.user;

    const logged_In_User = await User.findById(id);
    const all_Users = await User.find({_id: {$ne: id}});

    const followingIds = new Set(
      logged_In_User.following.map((followId) => followId.toString())
    );
    // console.log('Following: ', followingIds)

    // const usersNotFollowed = all_Users.map((user) => {
    //   user.followers.filter(item => !followingIds.has(item))
    // })

    const usersNotFollowed = all_Users.filter(
      (user) => !followingIds.has(user._id.toString())
    );

    const suggested_Array = usersNotFollowed.slice(0, 3);

    res.status(201).json({
      msg: 'Suggested accounts',
      suggested_Array
    })
  } catch (error) {
    next(error)
  }
}



export const search_Users = async (req, res,  next) => {
  try {
    const {userQuery} = req.query

    let users 

    if(userQuery) {
      users = await User.find({
        $or: [
          {
            name: {
              $regex: userQuery,
              $options: 'i'
            }
          },
          {
            username: {
              $regex: userQuery,
              $options: 'i'
            }
          },
        ]
      })
    }

    res.status(201).json({
      msg: 'Search results',
      users
    })
  } catch (error) {
    next(error)
  }
}



export const edit_User_Profile = async () => {}



export const upload_User_Media = async (req, res, next) => {
  try {
    const {id} = req.user
    const {profile_Pic, cover_Pic} = req.body

    const logged_In_User = await User.findById(id)

    const cloudinary_Utility_Function = async (pic_Data, folder_String) => {
      const result = await cloudinary.uploader.upload(
        pic_Data,
        {
          folder: folder_String,
        }
      );

      return result
    };

    let message

    // Display picture
    if(profile_Pic) {
      if (logged_In_User.displayPicture.url) {
        const delete_Pic = await cloudinary.uploader.destroy(
          logged_In_User.displayPicture.public_Id
        );
      }

      const { public_id, secure_url} = await cloudinary_Utility_Function(
        profile_Pic,
        "Twitter/Twitter_User_Display_Picture"
      );

      logged_In_User.displayPicture = {
        public_Id: public_id,
        url: secure_url,
      };

      message = 'Profile Picture uploaded'
    }


    // Cover Photo
    if(cover_Pic) {
      if (logged_In_User.coverPicture.url) {
        const delete_Pic = await cloudinary.uploader.destroy(
          logged_In_User.coverPicture.public_Id
        );
      }

      const { public_id, secure_url} = await cloudinary_Utility_Function(
        cover_Pic,
        "Twitter/Twitter_User_Cover_Picture"
      );

      logged_In_User.coverPicture = {
        public_Id: public_id,
        url: secure_url,
      };
      
      message = 'Cover Picture uploaded'
    }

    
    await logged_In_User.save();


    res.status(201).json({
      msg: "Upload successfull",
      logged_In_User
    })


  } catch (error) {
    next(error)
  }
}

