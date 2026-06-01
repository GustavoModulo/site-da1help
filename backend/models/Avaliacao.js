'use strict';

const mongoose = require('mongoose');

const avaliacaoSchema = new mongoose.Schema(
    {
        profissionalId: {
            type:     mongoose.Schema.Types.ObjectId,
            ref:      'User',
            required: true,
            index:    true,
        },
        clienteId: {
            type:     mongoose.Schema.Types.ObjectId,
            ref:      'User',
            required: true,
        },
        nota: {
            type:     Number,
            required: [true, 'Nota é obrigatória'],
            min:      [1, 'Nota mínima é 1'],
            max:      [5, 'Nota máxima é 5'],
        },
        comentario: {
            type:    String,
            trim:    true,
            maxlength: [500, 'Comentário deve ter no máximo 500 caracteres'],
            default: null,
        },
        // visível apenas para admins
        feedbackPrivado: {
            type:   String,
            trim:   true,
            select: false,
            default: null,
        },
    },
    {
        timestamps: true,
        versionKey: false,
    }
);

// UM CLIENTE SÓ AVALIA UMA VEZ
avaliacaoSchema.index({ profissionalId: 1, clienteId: 1 }, { unique: true });

module.exports = mongoose.model('Avaliacao', avaliacaoSchema);
