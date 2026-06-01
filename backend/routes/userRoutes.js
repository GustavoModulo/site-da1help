'use strict';

const express    = require('express');
const router     = express.Router();

const userCtrl   = require('../controllers/userController');
const avalCtrl   = require('../controllers/avaliacaoController');
const denCtrl    = require('../controllers/denunciaController');
const { authenticate }  = require('../middlewares/auth');
const { avaliacaoRules, denunciaRules, mongoIdParam, updateProfileRules, updateConfigRules, validate } = require('../middlewares/validation');

router.get('/categorias',         userCtrl.getCategorias);

router.get('/professionals',      userCtrl.getProfissionais);
router.get('/professionals/:id',  mongoIdParam('id'), validate, userCtrl.getProfissionalById);

router.post('/professionals/:id/avaliar',
    authenticate,
    mongoIdParam('id'),
    avaliacaoRules,
    validate,
    avalCtrl.avaliar
);

router.get('/professionals/:id/avaliacoes',
    mongoIdParam('id'),
    validate,
    avalCtrl.getAvaliacoes
);

router.post('/professionals/:id/denunciar',
    authenticate,
    mongoIdParam('id'),
    denunciaRules,
    validate,
    denCtrl.denunciar
);

router.put('/profile', authenticate, updateProfileRules, validate, userCtrl.updateProfile);
router.put('/config',  authenticate, updateConfigRules, validate, userCtrl.updateConfig);

module.exports = router;
