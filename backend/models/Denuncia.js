'use strict';

const mongoose = require('mongoose');

const denunciaSchema = new mongoose.Schema(
    {
        denunciadoId: {
            type:     mongoose.Schema.Types.ObjectId,
            ref:      'User',
            required: true,
            index:    true,
        },
        denuncianteId: {
            type:     mongoose.Schema.Types.ObjectId,
            ref:      'User',
            required: true,
        },
        motivo: {
            type:     String,
            required: [true, 'Motivo é obrigatório'],
            enum: [
                'perfil_falso',
                'fraude',
                'comportamento_abusivo',
                'servico_nao_entregue',
                'conteudo_inapropriado',
                'outro',
            ],
        },
        descricao: {
            type:    String,
            trim:    true,
            required: [true, 'Descrição é obrigatória'],
            maxlength: [1000, 'Descrição deve ter no máximo 1000 caracteres'],
        },
        status: {
            type:    String,
            enum:    ['pendente', 'em_analise', 'resolvida', 'arquivada'],
            default: 'pendente',
            index:   true,
        },
        resolucao: {
            type:    String,
            trim:    true,
            default: null,
        },
        resolvidaPor: {
            type:    mongoose.Schema.Types.ObjectId,
            ref:     'User',
            default: null,
        },
        resolvidaEm: {
            type:    Date,
            default: null,
        },
    },
    {
        timestamps: true,
        versionKey: false,
    }
);

module.exports = mongoose.model('Denuncia', denunciaSchema);
