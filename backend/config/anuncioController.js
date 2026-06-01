'use strict';

const Anuncio = require('../models/Anuncio');
const R       = require('../utils/response');

// ─── Criar anúncio ────────────────────────────────────────────────────────────
exports.criar = async (req, res) => {
    try {
        const {
            titulo, descricao, categoria, tipoServico,
            valor, regiaoAtendida, prazo, contato, tags, imagemUrl,
        } = req.body;

        // Apenas profissionais podem anunciar (já validado pelo middleware authorize)
        const anuncio = await Anuncio.create({
            profissionalId: req.user._id,
            titulo,
            descricao,
            categoria,
            tipoServico:    tipoServico    || 'presencial',
            valor:          valor          || {},
            regiaoAtendida: regiaoAtendida || null,
            prazo:          prazo          || null,
            contato:        contato        || null,
            tags:           tags           || [],
            imagemUrl:      imagemUrl      || null,
        });

        return R.created(res, {
            message: 'Anúncio publicado com sucesso!',
            anuncio,
        });
    } catch (err) {
        return R.serverError(res, err);
    }
};

// ─── Listar anúncios públicos ─────────────────────────────────────────────────
exports.listar = async (req, res) => {
    try {
        const { busca, categoria, tipoServico, page = 1, limit = 12 } = req.query;

        const query = { status: 'ativo' };

        if (busca) {
            query.$or = [
                { titulo:    new RegExp(busca, 'i') },
                { descricao: new RegExp(busca, 'i') },
                { tags:      new RegExp(busca, 'i') },
            ];
        }

        if (categoria)    query.categoria    = new RegExp(categoria, 'i');
        if (tipoServico)  query.tipoServico  = tipoServico;

        const skip  = (Number(page) - 1) * Number(limit);
        const total = await Anuncio.countDocuments(query);

        const anuncios = await Anuncio
            .find(query)
            .populate('profissionalId', 'nome fotoUrl profissional.avaliacao profissional.categoria')
            .sort({ destacado: -1, createdAt: -1 })
            .skip(skip)
            .limit(Number(limit));

        return R.success(res, {
            anuncios,
            pagination: {
                total,
                page:       Number(page),
                limit:      Number(limit),
                totalPages: Math.ceil(total / Number(limit)),
            },
        });
    } catch (err) {
        return R.serverError(res, err);
    }
};

// ─── Buscar anúncio por ID + incrementar visualizações ───────────────────────
exports.getById = async (req, res) => {
    try {
        const anuncio = await Anuncio
            .findOneAndUpdate(
                { _id: req.params.id, status: 'ativo' },
                { $inc: { visualizacoes: 1 } },
                { new: true }
            )
            .populate('profissionalId', 'nome fotoUrl profissional');

        if (!anuncio) return R.notFound(res, 'Anúncio não encontrado.');

        return R.success(res, { anuncio });
    } catch (err) {
        return R.serverError(res, err);
    }
};

// ─── Anúncios do profissional logado ─────────────────────────────────────────
exports.getMeus = async (req, res) => {
    try {
        const anuncios = await Anuncio
            .find({ profissionalId: req.user._id })
            .sort({ createdAt: -1 });

        return R.success(res, { anuncios });
    } catch (err) {
        return R.serverError(res, err);
    }
};

// ─── Atualizar anúncio ────────────────────────────────────────────────────────
exports.atualizar = async (req, res) => {
    try {
        const anuncio = await Anuncio.findOne({
            _id:            req.params.id,
            profissionalId: req.user._id,
        });

        if (!anuncio) return R.notFound(res, 'Anúncio não encontrado.');

        const campos = [
            'titulo', 'descricao', 'categoria', 'tipoServico',
            'valor', 'regiaoAtendida', 'prazo', 'contato', 'tags',
            'imagemUrl', 'status',
        ];

        campos.forEach((c) => {
            if (req.body[c] !== undefined) anuncio[c] = req.body[c];
        });

        await anuncio.save();

        return R.success(res, { message: 'Anúncio atualizado!', anuncio });
    } catch (err) {
        return R.serverError(res, err);
    }
};

// ─── Remover anúncio (soft delete) ───────────────────────────────────────────
exports.remover = async (req, res) => {
    try {
        const anuncio = await Anuncio.findOne({
            _id:            req.params.id,
            profissionalId: req.user._id,
        });

        if (!anuncio) return R.notFound(res, 'Anúncio não encontrado.');

        anuncio.status = 'removido';
        await anuncio.save();

        return R.success(res, { message: 'Anúncio removido.' });
    } catch (err) {
        return R.serverError(res, err);
    }
};
