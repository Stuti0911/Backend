import { asyncHandler} from "../utils/asyncHandler.js";
import {Comment} from "../models/comments.model.js"
import { isValidObjectId } from "mongoose";
import { ApiError } from "../utils/ApiError.js";
import ApiResponse from "../utils/ApiResponse.js";

const addComment = asyncHandler(async(req,res)=>{

    const {content} = req.body;
    const {videoId}= req.params;
    const ownerOfComment= req.user?._id;
    console.log(videoId);
    if(!isValidObjectId(videoId)){
        throw new ApiError(400,"Not a valid videoId");
    }
    if(!content || content.trim()===""){
        throw new ApiError(400,"Content is missing");
    }

    const commentCreated= await Comment.create({
        content,
        video:videoId,
        owner:ownerOfComment
    })

    return res.status(200)
    .json(
        new ApiResponse(
            200,
            commentCreated,
            "Comment is Successfully created"
        )
    )
    
})

const updateComment= asyncHandler(async(req,res)=>{
    //refernce to old comment and change it's content
    const {commentId}= req.params;
    const {content} = req.body;
   
    if(!isValidObjectId(commentId)){
        throw new ApiError(400,"Not a valid comment Id");
    }
    

    if(!content || content.trim()===""){
        throw new ApiError(400,"Updated Content is not provided!!")
    }

    const updatedComment= await Comment.findByIdAndUpdate(
        commentId,
        {
            $set:{
                content
            }
        },
        {
            new:true
        }
    )
    return res.status(200)
    .json(
        new ApiResponse(
            200,
            updatedComment,
            "Comment Succesfully Updated!!"
        )
    )
})

const deleteComment= asyncHandler(async(req,res)=>{
    const {commentId}= req.params;

    if(!isValidObjectId(commentId)){
        throw new ApiError(400,"Not a valid comment Id");
    }
    await Comment.deleteOne({
        _id:commentId
    })

    return res.status(200)
    .json(
        new ApiResponse(
            200,
            {},
            "Comment Successfully deleted"
        )
    )

})

const getComments= asyncHandler(async(req,res)=>{
    const {videoId}= req.params;
    console.log(videoId);

    try {
        const comments= await Comment.find({
            video:videoId
        }).select("-video") //array of objects

        console.log(comments);
        if(comments.length==0){
            return res.status(200).json(new ApiResponse(200,{},"Comment Section is empty!!"))
        }
        const options={
            limit:10,
            page:1
        }

        const result=await Comment.aggregatePaginate(comments,options)
        
        return res.status(200).json(new ApiResponse(200,result,"Comments fetched successfully!"))
       
    } catch (err) {
        console.log(err.message);
        return res.status(500).json(new ApiResponse(500,{},"Error while fetching comments"))
    }
})
export {
    addComment,
    updateComment,
    deleteComment,
    getComments
}