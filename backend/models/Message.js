'use strict';

const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema(
    {
        remetenteId: {
            type:     mongoose.Schema.Types.ObjectId,
            ref:      'User',
            required: true,
            index:    true,
        },
        destinatarioId: {
            type:     mongoose.Schema.Types.ObjectId,
            ref:      'User',
            required: true,
            index:    true,
        },
        texto: {
            type:      String,
            required:  [true, 'Mensagem não pode ser vazia'],
            trim:      true,
            maxlength: [2000, 'Mensagem deve ter no máximo 2000 caracteres'],
        },
        lida: {
            type:    Boolean,
            default: false,
        },
    },
    {
        timestamps: true,
        versionKey: false,
    }
);

// ÍNDICE DE HISTÓRICO
messageSchema.index({ remetenteId: 1, destinatarioId: 1, createdAt: 1 });

module.exports = mongoose.model('Message', messageSchema);
