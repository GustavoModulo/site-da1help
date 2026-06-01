'use strict';

const express  = require('express');
const router   = express.Router();
const msgCtrl  = require('../controllers/messageController');
const { authenticate } = require('../middlewares/auth');
const { body, param, validationResult } = require('express-validator');
const { badRequest } = require('../utils/response');

const validate = (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return badRequest(res, errors.array()[0].msg);
    next();
};

router.use(authenticate);

router.post('/',
    body('destinatarioId').isMongoId().withMessage('Destinatário inválido.'),
    body('texto').trim().notEmpty().withMessage('Mensagem não pode ser vazia.')
        .isLength({ max: 2000 }).withMessage('Mensagem muito longa.'),
    validate,
    msgCtrl.send
);

router.get('/conversas',  msgCtrl.getConversas);
router.get('/nao-lidas',  msgCtrl.getNaoLidas);

router.get('/:u2',
    param('u2').isMongoId().withMessage('ID inválido.'),
    validate,
    msgCtrl.getHistorico
);

module.exports = router;
