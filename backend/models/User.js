'use strict';

const mongoose = require('mongoose');
const bcrypt   = require('bcryptjs');

const userSchema = new mongoose.Schema(
    {
        nome: {
            type:     String,
            required: [true, 'Nome é obrigatório'],
            trim:     true,
            minlength: [2, 'Nome deve ter pelo menos 2 caracteres'],
            maxlength: [100, 'Nome deve ter no máximo 100 caracteres'],
        },
        email: {
            type:      String,
            required:  [true, 'Email é obrigatório'],
            unique:    true,
            lowercase: true,
            trim:      true,
            match:     [/^\S+@\S+\.\S+$/, 'Email inválido'],
        },
        senha: {
            type:     String,
            required: [true, 'Senha é obrigatória'],
            minlength: [6, 'Senha deve ter pelo menos 6 caracteres'],
            select:   false,
        },
        cpfCnpj: {
            type:   String,
            required: [true, 'CPF ou CNPJ é obrigatório'],
            unique: true,
            trim:   true,
        },
        tipo: {
            type:    String,
            enum:    ['cliente', 'profissional', 'admin'],
            default: 'cliente',
        },
        fotoUrl: {
            type:    String,
            default: 'images/Default_FotoPerfil.png',
        },
        telefone: {
            type:  String,
            trim:  true,
            default: null,
        },
        endereco: {
            type:  String,
            trim:  true,
            default: null,
        },
        cidade: {
            type:  String,
            trim:  true,
            default: null,
        },
        notificacoes: {
            type:    Boolean,
            default: true,
        },
        blocked: {
            type:    Boolean,
            default: false,
        },
        blockedReason: {
            type:    String,
            default: null,
        },
        blockedAt: {
            type:    Date,
            default: null,
        },

        // RECUPERAÇÃO DE SENHA
        resetToken:       { type: String,  default: null, select: false },
        resetTokenExpiry: { type: Date,    default: null, select: false },

        // DADOS DO PROFISSIONAL
        profissional: {
            categoria:    { type: [{ type: String, trim: true }], default: [] },
            whatsapp:     { type: String, trim: true, default: null },
            descricao:    { type: String, trim: true, default: null },
            banner:       { type: String, default: null },
            tipoServico:  { type: String, enum: ['presencial', 'remoto', 'ambos'], default: 'presencial' },
            cidade:      { type: String, trim: true, default: null },
            avaliacao:   { type: Number, default: 0, min: 0, max: 5 },
            totalAvaliacoes: { type: Number, default: 0 },
            projetos:    { type: [{ type: String, trim: true }], default: [] },
            isPatrocinado: { type: Boolean, default: false },
            ativo:       { type: Boolean, default: true },
            redesSociais: {
                instagram:   { type: String, default: null },
                googleFotos: { type: String, default: null },
                linkedin:    { type: String, default: null },
            },
        },
    },
    {
        timestamps: true,
        versionKey: false,
    }
);

// ÍNDICES
userSchema.index({ tipo: 1, blocked: 1 });
userSchema.index({ 'profissional.categoria': 'text', nome: 'text' });
userSchema.index({ 'profissional.avaliacao': -1 });

// HASH DE SENHA
userSchema.pre('save', async function () {
    if (!this.isModified('senha')) return;
    this.senha = await bcrypt.hash(this.senha, 12);
});

// COMPARAR SENHA
userSchema.methods.comparePassword = async function (senhaPlana) {
    return bcrypt.compare(senhaPlana, this.senha);
};

// SERIALIZAÇÃO SEGURA
userSchema.methods.toSafeObject = function () {
    const obj = this.toObject();
    delete obj.senha;
    delete obj.resetToken;
    delete obj.resetTokenExpiry;
    delete obj.__v;
    return obj;
};

module.exports = mongoose.model('User', userSchema);
