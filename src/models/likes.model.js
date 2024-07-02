import mongoose from 'mongoose';

const likeschema= new mongoose.Schema(
    {
        comment:{
            type:mongoose.Schema.Types.ObjectId,
            ref:"Comment"
        },
        video:{
            type:mongoose.Schema.Types.ObjectId,
            ref:"Video"
        },
        likedBy:{
            type:mongoose.Schema.Types.ObjectId,
            ref:"User"
        },
        tweet:{
            type:mongoose.Schema.Types.ObjectId,
            ref:"Tweet"
        }
    },{timeStamps:true}
)

export const Likes= mongoose.model("Likes",likeschema);
