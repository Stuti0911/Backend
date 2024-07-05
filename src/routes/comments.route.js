import { Router } from "express";
import { addComment, deleteComment, getComments, updateComment } from "../controllers/comment.controller.js";
import { verifyJWT } from "../middlewares/authentication.middleware.js";

const router=Router();
router.use(verifyJWT)

router.route("/addComment/:videoId").post(addComment)

router.route("/updateComment/:commentId").patch(updateComment)

router.route("/deleteComment/:commentId").delete(deleteComment)

router.route("/getComments/:videoId").get(getComments)

export default router