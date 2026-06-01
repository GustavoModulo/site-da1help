'use strict';

const mongoose = require('mongoose');

const anuncioSchema = new mongoose.Schema(
    {
        profissionalId: {
            type:     mongoose.Schema.Types.ObjectId,
            ref:      'User',
            required: true,
            index:    true,
        },
        titulo: {
            type:      String,
            required:  [true, 'Título é obrigatório'],
            trim:      true,
            minlength: [5, 'Título deve ter pelo menos 5 caracteres'],
            maxlength: [100, 'Título deve ter no máximo 100 caracteres'],
        },
        descricao: {
            type:      String,
            required:  [true, 'Descrição é obrigatória'],
            trim:      true,
            minlength: [20, 'Descrição deve ter pelo menos 20 caracteres'],
            maxlength: [2000, 'Descrição deve ter no máximo 2000 caracteres'],
        },
        categoria: {
            type:     String,
            required: [true, 'Categoria é obrigatória'],
            trim:     true,
            index:    true,
        },
        tipoServico: {
            type:    String,
            enum:    ['presencial', 'remoto', 'ambos'],
            default: 'presencial',
        },
        valor: {
            tipo:  String, // fixo | hora | consultar
            valor: { type: Number, default: null },
        },
        regiaoAtendida: {
            type:  String,
            trim:  true,
            default: null,
        },
        prazo: {
            type:  String,
            trim:  true,
            default: null,
        },
        contato: {
            type:  String,
            trim:  true,
            default: null,
        },
        tags: {
            type:    [String],
            default: [],
        },
        imagemUrl: {
            type:    String,
            default: null,
        },
        status: {
            type:    String,
            enum:    ['ativo', 'pausado', 'removido'],
            default: 'ativo',
            index:   true,
        },
        visualizacoes: {
            type:    Number,
            default: 0,
        },
        destacado: {
            type:    Boolean,
            default: false,
        },
    },
    {
        timestamps: true,
        versionKey: false,
    }
);

// ÍNDICES
anuncioSchema.index({ titulo: 'text', descricao: 'text', tags: 'text' });
anuncioSchema.index({ categoria: 1, status: 1 });
anuncioSchema.index({ createdAt: -1 });

module.exports = mongoose.model('Anuncio', anuncioSchema);
