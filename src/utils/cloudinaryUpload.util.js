import cloudinary from "../config/cloudinary.config.js";
import { getEpochTime } from "./utils.js";

export const ALLOWED_FILE_TYPES = {
  "image/jpeg": { format: "jpg", folder: "images" },
  "image/jpg": { format: "jpg", folder: "images" },
  "image/png": { format: "png", folder: "images" },
  "image/webp": { format: "webp", folder: "images" },
  "application/pdf": { format: "pdf", folder: "documents" },
};

export const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB

export const isAllowedFileType = (mimeType) => {
  return ALLOWED_FILE_TYPES[mimeType] !== undefined;
};

export const uploadToCloudinary = async function (
  fileBuffer,
  mimeType,
  fieldName,
  userType
) {
  if (!isAllowedFileType(mimeType)) {
    throw new Error(`File type ${mimeType} is not allowed`);
  }

  const { format, folder } = ALLOWED_FILE_TYPES[mimeType];
  const uniqueFilename = `${fieldName}_${getEpochTime()}`;

  // Convert buffer to base64
  const base64Data = `data:${mimeType};base64,${fileBuffer.toString("base64")}`;

  // Determine resource_type for Cloudinary
  let resource_type = "image";
  if (format === "pdf") {
    resource_type = "raw";
  }

  // Upload to Cloudinary
  const result = await cloudinary.uploader.upload(base64Data, {
    resource_type,
    folder: `school_erp/${userType}/${folder}`,
    public_id: uniqueFilename,
    overwrite: true,
  });

  return result.secure_url;
};

export const processFilesForUpload = async function (files, userType) {
  try {
    if (!files || files.length === 0) {
      return [];
    }

    const uploadPromises = files.map(async (file) => {
      if (!isAllowedFileType(file.mimetype)) {
        throw new Error(`File type ${file.mimetype} is not supported`);
      }

      if (file.size > MAX_FILE_SIZE) {
        throw new Error(`${file.originalname} exceeds maximum file size limit`);
      }

      const url = await uploadToCloudinary(
        file.buffer,
        file.mimetype,
        file.fieldname,
        userType
      );

      return {
        field: file.fieldname,
        url,
        originalname: file.originalname,
        mimetype: file.mimetype,
        size: file.size,
      };
    });

    return Promise.all(uploadPromises);
  } catch (error) {
    throw error;
  }
};

export default {
  uploadToCloudinary,
  processFilesForUpload,
  isAllowedFileType,
  ALLOWED_FILE_TYPES,
};
