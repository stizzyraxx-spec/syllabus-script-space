import { db } from "@/api/supabaseClient";

/**
 * Uploads a File object to AWS S3 via the backend function.
 * Returns the public S3 URL string.
 */
export async function uploadFileToS3(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = async (e) => {
      try {
        // e.target.result is "data:<type>;base64,<data>"
        const base64 = e.target.result.split(",")[1];
        const response = await db.functions.invoke("uploadToS3", {
          fileName: file.name,
          fileType: file.type,
          fileData: base64,
        });
        resolve(response.data.file_url);
      } catch (err) {
        reject(err);
      }
    };
    reader.onerror = () => reject(new Error("Failed to read file"));
    reader.readAsDataURL(file);
  });
}