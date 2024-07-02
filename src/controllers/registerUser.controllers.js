import {asyncHandler} from "../utils/asyncHandler.js"
import { ApiError } from "../utils/ApiError.js";
import {User} from "../models/user.model.js"
import { uploadOnCloudinary } from "../utils/cloudinary.js";
import ApiResponse from "../utils/ApiResponse.js";
import cookieParser from "cookie-parser";
import jwt from "jsonwebtoken"
import { json, response } from "express";
import { v2 as cloudinary } from 'cloudinary';
import mongoose from "mongoose";

const generateAccessAndRefreshToken = async (userid)=>
{
    try {
        const user=await User.findById(userid)
        const accessToken=user.generateAccessToken();
        const refreshToken= user.generateRefreshToken();

        user.refreshToken= refreshToken
        await user.save({validateBeforeSave: false})
        return {accessToken,refreshToken}

    } catch (error) {
        throw new ApiError(500,"Something went wrong while generating refresh and access token")
    }
}

const delFromCloudinary= async(url)=>{
    const public_id=url.split("/").pop().split(".")[0];
    console.log(public_id);

    cloudinary.api.delete_resources([public_id], 
    { type: 'upload', resource_type: 'image' })
  .then(()=>console.log("Previous stored image successfully deleted"))
  .catch(()=>console.log("Error occured while deleting"))
}
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
    
    //console.log(req.body);

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
    
    if(password.length<8){
        throw new ApiError(400,"Password is less than 8 character");
    }
    // if(
    //     [fullName,userName,password,email].some((field)=>field?.trim()==="")
    // ){
    //     throw new ApiError(400,"Field missing")
    // }

    //console.log(req.files);

    const existedUser= await User.findOne({
        $or:[{ userName },{ email }]
    })
    if(existedUser){
        console.log(existedUser);
        throw new ApiError(409,"User already registed!!")
    }

    const avatarLocalPath=(req.files?.avatar[0]?.path);
   // console.log(req.files);
    if(!avatarLocalPath){
        throw new ApiError(400,"Avatar file is required")
    }
    const avatarUploaded= await uploadOnCloudinary(avatarLocalPath)
    if(!avatarUploaded){
        throw new ApiError(500,"Uploading on Cloudinary failed")
    }

    // const coverImageLocalPath= req.files?.coverImage[0]?.path
    let coverImageLocalPath;
    let coverImageUploaded;
    if(req.files && Array.isArray(req.files.coverImage) && req.files.coverImage.length >0){
        coverImageLocalPath=req.files.coverImage[0].path
    }
    if(coverImageLocalPath){
        coverImageUploaded= await uploadOnCloudinary(coverImageLocalPath)
    }
    // coverImageUploaded= await uploadOnCloudinary(coverImageLocalPath) 
    // if their is no cover image path cloudinary don't give error it will just return an empty string 
    
    
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

const loginUser= asyncHandler(async(req,res)=>{
    //email or username..password from user
    //check if any field is not empty
    //make db call to check email and password
    //if same return successfully logged in 
    //access and refresh token send to user
    //send cookie
    //else raise issue

    const {userName, email, password}=req.body
    console.log(req.body);
    console.log(email);
    if(!userName && !email){
        throw new ApiError(400,"Enter Username or email")
    }

    const user= await User.findOne({
        $or: [{userName}, {email}]
    })
    if(!user){
        throw new ApiError(404,"User does not exist")
    }

    if(!password){
        throw new ApiError(400,"Enter a password")
    }

    if(!(await user.isPasswordCorrect(password))){
        throw new ApiError(401,"Incorrect Password")
    }

    const {accessToken, refreshToken}= await generateAccessAndRefreshToken(user._id)
    
    const updatedUser=await User.findById(user._id).select(
        "-password -refreshToken"
    )

    const options={
        httpOnly: true,
        secure: true
    }
    
    return res
    .status(200)
    .cookie("accessToken",accessToken,options)
    .cookie("refreshToken",refreshToken,options)
    .json(
        new ApiResponse(
            200,
            {
                user:updatedUser,accessToken,refreshToken
            },
            "Logged in successfully!!"
        )
    )
})

const logOutUser= asyncHandler(async(req,res)=>{
    //refresh and access token ko clear krna h
    await User.findByIdAndUpdate(
        req.user._id,
        {
            // $set:{
            //     refreshToken:undefined
            // }
            $unset:{
                refreshToken:1 //removes this feild from the doc
            }
        },{
            new:true
        }
    )

    const options={
        httpOnly: true,
        secure: true
    }

    return res
    .status(200)
    .clearCookie("accessToken",options)
    .clearCookie("refreshToken ",options)
    .json(
        new ApiResponse(200,{},"user logged out")
    )

})

const deleteUser= asyncHandler( async(req,res)=>{
    const delUserId=req.user._id

    // User.deleteOne({_id: delUserId})
    await User.deleteOne({_id: delUserId})

    res.status(200)
    .json(
        new ApiResponse(
            200,
            {},
            "User deleted"
        )
    )
})

const refreshAccessToken = asyncHandler(async(req,res)=>{
    try {
        const tokenFromUser= req.cookies?.refreshToken || req.body.refreshToken
        
        if(!tokenFromUser){
            throw new ApiError(400,"Refresh Token is required");
        }
    
        const decodedToken= jwt.verify(tokenFromUser,process.env.REFRESH_TOKEN_SECRET);
    
        const user= await User.findById(decodedToken._id)
    
        if(!user){
            throw new ApiError(400,"Invalid refresh token");
        }
        
        if(tokenFromUser!= user?.refreshToken){
            throw new ApiError(400,"Refresh Token not correct or used")
        }

        const options={
            httpOnly:true,
            secure:true
        }

        const {accessToken, newrefreshToken}=generateAccessAndRefreshToken(user._id);
    
        res.status(200)
        .cookie("accessToken: ",accessToken,options)
        .cookie("refreshToken: ",newrefreshToken,options)
        .json(
            new ApiResponse(
                200,
                {
                    user,accessToken,newrefreshToken
                },
                "Access Token Sent Successfully"
            )
        )
    } catch (error) {
        throw new ApiError(400,error.message || "Error")
    }
})

const changePassword= asyncHandler(async(req,res)=>{
    //User will give a old password and new password
    //cookies se u get refresh token and from that id of user => if logged in then only pass change ho skta hai...=>verifyJWT ko explicitly ko call krne ki need nahi hogi..login k tym hi call ho jaata h
    //verify old password
    //check the validation of new password
    //update in database
    const {oldPassword,newPassword} = req.body
    
    const user=await User.findById(req.user?._id);
   
    if(oldPassword.trim()===""){
        throw new ApiError(400,"Old Password is empty!!")
    }

    if(!(await user.isPasswordCorrect(oldPassword))){
        throw new ApiError(400,"Old Password is wrong")
    }
    
    if(newPassword.trim()==""){
        throw new ApiError(400,"New Password is empty!!")
    }
    if(newPassword.length<8){
        throw new ApiError(400,"Password is less than 8 character");
    }

    user.password=newPassword;
    await user.save({validateBeforeSave:false});

    return res.status(200)
    .json(
        new ApiResponse(
            200,
            {},
            "Password updated successfully"
        )
    )
})

const getCurrentUser = asyncHandler(async(req,res)=>{
    return res.status(200)
    .json(
        new ApiResponse(
            200,
            req.user,
            "User details sent"
        )
    )
})

const updateFullName=asyncHandler(async(req,res)=>{
    //username,fullname
    const {fullName}= req.body
    
    if(!fullName){
        throw new ApiError(400,"Feild is empty!!")
    }

    const user=await User.findByIdAndUpdate(
        req.user?._id,
        {
            $set:{
                fullName
            }
        },
        {new:true}
    ).select("-password")

    return res.status(200)
    .json(
        new ApiResponse(
            200,
            user,
            "fullName updated!"
        )
    )

})

const updateUserName=asyncHandler(async(req,res)=>{
    //username,fullname
    const {userName}= req.body
    
    if(!userName){
        throw new ApiError(400,"Feild is empty!!")
    }
    console.log(userName);
    const user=await User.findByIdAndUpdate(
        req.user?._id,
        {
            $set:{
                userName:userName
            }
        },
        {new:true}
    ).select("-password")

    return res.status(200)
    .json(
        new ApiResponse(
            200,
            user,
            "userName updated!!"
        )
    )

})

const updateCoverImage= asyncHandler( async(req,res)=>{
    
    const coverImageLocalPath= req.file.path;

    if(!coverImageLocalPath){
        throw new ApiError(400,"Please cover Image")
    }

    const uploadedImage= await uploadOnCloudinary(coverImageLocalPath)

    if(!uploadedImage){
        throw new ApiError(400,"Error while uploading on cloudinary")
    }

    const user2= await (User.findById(req.user?._id))
    const url= user2.coverImage;
    
    delFromCloudinary(url);

    const user=await  User.findByIdAndUpdate(
        req.user?._id,
        {
            $set:{
                coverImage: uploadedImage.url
            }
        },
        {new:true}
    ).select("-password -refeshtoken")
    
    return res.status(200)
    .json(
        new ApiResponse(
            200,
            user,
            "CoverImage Successfully Uploaded!!"
        )
    )

})

const updateAvatar= asyncHandler( async(req,res)=>{
    
    const avatarLocalPath= req.file.path;

    if(!avatarLocalPath){
        throw new ApiError(400,"Please give avatar image")
    }

    const uploadedImage= await uploadOnCloudinary(avatarLocalPath)

    if(!uploadedImage){
        throw new ApiError(400,"Error while uploading on cloudinary")
    }

    const user2= await (User.findById(req.user?._id))
    const url= user2.avatar;
    
    delFromCloudinary(url);
    
    const user=await  User.findByIdAndUpdate(
        req.user?._id,
        {
            $set:{
                avatar: uploadedImage.url
            }
        },
        {new:true}
    ).select("-password -refeshtoken")
    console.log(user);
    return res.status(200)
    .json(
        new ApiResponse(
            200,
            user,
            "Avatar Successfully Uploaded!!"
        )
    )

})

const getUserChannelProfile = asyncHandler(async(req,res)=>{
   
    const {userName}= req.params 
    console.log(userName);
    if(!userName?.trim()){
        throw new ApiError(400,"Username is not given")
    }

    const channel= await User.aggregate([  //pipeline result: arrays-->objects
        {
            $match:{
                userName: userName?.toLowerCase()
            }
        },
        {
            $lookup:{ //no of subscriber
                from: "subsciptions",
                localField:"_id",
                foreignField:"channel",
                as: "subscribers"
            }
        },
        {
            $lookup:{
                from: "subsciptions",
                localField:"_id",
                foreignField:"subscriber",
                as: "subscribedTo"
            }
        },
        {
            $addFields:{
                subscribersCount:{
                    $size: "$subscribers"
                },
                channelsSubscribedToCount:{
                    $size: "$subscribedTo"
                },
                isSubscribed:{
                    $cond:{
                        if:{$in: [req.user?._id,"$subscribers.subscriber"] },
                        then:true,
                        else:false
                    }
                }
            }
        },
        {
            $project:{
                fullName:1,
                userName:1,
                avatar:1,
                coverImage:1,
                channelsSubscribedToCount:1,
                subscribersCount:1,
                isSubscribed:1
            }
        }
    ])
    
    if(!channel?.length){
        throw new ApiError(404,"Channel does not exist");
    }
    console.log(channel);  //return: array 

    return res.status(200)
    .json(
        new ApiResponse(
            200,
            channel[0],
            "User channel fetched successfully"
        )
    )
})


const getWatchHistory=asyncHandler(async(req,res)=>{
    const user= await User.aggregate([
        {
            $match:{
                _id: new mongoose.Types.ObjectId(req.user._id)
            }
        },
        {
            $lookup:{
                from: "videos",
                localField:"watchHistory",
                foreignField:"_id",
                as:"watchHistory",
                pipeline:[
                    {
                        $lookup:{
                            from:"users",
                            localField:"owner",
                            foreignField:"_id",
                            as:"owner",
                            pipeline:[
                                {
                                    $project:{
                                        fullName:1,
                                        userName:1,
                                        avatar:1
                                    }
                                },
                                {
                                    $addFields:{
                                        owner:{
                                            $first: "$owner"
                                        }
                                    }
                                }
                            ]
                        }
                    }
                ]
            }
        }
    ])

    return res.status(200)
    .json(
        new ApiResponse(
            200,
            user[0].watchHistory,
            "Watch history fetched Successfully"
        )
    )
})

export {
    registerUser,
    loginUser,
    logOutUser,
    deleteUser,
    refreshAccessToken,
    changePassword,
    getCurrentUser,
    updateFullName,
    updateUserName,
    updateCoverImage,
    updateAvatar,
    getUserChannelProfile,
    getWatchHistory
}