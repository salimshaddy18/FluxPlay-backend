import { v2 as cloudinary } from 'cloudinary';
import fs from 'fs';
// Configuration
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET // Click 'View API Keys' above to copy your API secret
});

const uploadOnCloudinary = async (localFilePath) => {
    try {
        // console.log(" env : ",process.env.CLOUDINARY_CLOUD_NAME,process.env.CLOUDINARY_API_KEY,process.env.CLOUDINARY_API_SECRET)
        // console.log("uploading")
        if (!localFilePath) return null
        //upload the file to Cloudinary
        const response = await cloudinary.uploader.upload(localFilePath, {
            resource_type: 'auto'
        })
        // console.log("file is uploaded to cloudinary",
        //     response.url);
        fs.unlinkSync(localFilePath); // Delete/unlink the local file after upload
        return response
    }
    catch (error) {
        console.log("cl error ",error)// Delete the local file(corrupted and malicious files) if upload fails
        fs.unlinkSync(localFilePath); 
        return null;
    }
}

export { uploadOnCloudinary }