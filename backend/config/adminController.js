'use strict';

const User     = require('../models/User');
const Denuncia = require('../models/Denuncia');
const Anuncio  = require('../models/Anuncio');
const R        = require('../utils/response');

// ─── Dashboard: estatísticas gerais ──────────────────────────────────────────
exports.getDashboard = async (req, res) => {
    try {
        const [
            totalUsuarios,
            totalProfissionais,
            totalClientes,
            totalAnuncios,
            totalDenuncias,
            denunciasPendentes,
            totalBloqueados,
        ] = await Promise.all([
            User.countDocuments(),
            User.countDocuments({ tipo: 'profissional' }),
            User.countDocuments({ tipo: 'cliente' }),
            Anuncio.countDocuments({ status: 'ativo' }),
            Denuncia.countDocuments(),
            Denuncia.countDocuments({ status: 'pendente' }),
            User.countDocuments({ blocked: true }),
        ]);

        // Novos usuários nos últimos 30 dias
        const trintaDiasAtras = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
        const novosUsuarios = await User.countDocuments({
            createdAt: { $gte: trintaDiasAtras },
        });

        return R.success(res, {
            stats: {
                totalUsuarios,
                totalProfissionais,
                totalClientes,
                totalAnuncios,
                totalDenuncias,
                denunciasPendentes,
                totalBloqueados,
                novosUsuarios,
            },
        });
    } catch (err) {
        return R.serverError(res, err);
    }
};

// ─── Listar todos os usuários ─────────────────────────────────────────────────
exports.getUsuarios = async (req, res) => {
    try {
        const { tipo, blocked, page = 1, limit = 20 } = req.query;

        const query = {};
        if (tipo)    query.tipo    = tipo;
        if (blocked !== undefined) query.blocked = blocked === 'true';

        const skip  = (Number(page) - 1) * Number(limit);
        const total = await User.countDocuments(query);

        const usuarios = await User
            .find(query)
            .select('-senha -resetToken -resetTokenExpiry')
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(Number(limit));

        return R.success(res, {
            usuarios,
            pagination: { total, page: Number(page), limit: Number(limit), totalPages: Math.ceil(total / Number(limit)) },
        });
    } catch (err) {
        return R.serverError(res, err);
    }
};

// ─── Bloquear usuário ─────────────────────────────────────────────────────────
exports.bloquear = async (req, res) => {
    try {
        const { motivo } = req.body;
        const user = await User.findById(req.params.id);

        if (!user) return R.notFound(res, 'Usuário não encontrado.');
        if (user.tipo === 'admin') return R.forbidden(res, 'Não é possível bloquear um admin.');

        user.blocked       = true;
        user.blockedReason = motivo || 'Violação dos termos de uso.';
        user.blockedAt     = new Date();
        await user.save();

        return R.success(res, { message: `Usuário ${user.nome} bloqueado.` });
    } catch (err) {
        return R.serverError(res, err);
    }
};

// ─── Desbloquear usuário ──────────────────────────────────────────────────────
exports.desbloquear = async (req, res) => {
    try {
        const user = await User.findById(req.params.id);
        if (!user) return R.notFound(res, 'Usuário não encontrado.');

        user.blocked       = false;
        user.blockedReason = null;
        user.blockedAt     = null;
        await user.save();

        return R.success(res, { message: `Usuário ${user.nome} desbloqueado.` });
    } catch (err) {
        return R.serverError(res, err);
    }
};

// ─── Listar denúncias ─────────────────────────────────────────────────────────
exports.getDenuncias = async (req, res) => {
    try {
        const { status, page = 1, limit = 20 } = req.query;

        const query = {};
        if (status) query.status = status;

        const skip  = (Number(page) - 1) * Number(limit);
        const total = await Denuncia.countDocuments(query);

        const denuncias = await Denuncia
            .find(query)
            .populate('denunciadoId',   'nome email fotoUrl tipo')
            .populate('denuncianteId',  'nome email')
            .populate('resolvidaPor',   'nome')
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(Number(limit));

        return R.success(res, {
            denuncias,
            pagination: { total, page: Number(page), limit: Number(limit), totalPages: Math.ceil(total / Number(limit)) },
        });
    } catch (err) {
        return R.serverError(res, err);
    }
};

// ─── Resolver denúncia ────────────────────────────────────────────────────────
exports.resolverDenuncia = async (req, res) => {
    try {
        const { status, resolucao } = req.body;

        const denuncia = await Denuncia.findById(req.params.id);
        if (!denuncia) return R.notFound(res, 'Denúncia não encontrada.');

        denuncia.status      = status || 'resolvida';
        denuncia.resolucao   = resolucao || null;
        denuncia.resolvidaPor = req.user._id;
        denuncia.resolvidaEm  = new Date();
        await denuncia.save();

        return R.success(res, { message: 'Denúncia atualizada.', denuncia });
    } catch (err) {
        return R.serverError(res, err);
    }
};

// ─── Remover anúncio (admin) ──────────────────────────────────────────────────
exports.removerAnuncio = async (req, res) => {
    try {
        const anuncio = await Anuncio.findByIdAndUpdate(
            req.params.id,
            { status: 'removido' },
            { new: true }
        );

        if (!anuncio) return R.notFound(res, 'Anúncio não encontrado.');

        return R.success(res, { message: 'Anúncio removido.' });
    } catch (err) {
        return R.serverError(res, err);
    }
};
