'use strict';

const Denuncia = require('../models/Denuncia');
const User     = require('../models/User');
const R        = require('../utils/response');

// CRIAR DENÚNCIA
exports.denunciar = async (req, res) => {
    try {
        const { motivo, descricao } = req.body;
        const denunciadoId   = req.params.id;
        const denuncianteId  = req.user._id;

        if (denuncianteId.toString() === denunciadoId) {
            return R.badRequest(res, 'Você não pode denunciar a si mesmo.');
        }

        const denunciado = await User.findById(denunciadoId);
        if (!denunciado) return R.notFound(res, 'Usuário não encontrado.');

        // bloqueia duplicata nas últimas 24h
        const recente = await Denuncia.findOne({
            denunciadoId,
            denuncianteId,
            createdAt: { $gte: new Date(Date.now() - 86_400_000) },
        });

        if (recente) {
            return R.conflict(res, 'Você já enviou uma denúncia para este usuário nas últimas 24 horas.');
        }

        await Denuncia.create({ denunciadoId, denuncianteId, motivo, descricao });

        return R.created(res, {
            message: 'Denúncia registrada. Nossa equipe irá analisar em breve.',
        });
    } catch (err) {
        return R.serverError(res, err);
    }
};
