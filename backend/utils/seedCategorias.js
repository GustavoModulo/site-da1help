'use strict';

// SEED DE CATEGORIAS PADRÃO
const Categoria = require('../models/Categoria');

const CATEGORIAS_PADRAO = [
    { nome: 'Eletricista',            icone: '⚡', ordem: 1  },
    { nome: 'Encanador',              icone: '🔧', ordem: 2  },
    { nome: 'Pintor',                 icone: '🎨', ordem: 3  },
    { nome: 'Pedreiro',               icone: '🏗️', ordem: 4  },
    { nome: 'Faxineira / Limpeza',    icone: '🧹', ordem: 5  },
    { nome: 'Jardineiro',             icone: '🌿', ordem: 6  },
    { nome: 'Mecânico',               icone: '🔩', ordem: 7  },
    { nome: 'Marceneiro',             icone: '🪚', ordem: 8  },
    { nome: 'Designer Gráfico',       icone: '✨', ordem: 9  },
    { nome: 'Programador / Dev Web',  icone: '💻', ordem: 10 },
    { nome: 'Técnico de Informática', icone: '🖥️', ordem: 11 },
    { nome: 'Professor Particular',   icone: '📚', ordem: 12 },
    { nome: 'Fotógrafo',              icone: '📸', ordem: 13 },
    { nome: 'Motorista / Transporte', icone: '🚗', ordem: 14 },
    { nome: 'Chef / Cozinheiro',      icone: '👨‍🍳', ordem: 15 },
    { nome: 'Personal Trainer',       icone: '💪', ordem: 16 },
    { nome: 'Cuidador de Idosos',     icone: '🤲', ordem: 17 },
    { nome: 'Babá / Cuidador Inf.',   icone: '👶', ordem: 18 },
    { nome: 'Contador',               icone: '💰', ordem: 19 },
    { nome: 'Marketing Digital',      icone: '📈', ordem: 20 },
];

const seedCategorias = async () => {
    const total = await Categoria.countDocuments();
    if (total > 0) return;

    await Categoria.insertMany(CATEGORIAS_PADRAO);
    console.log(`✅ ${CATEGORIAS_PADRAO.length} categorias padrão inseridas.`);
};

module.exports = seedCategorias;
