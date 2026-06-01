'use strict';

const express      = require('express');
const router       = express.Router();

const anuncioCtrl  = require('../controllers/anuncioController');
const { authenticate, authorize } = require('../middlewares/auth');
const { anuncioRules, mongoIdParam, validate } = require('../middlewares/validation');

// rotas específicas antes das dinâmicas (:id)
router.get('/meus/lista',
    authenticate,
    authorize('profissional', 'admin'),
    anuncioCtrl.getMeus
);

router.get('/',    anuncioCtrl.listar);
router.get('/:id', mongoIdParam('id'), validate, anuncioCtrl.getById);

router.post('/',
    authenticate,
    authorize('profissional', 'admin'),
    anuncioRules,
    validate,
    anuncioCtrl.criar
);

router.put('/:id',
    authenticate,
    authorize('profissional', 'admin'),
    mongoIdParam('id'),
    validate,
    anuncioCtrl.atualizar
);

router.delete('/:id',
    authenticate,
    authorize('profissional', 'admin'),
    mongoIdParam('id'),
    validate,
    anuncioCtrl.remover
);

module.exports = router;
