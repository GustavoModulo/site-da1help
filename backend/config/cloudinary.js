'use strict';

const cloudinary = require('cloudinary').v2;
const multer     = require('multer');
const { CloudinaryStorage } = require('multer-storage-cloudinary');

// CLOUDINARY
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key:    process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
});

// STORAGE FOTO DE PERFIL
const storagePerfil = new CloudinaryStorage({
    cloudinary,
    params: {
        folder:         'da1help/perfis',
        allowed_formats: ['jpg', 'jpeg', 'png', 'webp'],
        transformation: [{ width: 400, height: 400, crop: 'fill', gravity: 'face' }],
    },
});

// STORAGE BANNER
const storageBanner = new CloudinaryStorage({
    cloudinary,
    params: {
        folder:         'da1help/banners',
        allowed_formats: ['jpg', 'jpeg', 'png', 'webp'],
        transformation: [{ width: 1200, height: 400, crop: 'fill' }],
    },
});

// STORAGE IMAGEM DE ANÚNCIO
const storageAnuncio = new CloudinaryStorage({
    cloudinary,
    params: {
        folder:         'da1help/anuncios',
        allowed_formats: ['jpg', 'jpeg', 'png', 'webp'],
        transformation: [{ width: 1200, height: 630, crop: 'fill' }],
    },
});

// FILTRO DE TIPO
const fileFilter = (_req, file, cb) => {
    const allowed = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    if (allowed.includes(file.mimetype)) {
        cb(null, true);
    } else {
        cb(new Error('Formato inválido. Use JPG, PNG ou WEBP.'), false);
    }
};

const limits = { fileSize: 5 * 1024 * 1024 }; // 5MB

// INSTÂNCIAS
const uploadPerfil  = multer({ storage: storagePerfil,  fileFilter, limits });
const uploadBanner  = multer({ storage: storageBanner,  fileFilter, limits });
const uploadAnuncio = multer({ storage: storageAnuncio, fileFilter, limits });

module.exports = { cloudinary, uploadPerfil, uploadBanner, uploadAnuncio };
