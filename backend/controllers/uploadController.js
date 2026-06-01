'use strict';

const R = require('../utils/response');

// UPLOAD FOTO DE PERFIL
exports.uploadFotoPerfil = async (req, res) => {
    try {
        if (!req.file) return R.badRequest(res, 'Nenhuma imagem enviada.');
        return R.success(res, {
            message: 'Foto enviada com sucesso!',
            url: req.file.path,
        });
    } catch (err) {
        return R.serverError(res, err);
    }
};

// UPLOAD BANNER
exports.uploadBanner = async (req, res) => {
    try {
        if (!req.file) return R.badRequest(res, 'Nenhuma imagem enviada.');
        return R.success(res, {
            message: 'Banner enviado com sucesso!',
            url: req.file.path,
        });
    } catch (err) {
        return R.serverError(res, err);
    }
};

// UPLOAD IMAGEM DE ANÚNCIO
exports.uploadAnuncio = async (req, res) => {
    try {
        if (!req.file) return R.badRequest(res, 'Nenhuma imagem enviada.');
        return R.success(res, {
            message: 'Imagem do anúncio enviada com sucesso!',
            url: req.file.path,
        });
    } catch (err) {
        return R.serverError(res, err);
    }
};
