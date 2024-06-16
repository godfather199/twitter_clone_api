import { Router } from "express";
import {
  trending_Hashtags,
} from "../controllers/hashtag.controller.js";


const router = Router()


router.get('/trending', trending_Hashtags)


export default router