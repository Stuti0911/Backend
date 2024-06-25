import {asyncHandler} from "../utils/asyncHandler.js"
import { ApiError } from "../utils/ApiError.js";
import {User} from "../models/user.model.js"
import { uploadOnCloudinary } from "../utils/cloudinary.js";
import ApiResponse from "../utils/ApiResponse.js";

const registerUser = asyncHandler(async(req,res)=>{
    //userschema object lekar details fill
    //validation - not empty
    //check if it already exist( username,email)
    //check for images, avatar(important)
    //upload them to cloudinary-- avatar
    //user object create- create entry in db
    //remove pass and refresh token field from response
    //check for user creation
    //return response

    const {userName,email,fullName,password}=req.body
    
    console.log(req.body);

    if (userName.trim()=== "") {
        throw new ApiError(400,"Please enter a username");
    } 
    if (email.trim()=== "") {
        throw new ApiError(400,"Please enter a email");
    } 
    if (fullName.trim()=== "") {
        throw new ApiError(400,"Please enter a fullName");
    } 
    if (password.trim()==="") {
        throw new ApiError(400,"Please enter a password");
    } 
    
    // if(
    //     [fullName,userName,password,email].some((field)=>field?.trim()==="")
    // ){
    //     throw new ApiError(400,"Field missing")
    // }


    // const existedUser= User.findOne({
    //     $or:[{ userName },{ email }]
    // })
    // if(existedUser){
    //     console.log(existedUser);
    //     throw new ApiError(409,"User already registed!!")
    // }

    const avatarLocalPath=(req.files?.avatar[0]?.path);
    if(!avatarLocalPath){
        throw new ApiError(400,"Avatar file is required")
    }
    const avatarUploaded= await uploadOnCloudinary(avatarLocalPath)
    if(!avatarUploaded){
        throw new ApiError(500,"Uploading on Cloudinary failed")
    }

    const coverImageLocalPath= req.files?.coverImage[0]?.path
    const coverImageUploaded= await uploadOnCloudinary(coverImageLocalPath)

    const user= await User.create({
        fullName,
        userName,
        password,
        email,
        avatar : avatarUploaded.url,
        coverImage: coverImageUploaded?.url || ""
    })

    const id= await User.findById(user._id).select(
        "-password -refreshToken"
    )
    if(!id){
        throw new ApiError(500,"Our Mistakee")
    }

    return res.status(201).json(
        new ApiResponse(200,id,"User registered Sucessfully")
    )
})

export {registerUser}