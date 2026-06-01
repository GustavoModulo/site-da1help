'use strict';

const mongoose = require('mongoose');

const categoriaSchema = new mongoose.Schema(
    {
        nome: {
            type:      String,
            required:  [true, 'Nome é obrigatório'],
            unique:    true,
            trim:      true,
            maxlength: [80, 'Nome deve ter no máximo 80 caracteres'],
        },
        icone: {
            type:    String,
            default: '🛠️',
        },
        ativa: {
            type:    Boolean,
            default: true,
            index:   true,
        },
        ordem: {
            type:    Number,
            default: 0,
        },
    },
    {
        timestamps: true,
        versionKey: false,
    }
);

module.exports = mongoose.model('Categoria', categoriaSchema);
