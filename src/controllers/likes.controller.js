import { Likes } from "../models/likes.model.js"
import ApiResponse from "../utils/ApiResponse.js"
import {asyncHandler} from "../utils/asyncHandler.js"


const toggleVideoLike= asyncHandler(async(req,res)=>{
    const {videoId} = req.params

    const like= await Likes.findOne({
        video:videoId,
        likedBy: req.user?._id
    })

    if(like){
        await like.deleteOne();
        return res.status(200)
        .json(
            new ApiResponse(
                200,
                {},
                "Video Unliked"
            )
        )
    }

    const likedVdo= await Likes.create({
        video:videoId,
        likedBy:req.user?._id
    })
   
    return res.status(200)
        .json(
            new ApiResponse(
                200,
                likedVdo,
                "Video Liked"
            )
        )   
})
const toggleTweetLike= asyncHandler(async(req,res)=>{
    const {tweetId} = req.params

    const like= await Likes.findOne({
        tweet:tweetId,
        likedBy: req.user?._id
    })

    if(like){
        await like.deleteOne();
        return res.status(200)
        .json(
            new ApiResponse(
                200,
                {},
                "Tweet Unliked"
            )
        )
    }

    const likedTweet= await Likes.create({
        tweet:tweetId,
        likedBy:req.user?._id
    })
   
    return res.status(200)
        .json(
            new ApiResponse(
                200,
                likedTweet,
                "Tweet Liked"
            )
        )   
     
})
const toggleCommentLike= asyncHandler(async(req,res)=>{
    const {commentId} = req.params

    const like= await Likes.findOne({
        comment:commentId,
        likedBy: req.user?._id
    })

    if(like){
        await like.deleteOne();
        return res.status(200)
        .json(
            new ApiResponse(
                200,
                {},
                "Comment Unliked"
            )
        )
    }

    const likedComment= await Likes.create({
        comment:commentId,
        likedBy:req.user?._id
    })
   
    return res.status(200)
        .json(
            new ApiResponse(
                200,
                likedComment,
                "Commment Liked"
            )
        )   
     
     
})
const getLikedVideo= asyncHandler(async(req,res)=>{
     
    const videos=await Likes.aggregate([
        {
            $match:{
                likedBy:req.user?._id,
                video:{
                    $exists:true,
                    $ne:null
                }
            }
        },
        {
            $lookup:{
                from:"videos",
                localField:"video",
                foreignField:"_id",
                as:"likedVideos" //array of objects
            }
        },
        {
            $project:{
                likedVideos:{
                    thumbnail:1,
                    owner:1,
                    title:1,
                    description:1,
                    views:1,
                    duration:1
                }
            }
        }
    ]) 
    console.log(videos);
    const likedVideosArray = videos.map(videoItem => videoItem.likedVideos[0]);  //map return type is array
    return  res.status(200)
    .json(
        new ApiResponse(
            200,
            likedVideosArray,
            "Liked Videos Fetched Successfully!!"
        )
    )
})

export {
    toggleCommentLike,
    toggleVideoLike,
    toggleTweetLike,
    getLikedVideo
}