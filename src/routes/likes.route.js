import { Router } from "express";
import { verifyJWT } from "../middlewares/authentication.middleware.js";
import { getLikedVideo, toggleCommentLike, toggleTweetLike, toggleVideoLike } from "../controllers/likes.controller.js";

const router=Router()

router.use(verifyJWT)

router.route("/videoLike/:videoId").post(toggleVideoLike)
router.route("/commentLike/:commentId").post(toggleCommentLike)
router.route("/tweetLike/:tweetId").post(toggleTweetLike)

router.route("/likedVideos").get(getLikedVideo)

export default router