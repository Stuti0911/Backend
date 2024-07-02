import mongoose from 'mongoose';

const playlistSchema= new mongoose.Schema(
    {
        name:{
            type:String,
            required:true,
            lowecase:true
        },
        description:{
            type:String,
            lowecase:true
        },
        owner:{
            type:mongoose.Schema.Types.ObjectId,
            ref:"User"
        },
        videos:[
            {
                type:mongoose.Schema.Types.ObjectId,
                ref:"Video"
            }
        ]
    },{timeStamps:true}
)

export const 
Playlist= mongoose.model("Playlist",playlistSchema);
