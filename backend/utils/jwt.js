'use strict';

const jwt = require('jsonwebtoken');

const JWT_SECRET  = process.env.JWT_SECRET;
const JWT_EXPIRES = process.env.JWT_EXPIRES_IN || '7d';

// GERAR TOKEN
const generateToken = (user) => {
    const payload = {
        id:   user._id,
        tipo: user.tipo,
        nome: user.nome,
    };

    return jwt.sign(payload, JWT_SECRET, {
        expiresIn: JWT_EXPIRES,
        issuer:    'da1help',
        audience:  'da1help-client',
    });
};

// VERIFICAR TOKEN
const verifyToken = (token) => {
    return jwt.verify(token, JWT_SECRET, {
        issuer:   'da1help',
        audience: 'da1help-client',
    });
};

module.exports = { generateToken, verifyToken };
