'use strict';

const Avaliacao = require('../models/Avaliacao');
const User      = require('../models/User');
const R         = require('../utils/response');

// ─── Avaliar profissional ─────────────────────────────────────────────────────
exports.avaliar = async (req, res) => {
    try {
        const { nota, comentario, feedbackPrivado } = req.body;
        const profissionalId = req.params.id;
        const clienteId      = req.user._id;

        // Valida que o alvo é realmente profissional
        const profissional = await User.findById(profissionalId);
        if (!profissional || profissional.tipo !== 'profissional') {
            return R.notFound(res, 'Profissional não encontrado.');
        }

        // Profissional não pode se auto-avaliar
        if (clienteId.toString() === profissionalId) {
            return R.badRequest(res, 'Você não pode avaliar a si mesmo.');
        }

        // Verifica avaliação duplicada
        const jaAvaliou = await Avaliacao.findOne({ profissionalId, clienteId });
        if (jaAvaliou) {
            return R.conflict(res, 'Você já avaliou este profissional.');
        }

        await Avaliacao.create({
            profissionalId,
            clienteId,
            nota,
            comentario:     comentario     || null,
            feedbackPrivado: feedbackPrivado || null,
        });

        // Recalcula a média real com todas as avaliações
        const resultado = await Avaliacao.aggregate([
            { $match: { profissionalId: profissional._id } },
            { $group: { _id: null, media: { $avg: '$nota' }, total: { $sum: 1 } } },
        ]);

        const media = resultado[0]?.media || nota;
        const total = resultado[0]?.total || 1;

        await User.findByIdAndUpdate(profissionalId, {
            'profissional.avaliacao':       Number(media.toFixed(2)),
            'profissional.totalAvaliacoes': total,
        });

        return R.created(res, { message: 'Avaliação enviada com sucesso!' });
    } catch (err) {
        return R.serverError(res, err);
    }
};

// ─── Listar avaliações de um profissional ────────────────────────────────────
exports.getAvaliacoes = async (req, res) => {
    try {
        const avaliacoes = await Avaliacao
            .find({ profissionalId: req.params.id })
            .populate('clienteId', 'nome fotoUrl')
            .sort({ createdAt: -1 })
            .select('-feedbackPrivado');

        return R.success(res, { avaliacoes });
    } catch (err) {
        return R.serverError(res, err);
    }
};
