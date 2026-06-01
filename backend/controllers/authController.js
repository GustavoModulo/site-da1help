'use strict';

const crypto              = require('crypto');
const User                = require('../models/User');
const { generateToken }   = require('../utils/jwt');
const R                   = require('../utils/response');
const { sendWelcomeEmail, sendResetPasswordEmail } = require('../utils/emailService');

// CADASTRO
exports.register = async (req, res) => {
    try {
        const { nome, email, senha, cpfCnpj, tipo, profissional } = req.body;

        const existing = await User.findOne({ $or: [{ email }, { cpfCnpj }] });
        if (existing) {
            const field = existing.email === email ? 'Email' : 'CPF/CNPJ';
            return R.conflict(res, `${field} já cadastrado.`);
        }

        const userData = { nome, email, senha, cpfCnpj };

        if (tipo === 'profissional' && profissional) {
            userData.tipo = 'profissional';
            const categorias = Array.isArray(profissional.categoria)
                ? profissional.categoria.filter(Boolean)
                : (profissional.categoria ? [profissional.categoria] : []);

            userData.profissional = {
                categoria:       categorias,
                whatsapp:        profissional.whatsapp ? profissional.whatsapp.replace(/\D/g, '') : '',
                descricao:       profissional.descricao || 'Novo profissional na plataforma Da1Help.',
                projetos:        [],
                avaliacao:       0,
                totalAvaliacoes: 0,
            };
        }

        if (email === process.env.ADMIN_EMAIL) userData.tipo = 'admin';

        const user = await User.create(userData);

        sendWelcomeEmail({ to: user.email, nome: user.nome })
            .catch((err) => console.error('❌  Boas-vindas e-mail falhou:', err.message));

        return R.created(res, {
            message: 'Conta criada com sucesso! Faça login para continuar.',
            userId:  user._id,
        });
    } catch (err) {
        if (err.code === 11000) return R.conflict(res, 'Email ou CPF/CNPJ já cadastrado.');
        return R.serverError(res, err);
    }
};

// LOGIN
exports.login = async (req, res) => {
    try {
        const { email, senha } = req.body;
        const user = await User.findOne({ email }).select('+senha');

        if (!user || !(await user.comparePassword(senha))) {
            return R.unauthorized(res, 'Email ou senha incorretos.');
        }
        if (user.blocked) {
            return R.forbidden(res, 'Sua conta foi suspensa. Entre em contato com o suporte.');
        }

        const token = generateToken(user);
        return R.success(res, { message: 'Login realizado!', token, user: user.toSafeObject() });
    } catch (err) {
        return R.serverError(res, err);
    }
};

// UPGRADE PARA PROFISSIONAL
exports.upgradePro = async (req, res) => {
    try {
        const { categoria, whatsapp, descricao, cidade } = req.body;
        const user = await User.findById(req.user._id);

        if (!user) return R.notFound(res, 'Usuário não encontrado.');
        if (user.tipo === 'profissional') return R.conflict(res, 'Você já é um profissional.');

        const categorias = Array.isArray(categoria)
            ? categoria.filter(c => typeof c === 'string' && c.trim())
            : (categoria ? [categoria.toString().trim()] : []);

        if (!categorias.length) return R.badRequest(res, 'Selecione pelo menos uma categoria.');

        user.tipo = 'profissional';
        user.profissional = {
            categoria:       categorias,
            whatsapp:        whatsapp ? whatsapp.replace(/\D/g, '') : '',
            descricao:       descricao || '',
            cidade:          cidade || null,
            projetos:        [],
            avaliacao:       0,
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

// ESQUECI A SENHA
exports.forgotPassword = async (req, res) => {
    try {
        const { email } = req.body;
        const genericMsg = 'Se este email estiver cadastrado, você receberá as instruções em breve.';
        const user = await User.findOne({ email });

        if (!user) return R.success(res, { message: genericMsg });

        const rawToken    = crypto.randomBytes(32).toString('hex');
        const hashedToken = crypto.createHash('sha256').update(rawToken).digest('hex');

        user.resetToken       = hashedToken;
        user.resetTokenExpiry = Date.now() + 3_600_000;
        await user.save();

        const result = await sendResetPasswordEmail({
            to:    user.email,
            nome:  user.nome,
            token: rawToken,
        });

        if (!result.success) {
            console.warn('⚠️  Email não enviado, mas token gerado:', rawToken);
        }

        return R.success(res, { message: genericMsg });
    } catch (err) {
        return R.serverError(res, err);
    }
};

// RESET DE SENHA
exports.resetPassword = async (req, res) => {
    try {
        const { token: rawToken, novaSenha } = req.body;
        const hashedToken = crypto.createHash('sha256').update(rawToken).digest('hex');

        const user = await User.findOne({
            resetToken:       hashedToken,
            resetTokenExpiry: { $gt: Date.now() },
        }).select('+resetToken +resetTokenExpiry');

        if (!user) return R.badRequest(res, 'Token inválido ou expirado.');

        user.senha            = novaSenha;
        user.resetToken       = null;
        user.resetTokenExpiry = null;
        await user.save();

        return R.success(res, { message: 'Senha redefinida com sucesso! Faça login.' });
    } catch (err) {
        return R.serverError(res, err);
    }
};

// DADOS DO USUÁRIO LOGADO
exports.getMe = async (req, res) => {
    try {
        const user = await User.findById(req.user._id);
        if (!user) return R.notFound(res, 'Usuário não encontrado.');
        return R.success(res, { user: user.toSafeObject() });
    } catch (err) {
        return R.serverError(res, err);
    }
};
