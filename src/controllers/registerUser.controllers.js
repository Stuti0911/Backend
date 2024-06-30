import {asyncHandler} from "../utils/asyncHandler.js"
import { ApiError } from "../utils/ApiError.js";
import {User} from "../models/user.model.js"
import { uploadOnCloudinary } from "../utils/cloudinary.js";
import ApiResponse from "../utils/ApiResponse.js";
import cookieParser from "cookie-parser";
import jwt from "jsonwebtoken"

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
            $set:{
                refreshToken:undefined
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


export {
    registerUser,
    loginUser,
    logOutUser,
    deleteUser,
    refreshAccessToken
}