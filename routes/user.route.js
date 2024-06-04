import {Router} from 'express'
import { edit_User_Profile, login_User, logout_User, register_User, search_Users, suggested_Users, toggle_Follow_Users, user_By_Id } from '../controllers/user.controller.js'
import { verify_Token } from '../middlewares/verifyToken.js'



const router = Router()


router.post('/register', register_User)
router.post('/login', login_User)
router.post('/logout', logout_User)
router.get('/search', search_Users)
router.get('/suggested-accounts', verify_Token, suggested_Users)
router.get('/:userId', user_By_Id)
router.post('/toggle-follow/:userId', verify_Token, toggle_Follow_Users)
router.put('/edit-user', edit_User_Profile)


export default router