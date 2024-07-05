import { Subscription } from "../models/subscriptions.model.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import ApiResponse from "../utils/ApiResponse.js"
import {ApiError} from "../utils/ApiError.js"
import { isValidObjectId } from "mongoose";
import mongoose from "mongoose";

const toggleSubscription= asyncHandler(async(req,res)=>{
    //subscriber:me req.user._id, channel:req.params 
    const {channelId}= req.params;

    if(!isValidObjectId(channelId)){
        throw new ApiError(400,"Channel Id is not valid!!")
    }
    const checkSubscription= await Subscription.findOne({
        channel:channelId,
        subscriber:req.user?._id
    })

    if(checkSubscription){
        await Subscription.deleteOne({
            channel:channelId,
            subscriber:req.user?._id
        })

        return res .status(200)
        .json(new ApiResponse(
            200,
            {},
            "Channel Unsubscribed!!"
        ))
    }

    const subscribed= await Subscription.create({
        channel:channelId,
        subscriber:req.user?._id
    })
    if(!subscribed){
        throw new ApiError(500,"Error ocurred while subscribing channel")
    }
    return res.status(200)
    .json(
        new ApiResponse(
            200,
            subscribed,
            "Channel successfully subscribed!!"
        )
    )
})

const viewSubscriptedChannel= asyncHandler(async(req,res)=>{
    //id from req.user?._id
   const channels= await Subscription.aggregate([
        {
            $match:{
                subscriber:req.user?._id
            }
        },
        {
            $lookup:{
                from:"users",
                foreignField:"_id",
                localField:"channel",
                as:"subscribedChannels"
            }
        },
        {
            $unwind:"$subscribedChannels"
        },
        {
            $facet:{
                subscribedChannels:[
                    {
                        $project:{
                            "subscribedChannels._id":1,
                            "subscribedChannels.userName":1,
                            "subscribedChannels.fullName":1
                        }
                    }
                ],
                totalCnt:[{
                    $count:"count"
                }]
            }
        }
   ])

    if(await channels.length==0){
        return res.status(200)
        .json(
            new ApiResponse(
                200,
                {},
                "You have not subscribed any channel"
            )
        )
    }

    return res.status(200)
    .json(
        new ApiResponse(
            200,
            channels,
            "List of Subscriped Channel Fetched Successfully!!"
        )
    )

})

const channelSubscriber = asyncHandler(async(req,res)=>{
    const {channelId}=req.params;

    const subscribers = await Subscription.aggregate([
        {
            $match:{
                channel:new mongoose.Types.ObjectId(channelId)  
            }
        },
        {
            $lookup:{
                from:"users",
                foreignField:"_id",
                localField:"subscriber",
                as:"subscribers"
            }
        },
        {
            $unwind: "$subscribers"
        },
        {
            $facet: {
                subscribers: [
                    {
                        $project: {
                            _id: 1,
                            "subscribers._id": 1,
                            "subscribers.username": 1,
                            "subscribers.fullName": 1,
                            "subscribers.avatar": 1

                        }
                    }
                ],
                totalCount:[ 
                    {
                        $count: "count"
                    }]
                
            }
        }
        
    ])
   
    if(subscribers.length ===0 ){
        return res.status(200)
        .json(
            new ApiResponse(
                200,
                {},
                "No subscribers currently"
            )
        )
    }
    return res.status(200)
    .json(
        new ApiResponse(
            200,
            subscribers,
            "subscribers id fetched successfully"
        )
    )
    
})

export{
    toggleSubscription,
    viewSubscriptedChannel,
    channelSubscriber
}