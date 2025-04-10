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

const uploadToCloudinary = (req, res, next) => {
    if (!req.file) {
      return next(); // Fotoğraf yüklenmemişse, geçiş yap
    }
  
    const stream = cloudinaryV2.uploader.upload_stream(
      {
        resource_type: 'image',
        folder: 'user_photos',  // Fotoğraflar için klasör adı
      },
      (error, result) => {
        if (error) {
          console.error("Cloudinary Error: ", error);
          return res.status(500).send("Cloudinary upload error: " + error.message);
        }
  
        req.fileUrl = result.secure_url;  // Cloudinary URL'sini kaydet
        next();  // İleriye doğru geçiş yap
      }
    );
  
    stream.end(req.file.buffer);  // Buffer'ı stream'e gönderiyoruz
  };

export { upload, uploadToCloudinary };
