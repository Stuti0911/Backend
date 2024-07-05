import express from "express"
import cors from "cors"
import cookieParser from "cookie-parser"


//origin: scheme Protocol+ domain name+port
const app= express()

app.use(cors({
    origin: process.env.Cors_origin,
    credentials: true
}))

app.use(express.json({limit:"16kb"}))
app.use(express.urlencoded({extended:true, limit:"16kb"}))
app.use(express.static("public"))
app.use(cookieParser())


//routes import
import userRouter from "./routes/user.routes.js"
import videoRouter from "./routes/video.route.js"
import commentsRouter from "./routes/comments.route.js"
import likesRouter from "./routes/likes.route.js"
import playlistsRouter from "./routes/playlist.route.js"
// import tweetRouter from "./routes/tweets.route.js"
import subscriptionRouter from "./routes/subscription.route.js"

//routes decleration
app.use("/api/v1/users",userRouter)
app.use("/api/v1/video",videoRouter)
app.use("/api/v1/comments",commentsRouter)
app.use("/api/v1/likes",likesRouter)
app.use("/api/v1/playlists",playlistsRouter)
// app.use("/api/v1/tweets",tweetRouter)
app.use("/api/v1/subscription",subscriptionRouter)

//err,req,res,next

export {app}