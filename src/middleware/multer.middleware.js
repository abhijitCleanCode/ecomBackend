import multer from "multer";
import { ALLOWED_FILE_TYPES } from "../utils/cloudinaryUpload.util.js";

// configure multer storage
const storage = multer.memoryStorage();

// disk storage
// const storage = multer.diskStorage({
//   destination: function (req, file, cb) {
//     cb(null, "./public/temp");
//   },
//   filename: function (req, file, cb) {
//     console.log("src :: middlewares :: multer middleware :: file: ", file);

//     cb(null, file.originalname);
//   },
// });

const isAllowedFileType = (mimetype) => {
  return ALLOWED_FILE_TYPES[mimetype] !== undefined;
};

const fileFilter = (req, file, cb) => {
  if (isAllowedFileType(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error(`File type ${file.mimetype} is not allowed`), false);
  }
};

const upload = multer({
  // using memory storage to fast read the excel file
  storage,
  fileFilter,
  limits: {
    fileSize: 1024 * 1024 * 10, // 10 MB
    files: 10, // Max 10 files
  },
});

// error handling middleware for multer
export const handleMulterError = (err, req, res, next) => {
  if (err instanceof multer.MulterError) {

    if (err.code === "LIMIT_FILE_SIZE") {
      return res.status(400).json({
        message: "File too large, maximum size is 10MB",
      });
    }

    if (err.code === "LIMIT_FILE_COUNT") {
      return res.status(400).json({
        message: "Too many files, maximum is 10 files",
      });
    }

    return res.status(400).json({
      message: `Upload error: ${err.message}`,
    });
  }

  if (err.message && err.message.includes("is not allowed")) {
    return res.status(400).json({
      message: err.message,
    });
  }

  next(err);
};

export default upload;
