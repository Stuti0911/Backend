import mongoose from "mongoose";
import mongooseAggregatePaginate from "mongoose-aggregate-paginate-v2"

const videoSchema= new mongoose.Schema(
  {
    videoFile:{
      type:String,//Url
      required:true
    },
    thumbnail:{
      type:String, //url
      required:true
    },
    owner:{
      type:mongoose.Schema.Types.ObjectId,
      ref:"User"
    },
    title:{
      type:String,
      required:true,
      lowecase:true
    },
    description:{
      type:String,
      required:true,
      lowecase:true
    },
    duration:{
      type:Number,  //url
      required:true
    },
    views:{
      type:Number,
      default:0
    },
    isPublished:{
      type:Boolean,
      default:true
    }
  },{timeStamps:true}
)

videoSchema.plugin(mongooseAggregatePaginate)


export const Video= mongoose.Model("Video",videoSchema)