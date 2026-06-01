'use strict';

// RESPOSTAS PADRONIZADAS DA API

const success = (res, data = {}, statusCode = 200) => {
    return res.status(statusCode).json({
        success: true,
        ...data,
    });
};

const created = (res, data = {}) => success(res, data, 201);

const error = (res, message = 'Erro interno do servidor', statusCode = 500, details = null) => {
    const body = { success: false, error: message };
    if (details && process.env.NODE_ENV === 'development') {
        body.details = details;
    }
    return res.status(statusCode).json(body);
};

const badRequest  = (res, message) => error(res, message, 400);
const unauthorized = (res, message = 'Não autorizado') => error(res, message, 401);
const forbidden   = (res, message = 'Acesso negado') => error(res, message, 403);
const notFound    = (res, message = 'Recurso não encontrado') => error(res, message, 404);
const conflict    = (res, message) => error(res, message, 409);
const serverError = (res, err) => {
    console.error('❌ Server Error:', err);
    return error(res, 'Erro interno do servidor', 500, err?.message);
};

module.exports = {
    success,
    created,
    error,
    badRequest,
    unauthorized,
    forbidden,
    notFound,
    conflict,
    serverError,
};
