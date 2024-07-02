import { v2 as cloudinary } from 'cloudinary';
import fs from "fs"


cloudinary.config({ 
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
});

const delFromCloudinary= async(url)=>{
    const public_id=url.split("/").pop().split(".")[0];
    console.log(public_id);

    cloudinary.api.delete_resources([public_id], 
    { type: 'upload', resource_type: 'image' })
  .then(()=>console.log("Previous stored file successfully deleted"))
  .catch(()=>console.log("Error occured while deleting"))
}

const uploadOnCloudinary = async(localFilePath)=>{
    try {
        if(!localFilePath) return `Couldn't find the Path`

        //else upload
        const response= await cloudinary.uploader.upload(localFilePath,{
            resource_type:"auto"
        })
        // console.log("File is uploaded successfully on cloudinary",response);
        fs.unlinkSync(localFilePath)
        return response;

    } catch (error) {
        fs.unlinkSync(localFilePath) //remove the locally saved file as the upload op got failed
        return null
    }
}

export {uploadOnCloudinary,delFromCloudinary}
    
   