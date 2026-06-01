'use strict';

const { verifyToken }  = require('../utils/jwt');
const { unauthorized, forbidden } = require('../utils/response');
const User = require('../models/User');

// AUTENTICAÇÃO JWT
const authenticate = async (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;

        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return unauthorized(res, 'Token de autenticação não fornecido.');
        }

        const token = authHeader.split(' ')[1];
        const decoded = verifyToken(token);

        const user = await User.findById(decoded.id).select('-senha -resetToken -resetTokenExpiry');

        if (!user) {
            return unauthorized(res, 'Usuário não encontrado. Faça login novamente.');
        }

        if (user.blocked) {
            return forbidden(res, 'Sua conta foi suspensa. Entre em contato com o suporte.');
        }

        req.user = user;
        next();
    } catch (err) {
        if (err.name === 'TokenExpiredError') {
            return unauthorized(res, 'Sessão expirada. Faça login novamente.');
        }
        if (err.name === 'JsonWebTokenError') {
            return unauthorized(res, 'Token inválido. Faça login novamente.');
        }
        return unauthorized(res, 'Falha na autenticação.');
    }
};

// AUTORIZAÇÃO POR TIPO
const authorize = (...tipos) => {
    return (req, res, next) => {
        if (!req.user) {
            return unauthorized(res);
        }

        if (!tipos.includes(req.user.tipo)) {
            return forbidden(res, `Acesso restrito a: ${tipos.join(', ')}.`);
        }

        next();
    };
};

// DONO DO RECURSO OU ADMIN
const ownResourceOrAdmin = (paramName = 'id') => {
    return (req, res, next) => {
        const resourceId = req.params[paramName];

        if (req.user.tipo === 'admin') return next();

        if (req.user._id.toString() !== resourceId) {
            return forbidden(res, 'Você não tem permissão para acessar este recurso.');
        }

        next();
    };
};

module.exports = { authenticate, authorize, ownResourceOrAdmin };
