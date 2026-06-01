'use strict';

const { body, param, validationResult } = require('express-validator');
const { badRequest } = require('../utils/response');

const validate = (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return badRequest(res, errors.array()[0].msg);
    next();
};

// CADASTRO
const registerRules = [
    body('nome').trim().notEmpty().withMessage('Nome é obrigatório.')
        .isLength({ min: 2, max: 100 }).withMessage('Nome deve ter entre 2 e 100 caracteres.'),
    body('email').trim().notEmpty().withMessage('Email é obrigatório.')
        .isEmail().withMessage('Email inválido.').normalizeEmail(),
    body('senha').notEmpty().withMessage('Senha é obrigatória.')
        .isLength({ min: 6 }).withMessage('Senha deve ter no mínimo 6 caracteres.'),
    body('cpfCnpj').trim().notEmpty().withMessage('CPF ou CNPJ é obrigatório.'),
];

// LOGIN
const loginRules = [
    body('email').trim().notEmpty().withMessage('Email é obrigatório.')
        .isEmail().withMessage('Email inválido.').normalizeEmail(),
    body('senha').notEmpty().withMessage('Senha é obrigatória.'),
];

// UPGRADE PRO
const upgradeProRules = [
    body('categoria').custom((value) => {
        const arr = Array.isArray(value)
            ? value.filter(c => typeof c === 'string' && c.trim())
            : (value ? [value.toString().trim()] : []);
        if (!arr.length) throw new Error('Selecione pelo menos uma categoria.');
        if (arr.some(c => c.length > 80)) throw new Error('Categoria deve ter no máximo 80 caracteres.');
        return true;
    }),
    body('whatsapp').trim().notEmpty().withMessage('WhatsApp é obrigatório.')
        .custom(val => {
            const d = val.replace(/\D/g, '');
            if (!/^\d{10,15}$/.test(d)) throw new Error('WhatsApp inválido. Use apenas números (ex: 19999999999).');
            return true;
        }),
    body('descricao').trim().notEmpty().withMessage('Descrição é obrigatória.')
        .isLength({ min: 10, max: 1000 }).withMessage('Descrição deve ter entre 10 e 1000 caracteres.'),
];

// ATUALIZAR PERFIL
const updateProfileRules = [
    body('descricao').optional().trim()
        .isLength({ max: 1000 }).withMessage('Descrição deve ter no máximo 1000 caracteres.'),
    body('whatsapp').optional().trim().custom(value => {
        if (!value) return true;
        const d = value.replace(/\D/g, '');
        if (!/^\d{10,15}$/.test(d)) throw new Error('WhatsApp inválido.');
        return true;
    }),
    body('cidade').optional().trim()
        .isLength({ max: 100 }).withMessage('Cidade deve ter no máximo 100 caracteres.'),
];

// ATUALIZAR CONFIGURAÇÕES
const updateConfigRules = [
    body('telefone').optional({ nullable: true }).trim().custom(value => {
        if (!value) return true;
        const d = value.replace(/\D/g, '');
        if (!/^\d{10,11}$/.test(d)) throw new Error('Telefone inválido. Use DDD + número.');
        return true;
    }),
    body('endereco').optional().trim()
        .isLength({ max: 200 }).withMessage('Endereço deve ter no máximo 200 caracteres.'),
    body('cidade').optional().trim()
        .isLength({ max: 100 }).withMessage('Cidade deve ter no máximo 100 caracteres.'),
    body('notificacoes').optional().isBoolean(),
];

// AVALIAÇÃO
const avaliacaoRules = [
    body('nota').notEmpty().withMessage('Nota é obrigatória.')
        .isInt({ min: 1, max: 5 }).withMessage('Nota deve ser entre 1 e 5.'),
    body('comentario').optional().trim()
        .isLength({ max: 500 }).withMessage('Comentário deve ter no máximo 500 caracteres.'),
];

// DENÚNCIA
const denunciaRules = [
    body('motivo').notEmpty().withMessage('Motivo é obrigatório.')
        .isIn(['perfil_falso', 'fraude', 'comportamento_abusivo', 'servico_nao_entregue', 'conteudo_inapropriado', 'outro'])
        .withMessage('Motivo inválido.'),
    body('descricao').trim().notEmpty().withMessage('Descrição é obrigatória.')
        .isLength({ min: 10, max: 1000 }).withMessage('Descrição deve ter entre 10 e 1000 caracteres.'),
];

// ANÚNCIO
const anuncioRules = [
    body('titulo').trim().notEmpty().withMessage('Título é obrigatório.')
        .isLength({ min: 5, max: 100 }).withMessage('Título deve ter entre 5 e 100 caracteres.'),
    body('descricao').trim().notEmpty().withMessage('Descrição é obrigatória.')
        .isLength({ min: 20, max: 2000 }).withMessage('Descrição deve ter entre 20 e 2000 caracteres.'),
    body('categoria').trim().notEmpty().withMessage('Categoria é obrigatória.'),
    body('tipoServico').optional()
        .isIn(['presencial', 'remoto', 'ambos']).withMessage('Tipo de serviço inválido.'),
];

const mongoIdParam = (paramName = 'id') => [
    param(paramName).isMongoId().withMessage('ID inválido.'),
];

module.exports = {
    validate,
    registerRules,
    loginRules,
    upgradeProRules,
    updateProfileRules,
    updateConfigRules,
    avaliacaoRules,
    denunciaRules,
    anuncioRules,
    mongoIdParam,
};
