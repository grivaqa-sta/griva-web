const multer = require("multer");
const { CloudinaryStorage } = require("multer-storage-cloudinary");
const cloudinary = require("../config/cloudinary");

const storage = new CloudinaryStorage({
  cloudinary,
  params: async (req, file) => ({
    folder: "griva/products",
    resource_type: "image",
    format: file.mimetype.split("/")[1],
    public_id: `${Date.now()}-${file.originalname.split(".")[0]}`,
    transformation: [
      { width: 1000, height: 1000, crop: "limit" },
      { quality: "auto" },
      { fetch_format: "auto" }
    ],
  }),
});

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
  fileFilter: (req, file, cb) => {
    if (!file.mimetype.startsWith("image/")) {
      return cb(new Error("Only image files are allowed"), false);
    }
    cb(null, true);
  },
});

module.exports = upload;