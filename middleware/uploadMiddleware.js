import multer from 'multer';
import path from 'path';
import { v2 as cloudinaryV2 } from 'cloudinary';

// Cloudinary konfigürasyonu
cloudinaryV2.config({
    cloud_name: 'dbbrkd8ea',
    api_key: '826144592426479',
    api_secret: 'wIkhScnvoo7t55LXjqRxQJZV9nc',
});

const storage = multer.memoryStorage();

// Dosya tiplerini kontrol et
const fileFilter = (req, file, cb) => {
    const fileTypes = /jpeg|jpg|png|heic|heif/;
    const extname = fileTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = fileTypes.test(file.mimetype);

    if (mimetype || extname) {
        return cb(null, true);
    } else {
        cb('Error: Only image files are allowed.');
    }
};

// Multer konfigürasyonu
const upload = multer({
    storage: storage,
    fileFilter: fileFilter,
    limits: { fileSize: 60 * 1024 * 1024 },  
});

const uploadToCloudinary = async (req, res, next) => {
  try {
    const files = req.files || (req.file ? [req.file] : []);

    if (files.length === 0) return next();

    const uploadPromises = files.map((file) => {
      return new Promise((resolve, reject) => {
        const stream = cloudinaryV2.uploader.upload_stream(
          {
            resource_type: 'image',
            folder: 'user_photos',
          },
          (error, result) => {
            if (error) return reject(error);
            resolve(result.secure_url);
          }
        );
        stream.end(file.buffer);
      });
    });

    const uploadedUrls = await Promise.all(uploadPromises);

    if (req.file) {
      // single file yollandısa, string təyin et
      req.fileUrl = uploadedUrls[0];
    } else {
      // birdən çox file yollandısa array təyin et
      req.fileUrls = uploadedUrls;
    }

    next();
  } catch (error) {
    console.error('Cloudinary Upload Error:', error);
    res.status(500).send("Cloudinary upload error: " + error.message);
  }
};




export { upload, uploadToCloudinary };
