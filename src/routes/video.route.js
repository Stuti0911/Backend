import { Router } from "express";
import{publishVideo,getVideoById,updateVideo,updateThumbnail,deleteVideo} from "../controllers/video.controller.js"
import { upload} from "../middlewares/multer.middleware.js";
import { verifyJWT } from "../middlewares/authentication.middleware.js";
const router= Router();
router.use(verifyJWT); //apply in everything

router.route("/publishVideo").post(
    upload.fields([
        {
            name:"videoFile",
            maxCount:1
        },
        {
            name:"thumbnail",
            maxCount:1
        }
    ]),publishVideo
)

router.route("/getInfoById/:videoId").get(getVideoById)

router.route("/updateVideo/:videoId").patch(updateVideo)

router.route("/updateThumbnail/:videoId").patch(
    upload.single("thumbnail"),
    updateThumbnail
)

router.route("/deleteVideo/:videoId").post(deleteVideo)
export default router