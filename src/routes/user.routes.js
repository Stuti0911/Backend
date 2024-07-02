import { Router } from "express";
import { changePassword, deleteUser, getCurrentUser, getUserChannelProfile, getWatchHistory, logOutUser, loginUser, refreshAccessToken, registerUser, updateAvatar, updateCoverImage, updateFullName, updateUserName } from "../controllers/registerUser.controllers.js";
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

router.route("/change-Password").post(verifyJWT,changePassword)

router.route("/current-user").get(verifyJWT,getCurrentUser)

router.route("/update-fullName").patch(verifyJWT,updateFullName)

router.route("/update-userName").patch(verifyJWT,updateUserName)

router.route("/update-coverImage").patch(
    verifyJWT,upload.single('coverImage'),updateCoverImage
)

router.route("/update-avatar").patch(
    verifyJWT,upload.single('avatar'),updateAvatar
)

router.route("/getChannelDetails/:userName").get(verifyJWT,getUserChannelProfile)

router.route("/watchHistory").get(verifyJWT,getWatchHistory)
export default router