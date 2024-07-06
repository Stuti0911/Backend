import { Router } from "express";
import { verifyJWT } from "../middlewares/authentication.middleware.js";
import { addVdoToPlaylist, createPlaylist, deletePlaylist, getPlaylistById, getUserPlaylist, removeVdoFromPlaylist, updatedPlaylistDetails } from "../controllers/playlist.controller.js";

const router=Router()

router.use(verifyJWT);

router.route("/createPlaylist").post(createPlaylist);
router.route("/addVdoToPlaylist/:playlistId/:videoId").patch(addVdoToPlaylist);
router.route("/removeVdo/:playlistId/:videoId").delete(removeVdoFromPlaylist);
router.route("/updateDetails/:playlistId").patch(updatedPlaylistDetails);
router.route("/getPlaylist/:playlistId").get(getPlaylistById);

router.route("/deletePlaylist/:playlistId").delete(deletePlaylist);
router.route("/getUserPlaylist").get(getUserPlaylist);

export default router