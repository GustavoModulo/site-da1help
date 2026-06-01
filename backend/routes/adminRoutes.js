'use strict';

const express     = require('express');
const router      = express.Router();

const adminCtrl   = require('../controllers/adminController');
const { authenticate, authorize } = require('../middlewares/auth');
const { mongoIdParam, validate } = require('../middlewares/validation');

router.use(authenticate, authorize('admin'));

router.get('/dashboard',             adminCtrl.getDashboard);
router.get('/usuarios',              adminCtrl.getUsuarios);
router.put('/usuarios/:id/bloquear', mongoIdParam('id'), validate, adminCtrl.bloquear);
router.put('/usuarios/:id/desbloquear', mongoIdParam('id'), validate, adminCtrl.desbloquear);
router.get('/denuncias',             adminCtrl.getDenuncias);
router.put('/denuncias/:id',         mongoIdParam('id'), validate, adminCtrl.resolverDenuncia);
router.delete('/anuncios/:id',       mongoIdParam('id'), validate, adminCtrl.removerAnuncio);

module.exports = router;
