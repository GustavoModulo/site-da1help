'use strict';

const express       = require('express');
const router        = express.Router();
const { authenticate } = require('../middlewares/auth');
const { uploadPerfil, uploadBanner, uploadAnuncio } = require('../config/cloudinary');
const uploadCtrl    = require('../controllers/uploadController');
const R             = require('../utils/response');

// Middleware de erro do multer
const handleUploadError = (err, req, res, next) => {
    if (err) return R.badRequest(res, err.message || 'Erro no upload da imagem.');
    next();
};

router.post(
    '/perfil',
    authenticate,
    (req, res, next) => uploadPerfil.single('imagem')(req, res, (err) => handleUploadError(err, req, res, next)),
    uploadCtrl.uploadFotoPerfil
);

router.post(
    '/banner',
    authenticate,
    (req, res, next) => uploadBanner.single('imagem')(req, res, (err) => handleUploadError(err, req, res, next)),
    uploadCtrl.uploadBanner
);

router.post(
    '/anuncio',
    authenticate,
    (req, res, next) => uploadAnuncio.single('imagem')(req, res, (err) => handleUploadError(err, req, res, next)),
    uploadCtrl.uploadAnuncio
);

module.exports = router;
