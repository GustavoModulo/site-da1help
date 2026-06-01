'use strict';

const crypto          = require('crypto');
const User            = require('../models/User');
const { generateToken } = require('../utils/jwt');
const R               = require('../utils/response');

// ─── Registrar ────────────────────────────────────────────────────────────────
exports.register = async (req, res) => {
    try {
        const { nome, email, senha, cpfCnpj, tipo, profissional } = req.body;

        // Verifica email/CPF duplicado antes de tentar salvar
        const existing = await User.findOne({
            $or: [{ email }, { cpfCnpj }],
        });

        if (existing) {
            const field = existing.email === email ? 'Email' : 'CPF/CNPJ';
            return R.conflict(res, `${field} já cadastrado.`);
        }

        const userData = { nome, email, senha, cpfCnpj };

        // Se quiser se cadastrar já como profissional
        if (tipo === 'profissional' && profissional) {
            userData.tipo = 'profissional';
            userData.profissional = {
                categoria:  profissional.categoria || '',
                whatsapp:   profissional.whatsapp  || '',
                descricao:  profissional.descricao || 'Novo profissional na plataforma Da1Help.',
                projetos:   [],
                avaliacao:  0,
            };
        }

        // Admin seed pelo .env
        if (email === process.env.ADMIN_EMAIL) {
            userData.tipo = 'admin';
        }

        const user = await User.create(userData);

        return R.created(res, {
            message: 'Conta criada com sucesso! Faça login para continuar.',
            userId:  user._id,
        });
    } catch (err) {
        if (err.code === 11000) {
            return R.conflict(res, 'Email ou CPF/CNPJ já cadastrado.');
        }
        return R.serverError(res, err);
    }
};

// ─── Login ───────────────────────────────────────────────────────────────────
exports.login = async (req, res) => {
    try {
        const { email, senha } = req.body;

        // select('+senha') porque o campo tem select:false no schema
        const user = await User.findOne({ email }).select('+senha');

        if (!user || !(await user.comparePassword(senha))) {
            return R.unauthorized(res, 'Email ou senha incorretos.');
        }

        if (user.blocked) {
            return R.forbidden(res, 'Sua conta foi suspensa. Entre em contato com o suporte.');
        }

        const token = generateToken(user);

        return R.success(res, {
            message: 'Login realizado com sucesso!',
            token,
            user: user.toSafeObject(),
        });
    } catch (err) {
        return R.serverError(res, err);
    }
};

// ─── Upgrade: Cliente → Profissional ─────────────────────────────────────────
exports.upgradePro = async (req, res) => {
    try {
        const { categoria, whatsapp, descricao, cidade } = req.body;

        // req.user vem do middleware authenticate — sem IDOR possível
        const user = await User.findById(req.user._id);

        if (!user) return R.notFound(res, 'Usuário não encontrado.');
        if (user.tipo === 'profissional') {
            return R.conflict(res, 'Você já é um profissional.');
        }

        user.tipo = 'profissional';
        user.profissional = {
            categoria,
            whatsapp,
            descricao,
            cidade:   cidade || null,
            projetos: [],
            avaliacao: 0,
            totalAvaliacoes: 0,
        };

        await user.save();

        const token = generateToken(user);

        return R.success(res, {
            message: 'Parabéns! Agora você é um profissional Da1Help.',
            token,
            user: user.toSafeObject(),
        });
    } catch (err) {
        return R.serverError(res, err);
    }
};

// ─── Esqueci a Senha ──────────────────────────────────────────────────────────
exports.forgotPassword = async (req, res) => {
    try {
        const { email } = req.body;
        const user = await User.findOne({ email });

        // Resposta genérica para não vazar se o email existe
        const genericMsg = 'Se este email estiver cadastrado, você receberá as instruções em breve.';

        if (!user) return R.success(res, { message: genericMsg });

        const token = crypto.randomBytes(32).toString('hex');
        user.resetToken       = token;
        user.resetTokenExpiry = Date.now() + 3_600_000; // 1 hora
        await user.save();

        // Em produção: enviar email com o link
        // await sendResetEmail(user.email, token);
        console.log(`🔑 Token de reset para ${email}: ${token}`);

        return R.success(res, { message: genericMsg });
    } catch (err) {
        return R.serverError(res, err);
    }
};

// ─── Reset de Senha ───────────────────────────────────────────────────────────
exports.resetPassword = async (req, res) => {
    try {
        const { token, novaSenha } = req.body;

        const user = await User.findOne({
            resetToken:       token,
            resetTokenExpiry: { $gt: Date.now() },
        }).select('+resetToken +resetTokenExpiry');

        if (!user) {
            return R.badRequest(res, 'Token inválido ou expirado.');
        }

        user.senha            = novaSenha;
        user.resetToken       = null;
        user.resetTokenExpiry = null;
        await user.save();

        return R.success(res, { message: 'Senha redefinida com sucesso! Faça login.' });
    } catch (err) {
        return R.serverError(res, err);
    }
};

// ─── Dados do usuário logado ──────────────────────────────────────────────────
exports.getMe = async (req, res) => {
    try {
        const user = await User.findById(req.user._id);
        if (!user) return R.notFound(res, 'Usuário não encontrado.');
        return R.success(res, { user: user.toSafeObject() });
    } catch (err) {
        return R.serverError(res, err);
    }
};
