import { asyncHandler} from "../utils/asyncHandler";
import {Comment} from "../models/comments.model"


//add a comment to a video
//update it
//delete it
//for a video get comments 

const addComment = asyncHandler(async(req,res)=>{

    const {owner,video,content}= req.body;
    
})


export {
    addComment
}