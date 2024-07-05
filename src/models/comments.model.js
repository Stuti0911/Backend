import mongoose from 'mongoose';
import aggregatePaginate from "mongoose-aggregate-paginate-v2"

const commentSchema= new mongoose.Schema(
    {
        owner:{
            type:mongoose.Schema.Types.ObjectId,
            ref:"User"
        },
        video:{
            type:mongoose.Schema.Types.ObjectId,
            ref:"Video"
        },
        content:{
            type:String,
            required:true,
            lowecase:true
        }
    },{timeStamps:true}
)

commentSchema.plugin(aggregatePaginate)

export const Comment= mongoose.model("Comment",commentSchema);
