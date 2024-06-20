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


//err,req,res,next
export {app}