import {Router} from 'express'
import {
  bookmarked_Posts,
  comment_On_Post,
  create_Post,
  edit_Post,
  extract_Hashtag_Function,
  fetch_Post_All_Comments,
  fetch_Users_Post,
  logged_In_User_Posts,
  timeline_Post,
  toggle_Like_Post,
  toggle_Repost,
  trending_Hashtags_Posts,
} from "../controllers/post.controller.js";
import {verify_Token} from '../middlewares/verifyToken.js'

const router = Router()


router.post('/create-post', verify_Token, create_Post)
router.put('/edit-post', edit_Post)
router.get('/timeline', verify_Token, timeline_Post)
router.get('/user-posts/:userId', verify_Token, fetch_Users_Post)
router.post('/add-comment/:postId', verify_Token, comment_On_Post)
router.get('/comments/:postId', fetch_Post_All_Comments)
router.post('/repost/:postId', verify_Token, toggle_Repost)
router.post('/like/:postId', verify_Token, toggle_Like_Post)
router.get('/user-posts', logged_In_User_Posts)              
router.get('/bookmark', verify_Token, bookmarked_Posts)
router.get('/trending-posts/:hashtagId', trending_Hashtags_Posts)



export default router