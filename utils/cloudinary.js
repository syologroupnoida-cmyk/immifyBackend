import { v2 as cloudinary } from 'cloudinary';


// Function to upload file to Cloudinary
export const uploadToCloudinary = async (file, folder = 'immify/news') => {
  try {
    const result = await cloudinary.uploader.upload(`data:${file.mimetype};base64,${file.buffer.toString('base64')}`, {
      folder,
      resource_type: 'auto',
    });
    return {
      public_id: result.public_id,
      url: result.secure_url,
    };
  } catch (error) {
    throw new Error(`Cloudinary upload failed: ${error.message}`);
  }
};

// Function to delete file from Cloudinary
export const deleteFromCloudinary = async (public_id) => {
  try {
    await cloudinary.uploader.destroy(public_id);
  } catch (error) {
    throw new Error(`Cloudinary deletion failed: ${error.message}`);
  }
};