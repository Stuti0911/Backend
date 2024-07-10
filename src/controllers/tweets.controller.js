import mongoose, { isValidObjectId } from "mongoose";
import { Tweet } from "../models/tweets.model.js";
import { ApiError } from "../utils/ApiError.js";
import ApiResponse from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";


const createTweet = asyncHandler(async(req,res)=>{
    const {content} = req.body;

    if(!content || content.trim()===""){
        throw new ApiError(400,"No content for tweet");
    }

    const createdTweet= await Tweet.create({
        owner:req.user?._id,
        content
    })

    if(!createdTweet){
        throw new ApiError(500,"Error while creating Tweet")
    }

    return res.status(200)
    .json(
        new ApiResponse(200,createdTweet,"Tweet Successfully created!!")
    )
})

const deleteTweet= asyncHandler(async(req,res)=>{
    const {tweetId}= req.params;

    if(!isValidObjectId(tweetId)){
        throw new ApiError(400,"Not a valid tweet ID")
    }

    try {
        await Tweet.deleteOne({
            _id: new mongoose.Types.ObjectId(tweetId)
        })

        return res.status(200)
        .json(
            new ApiResponse(200,{},"Tweet deleted Succesfully!")
        )
    } catch (error) {
        console.log("ERROR!! while deleting tweet",error);
    }
})

const updateTweet= asyncHandler(async(req,res)=>{
    const {content}= req.body;
    const {tweetId}= req.params;

    if(!content || content?.trim()===""){
        throw new ApiError(400,"No content for updating tweet")
    }

    const tweetExistOrNot = await Tweet.findById({
        _id: new mongoose.Types.ObjectId(tweetId)
    })

    if(!tweetExistOrNot){
        throw new ApiError(400,"Tweet does not exist");
    }

    const updatedTweet= await Tweet.findByIdAndUpdate(
        {
            _id: new mongoose.Types.ObjectId(tweetId)
        },
        {
            content
        },
        {
            new:true
        }
    )

    if(!updatedTweet){
        throw new ApiError(500,"Error while updating tweet")
    }

    return res.status(200)
    .json(
        new ApiResponse(200,updatedTweet,"Tweet Successfully updated!!")
    )
})

const getUserTweet= asyncHandler(async(req,res)=>{
    const user= req.user?._id;

    const userTweet =await Tweet.find({
        owner:user
    })

    if(!userTweet){
        throw new ApiError(400,"User has no tweet")
    }

    const tweet= await Tweet.aggregate([
        {
            $match:{
                owner:user
            }
        },
        {
            $lookup:{
                from:"users",
                localField:"owner",
                foreignField:"_id",
                as:"createdBy"
            }
        },
        {
            $project:{
                _id:1,
                content:1,
                "createdBy.userName":1,
                "createdBy.fullName":1,
                "createdBy.avatar":1,
            }
        },
        {
            $addFields:{
                createdBy:{
                    $arrayElemAt:["$createdBy",0]
                }
            }
        }
    ])

    if(!tweet){
        throw new ApiError(500,"Error while fetching user tweets")
    }

    return res.status(200)
    .json(
        new ApiResponse(
            200,
            tweet,
            "User tweet fetched Successfully!!"
        )
    )
})
export{
    createTweet,
    deleteTweet,
    updateTweet,
    getUserTweet
}