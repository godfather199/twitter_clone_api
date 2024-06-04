import {Router} from 'express'
import {
  comment_On_Post,
  create_Post,
  edit_Post,
  fetch_Post_All_Comments,
  fetch_Users_Post,
  logged_In_User_Posts,
  timeline_Post,
  toggle_Bookmark,
  toggle_Like_Post,
  toggle_Repost,
//   trending_Page_Posts,
} from "../controllers/post.controller.js";
import {verify_Token} from '../middlewares/verifyToken.js'

const router = Router()


router.post('/create-post', verify_Token, create_Post)
router.put('/edit-post', edit_Post)
router.get('/timeline', verify_Token, timeline_Post)
router.get('/user-posts/:userId', fetch_Users_Post)
router.post('/add-comment/:postId', verify_Token, comment_On_Post)
router.get('/comments/:postId', fetch_Post_All_Comments)
router.post('/repost/:userId', toggle_Repost)
router.post('/like/:userId', toggle_Like_Post)
router.post('/bookmark/:userId', toggle_Bookmark)
router.get('/user-posts', logged_In_User_Posts)              
// router.get('/trending', trending_Page_Posts)



export default router