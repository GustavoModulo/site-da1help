'use strict';

const User      = require('../models/User');
const Categoria = require('../models/Categoria');
const Avaliacao = require('../models/Avaliacao');
const R         = require('../utils/response');

// BUSCAR PROFISSIONAIS
exports.getProfissionais = async (req, res) => {
    try {
        const { busca, categoria, cidade, tipoServico, page = 1, limit = 12 } = req.query;

        const query = {
            tipo:    'profissional',
            blocked: { $ne: true },
            'profissional.ativo': { $ne: false },
        };

        if (busca) {
            query.$or = [
                { nome:                     new RegExp(busca, 'i') },
                { 'profissional.categoria': new RegExp(busca, 'i') },
                { 'profissional.descricao': new RegExp(busca, 'i') },
            ];
        }

        if (categoria)    query['profissional.categoria']   = { $in: [new RegExp(categoria, 'i')] };
        if (cidade)       query['profissional.cidade']      = new RegExp(cidade, 'i');
        if (tipoServico)  query['profissional.tipoServico'] = tipoServico;

        const skip  = (Number(page) - 1) * Number(limit);
        const total = await User.countDocuments(query);
        const profs = await User
            .find(query)
            .sort({ 'profissional.isPatrocinado': -1, 'profissional.avaliacao': -1 })
            .skip(skip)
            .limit(Number(limit))
            .select('-senha -resetToken -resetTokenExpiry -cpfCnpj');

        return R.success(res, {
            profissionais: profs,
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

// BUSCAR PROFISSIONAL POR ID
exports.getProfissionalById = async (req, res) => {
    try {
        const user = await User
            .findById(req.params.id)
            .select('-senha -resetToken -resetTokenExpiry -cpfCnpj');

        if (!user || user.tipo !== 'profissional') {
            return R.notFound(res, 'Profissional não encontrado.');
        }

        const avaliacoes = await Avaliacao
            .find({ profissionalId: user._id })
            .populate('clienteId', 'nome fotoUrl')
            .sort({ createdAt: -1 })
            .limit(10)
            .select('-feedbackPrivado');

        return R.success(res, { profissional: user, avaliacoes });
    } catch (err) {
        return R.serverError(res, err);
    }
};

// ATUALIZAR PERFIL
exports.updateProfile = async (req, res) => {
    try {
        const { descricao, projetos, fotoUrl, redesSociais, whatsapp, cidade, banner, tipoServico } = req.body;
        const user = await User.findById(req.user._id);

        if (!user) return R.notFound(res, 'Usuário não encontrado.');

        if (fotoUrl !== undefined) user.fotoUrl = fotoUrl;
        if (banner && user.profissional) user.profissional.banner = banner;

        if (user.profissional) {
            if (descricao     !== undefined) user.profissional.descricao    = descricao;
            if (projetos      !== undefined) user.profissional.projetos     = projetos;
            if (redesSociais  !== undefined) user.profissional.redesSociais = redesSociais;
            if (whatsapp      !== undefined) user.profissional.whatsapp     = whatsapp ? whatsapp.replace(/\D/g, '') : '';
            if (cidade        !== undefined) user.profissional.cidade       = cidade;
            if (tipoServico   !== undefined) user.profissional.tipoServico  = tipoServico;
        }

        await user.save();
        return R.success(res, { message: 'Perfil atualizado!', user: user.toSafeObject() });
    } catch (err) {
        return R.serverError(res, err);
    }
};

// ATUALIZAR CONFIGURAÇÕES
exports.updateConfig = async (req, res) => {
    try {
        const { telefone, endereco, cidade, notificacoes } = req.body;
        const user = await User.findById(req.user._id);

        if (!user) return R.notFound(res, 'Usuário não encontrado.');

        if (telefone     !== undefined) user.telefone     = telefone ? telefone.replace(/\D/g, '') : null;
        if (endereco     !== undefined) user.endereco     = endereco;
        if (cidade       !== undefined) user.cidade       = cidade;
        if (notificacoes !== undefined) user.notificacoes = notificacoes;

        // sincroniza cidade no subdoc profissional
        if (cidade !== undefined && user.profissional) {
            user.profissional.cidade = cidade;
        }

        await user.save();
        return R.success(res, { message: 'Configurações salvas!', user: user.toSafeObject() });
    } catch (err) {
        return R.serverError(res, err);
    }
};

// CATEGORIAS
exports.getCategorias = async (req, res) => {
    try {
        const cats = await Categoria.find({ ativa: true }).sort({ ordem: 1, nome: 1 });

        // fallback: usa distinct se o model estiver vazio
        if (!cats.length) {
            const strings = await User.distinct('profissional.categoria', {
                tipo: 'profissional', blocked: { $ne: true },
            });
            const lista = strings.filter(Boolean).sort().map(nome => ({ nome, icone: '🛠️' }));
            return R.success(res, { categorias: lista });
        }

        return R.success(res, { categorias: cats });
    } catch (err) {
        return R.serverError(res, err);
    }
};
