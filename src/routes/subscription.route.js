import { Router } from "express";
import {channelSubscriber, toggleSubscription,viewSubscriptedChannel} from "../controllers/subscription.controller.js"
import {verifyJWT} from "../middlewares/authentication.middleware.js"

const router= Router()
router.use(verifyJWT);

router.route("/toggleSubscription/:channelId").post(toggleSubscription)
router.route("/viewSubscriptedChannel").get(viewSubscriptedChannel)

router.route("/channelSubscriber/:channelId").get(channelSubscriber)

export default router