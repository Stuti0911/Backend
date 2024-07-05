import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { delFromCloudinary, uploadOnCloudinary } from "../utils/cloudinary.js";
import {Video} from "../models/video.model.js"
import ApiResponse from "../utils/ApiResponse.js";
import { isValidObjectId } from "mongoose";
/**
 const getAllVideos = asyncHandler(async (req, res) => {
    const { page = 1, limit = 10, query, sortBy, sortType, userId } = req.query
    //TODO: get all videos based on query, sort, pagination
})
 */

const publishVideo = asyncHandler(async (req, res) => {
    const { title, description} = req.body
    if(!title || !description || title.trim()==="" || description.trim()===""){
        new ApiError(400, "Feilds are missing!!")
    }
    
    const thumbnailLocalFilePath= req.files?.thumbnail[0].path;
    const videoFileLocalFilePath= req.files?.videoFile[0].path;
    
    if(!thumbnailLocalFilePath){
        throw new ApiError(400,"Thumbnail missing");
    }
    if(!videoFileLocalFilePath){
        throw new ApiError(400,"Video File missing");
    }
    
    const thumbnail=  await  uploadOnCloudinary(thumbnailLocalFilePath);
    const videoFile=  await uploadOnCloudinary(videoFileLocalFilePath);
    console.log(videoFile);

    if(!thumbnail){
        throw new ApiError(500,"Error while uploading thumbnail on cloudinary")
    }
    if(!videoFile){
        throw new ApiError(500,"Error while uploading videoFile on cloudinary")
    }

    const video= await Video.create({
        videoFile: videoFile?.url,
        thumbnail: thumbnail?.url,
        owner: req.user?._id,
        title,
        description,
        duration: videoFile.duration
    })

    res.status(200)
    .json(
        new ApiResponse(
            200,
            video,
            "Video File Sucessfully uploaded"
        )
    )
    
})

const getVideoById = asyncHandler(async (req, res) => {
   
    const { videoId } = req.params

    if(!isValidObjectId(videoId)){
        throw new ApiError(404,"Not a valid Id")
    }
    const video= await Video.findById(videoId)

    if(!video){
        throw new ApiError(404,"Video does not exist")
    }

    return res.status(200)
    .json(
        new ApiResponse(
            200,
            video,
            "Video successfully received from id"
        )
    )
})

const updateVideo= asyncHandler(async(req,res)=>{
    const {videoId}= req.params;
    const {title,description}= req.body;

    if(!isValidObjectId(videoId)){
        throw new ApiError(400,"VideoId is not valid");
    }

    if(!title && !description ){
        throw new ApiError(400,"Give some fields to update")
    }
    if(title.trim()==="" && description.trim()===""){
        throw new ApiError(400,"Empty fields are not allowed")
    }

    const video= await Video.findByIdAndUpdate(
        videoId,
        {
            $set:{
                title,
                description
            }
        }
    )

    return res.status(200)
    .json(
        new ApiResponse(
            200,
            video,
            "Updation done successfully"
        )
    )
})

const updateThumbnail= asyncHandler(async(req,res)=>{
    const {videoId}=req.params;
    const newThumbanilLocalPath= req.file?.path;

    if(!isValidObjectId(videoId)){
        throw new ApiError(400,"Not a valid Video")
    }

    if(!newThumbanilLocalPath){
        throw new ApiError(400,"Thumbnail not provided!!")
    }

    const newThumbnail= await uploadOnCloudinary(newThumbanilLocalPath);

    if(!newThumbnail){
        throw new ApiError(500,"Error while uploading on cloudinary")
    }

    const videoToBeDel= await Video.findById(videoId)
    delFromCloudinary(videoToBeDel.thumbnail)

    const video= await Video.findByIdAndUpdate(
        videoId,
        {
            $set:{
                thumbnail:(newThumbnail.url)
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
            video,
            "Thumbnail Updated Successfully"
        )
    )
})


const deleteVideo = asyncHandler(async (req, res) => {
    const { videoId } = req.params

    if(!isValidObjectId(videoId)){
        throw new ApiError(400,"Not a valid Video")
    }
    // del image and vdo from cloud
   //// console.log(videoId);
    const videoToBeDel= await Video.findById(videoId);
   // console.log(videoToBeDel);
    const urlThumbnail=videoToBeDel.thumbnail
    const urlvideoFile=videoToBeDel.videoFile
    if(delFromCloudinary(urlThumbnail)){
        console.log("Thumbnail deleted from cloudinary");
    }
    if(delFromCloudinary(urlvideoFile)){
        console.log("VideoFile deleted from cloudinary");
    }
    await Video.deleteOne({
        _id:videoId
    })

    return res.status(200)
    .json(
        new ApiResponse(
            200,
            {},
            "Video deleted"
        )
    )
})

const togglePublishStatus = asyncHandler(async (req, res) => {
    const { videoId } = req.params
    if(!isValidObjectId(videoId)){
        throw new ApiError(400,"Not a valid Video")
    }
    const video = await Video.findById(videoId);

    if (!video) {
        throw new ApiError(400, "Video not found")
    }
    // Toggle the isPublish field
    video.isPublished = !video.isPublished;

    // Save the updated video
    await video.save();

    return res.status(200)
        .json(new ApiResponse(200, video, "isPublished toggle Successfully"))
})
export{
    publishVideo,
    getVideoById,
    updateVideo,
    updateThumbnail,
    deleteVideo,
    togglePublishStatus
}