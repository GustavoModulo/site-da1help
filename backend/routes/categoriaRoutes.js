'use strict';

const express    = require('express');
const router     = express.Router();
const Categoria  = require('../models/Categoria');
const { authenticate, authorize } = require('../middlewares/auth');
const R          = require('../utils/response');

router.get('/', async (req, res) => {
    try {
        const cats = await Categoria.find({ ativa: true }).sort({ ordem: 1, nome: 1 });
        return R.success(res, { categorias: cats });
    } catch (err) {
        return R.serverError(res, err);
    }
});

router.post('/', authenticate, authorize('admin'), async (req, res) => {
    try {
        const { nome, icone } = req.body;
        if (!nome) return R.badRequest(res, 'Nome é obrigatório.');
        const cat = await Categoria.create({ nome: nome.trim(), icone: icone || '🛠️' });
        return R.created(res, { message: 'Categoria criada!', categoria: cat });
    } catch (err) {
        if (err.code === 11000) return R.conflict(res, 'Categoria já existe.');
        return R.serverError(res, err);
    }
});

router.put('/:id', authenticate, authorize('admin'), async (req, res) => {
    try {
        const cat = await Categoria.findByIdAndUpdate(req.params.id, req.body, { new: true });
        if (!cat) return R.notFound(res, 'Categoria não encontrada.');
        return R.success(res, { message: 'Categoria atualizada!', categoria: cat });
    } catch (err) {
        return R.serverError(res, err);
    }
});

router.delete('/:id', authenticate, authorize('admin'), async (req, res) => {
    try {
        await Categoria.findByIdAndDelete(req.params.id);
        return R.success(res, { message: 'Categoria removida.' });
    } catch (err) {
        return R.serverError(res, err);
    }
});

module.exports = router;
