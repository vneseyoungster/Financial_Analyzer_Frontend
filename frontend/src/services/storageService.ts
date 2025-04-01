import { storage } from './firebase';
import { ref, uploadBytesResumable, getDownloadURL, deleteObject } from 'firebase/storage';

/**
 * Uploads a file to Firebase Storage
 * @param file The file to upload
 * @param path The path in Firebase Storage (e.g., 'documents/financial_reports')
 * @param metadata Optional metadata for the file
 * @param progressCallback Optional callback for upload progress
 * @returns Promise with download URL
 */
export const uploadFile = async (
  file: File,
  path: string,
  metadata: any = {},
  progressCallback?: (progress: number) => void
): Promise<string> => {
  // Create a storage reference
  const fileName = `${Date.now()}_${file.name}`;
  const storageRef = ref(storage, `${path}/${fileName}`);

  // Create file metadata including the content type
  const fileMetadata = {
    contentType: file.type,
    ...metadata
  };

  // Upload the file and metadata
  const uploadTask = uploadBytesResumable(storageRef, file, fileMetadata);

  return new Promise((resolve, reject) => {
    uploadTask.on(
      'state_changed',
      (snapshot) => {
        // Get upload progress
        const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
        if (progressCallback) {
          progressCallback(progress);
        }
      },
      (error) => {
        // Handle unsuccessful uploads
        reject(error);
      },
      async () => {
        // Handle successful uploads on complete
        try {
          const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
          resolve(downloadURL);
        } catch (error) {
          reject(error);
        }
      }
    );
  });
};

/**
 * Deletes a file from Firebase Storage
 * @param url The URL of the file to delete
 * @returns Promise that resolves when the file is deleted
 */
export const deleteFile = async (url: string): Promise<void> => {
  // Extract the path from the URL
  // This is a simple approach and might need to be adjusted based on your URL format
  try {
    const fileRef = ref(storage, url);
    await deleteObject(fileRef);
  } catch (error) {
    console.error('Error deleting file:', error);
    throw error;
  }
};

/**
 * Gets the download URL for a file
 * @param path The path of the file in Firebase Storage
 * @returns Promise with download URL
 */
export const getFileUrl = async (path: string): Promise<string> => {
  const fileRef = ref(storage, path);
  return getDownloadURL(fileRef);
}; 