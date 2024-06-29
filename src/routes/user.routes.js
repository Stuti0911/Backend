import { Router } from "express";
import { deleteUser, logOutUser, loginUser, refreshAccessToken, registerUser } from "../controllers/registerUser.controllers.js";
import { upload} from "../middlewares/multer.middleware.js";
import { verifyJWT } from "../middlewares/authentication.middleware.js";

const router= Router();

router.route("/register").post(
    upload.fields([
        {
            name:"avatar",
            maxCount:1
        },
        {
            name:"coverImage",
            maxCount:1
        }
    ]),
    registerUser
)

router.route("/login").post(loginUser)

//secured route
router.route("/logout").post(verifyJWT,logOutUser)

router.route("/delete").post(verifyJWT, deleteUser)

router.route("/regenerateAccessToken").post(refreshAccessToken)
export default router