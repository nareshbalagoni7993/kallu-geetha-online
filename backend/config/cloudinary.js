const multer = require('multer');
const path   = require('path');
const fs     = require('fs');

const useCloudinary =
  process.env.CLOUDINARY_CLOUD_NAME &&
  process.env.CLOUDINARY_CLOUD_NAME !== 'your_cloud_name';

let upload;

if (useCloudinary) {
  const cloudinary            = require('cloudinary').v2;
  const { CloudinaryStorage } = require('multer-storage-cloudinary');
  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key:    process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
  });
  const storage = new CloudinaryStorage({
    cloudinary,
    params: { folder: 'geetha-online', allowed_formats: ['jpg', 'jpeg', 'png', 'webp'] },
  });
  upload = multer({ storage });
} else {
  // Disk storage fallback — images served at /uploads/*
  const uploadDir = path.join(__dirname, '..', 'uploads');
  if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });

  const storage = multer.diskStorage({
    destination: (req, file, cb) => cb(null, uploadDir),
    filename:    (req, file, cb) => {
      const ext = path.extname(file.originalname);
      cb(null, `${Date.now()}-${Math.random().toString(36).slice(2)}${ext}`);
    },
  });
  upload = multer({
    storage,
    limits: { fileSize: 5 * 1024 * 1024 },
    fileFilter: (req, file, cb) => {
      const ok = /jpeg|jpg|png|webp|gif/.test(file.mimetype);
      cb(ok ? null : new Error('Only image files allowed'), ok);
    },
  });
}

module.exports = { upload, useCloudinary };
