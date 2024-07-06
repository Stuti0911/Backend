import { Router } from "express";
import { verifyJWT } from "../middlewares/authentication.middleware.js";
import { createTweet, deleteTweet, getUserTweet, updateTweet } from "../controllers/tweets.controller.js";
const router=Router();

router.use(verifyJWT)

router.route("/createTweet").post(createTweet)
router.route("/deleteTweet/:tweetId").delete(deleteTweet)
router.route("/updateTweet/:tweetId").patch(updateTweet)
router.route("/getUserTweet").get(getUserTweet)

export default router