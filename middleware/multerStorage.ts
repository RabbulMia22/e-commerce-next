import cloudinary from "@/lib/cloudinary";

// Helper function to upload image using your existing Cloudinary config
async function uploadImage(file: File): Promise<string> {
  // Check file size (max 8MB per file)
  const maxSize = 8 * 1024 * 1024; // 8MB
  if (file.size > maxSize) {
    throw new Error(`File ${file.name} is too large. Maximum size is 8MB.`);
  }

  const bytes = await file.arrayBuffer();
  const buffer = Buffer.from(bytes);

  return new Promise((resolve, reject) => {
    cloudinary.uploader.upload_stream(
      {
        folder: 'ecommerce_products',
        transformation: [
          { width: 1000, height: 1000, crop: 'limit' },
          { quality: 'auto', fetch_format: 'auto' },
          { flags: 'progressive' }
        ],
        resource_type: 'auto'
      },
      (error, result) => {
        if (error) reject(error);
        else resolve(result!.secure_url);
      }
    ).end(buffer);
  });
}
export default uploadImage;