'use strict';

const rateLimit = require('express-rate-limit');

const isProduction = process.env.NODE_ENV === 'production';

const limiterConfig = (windowMinutes, max, message, options = {}) =>
    rateLimit({
        windowMs:          windowMinutes * 60 * 1000,
        max,
        message:           { success: false, error: message },
        standardHeaders:   true,
        legacyHeaders:     false,
        skipSuccessfulRequests: false,
        ...options,
    });

// 10 tentativas / 15 min
const loginLimiter = limiterConfig(15, 10, 'Muitas tentativas de login. Aguarde 15 minutos.');

// 5 contas / hora em produção
const registerLimiter = limiterConfig(
    60,
    isProduction ? 5 : 20,
    'Muitas contas criadas. Tente novamente em 1 hora.',
    { skipSuccessfulRequests: !isProduction }
);

// 10 denúncias / hora
const denunciaLimiter = limiterConfig(60, 10, 'Muitas denúncias enviadas. Tente novamente em 1 hora.');

// 200 req / 10 min geral
const apiLimiter = limiterConfig(10, 200, 'Muitas requisições. Tente novamente em instantes.');

module.exports = { loginLimiter, registerLimiter, denunciaLimiter, apiLimiter };
