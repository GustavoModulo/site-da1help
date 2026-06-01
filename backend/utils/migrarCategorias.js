'use strict';

/**
 * Script de migração: converte profissional.categoria de String → [String]
 * para usuários cadastrados antes da mudança de schema.
 *
 * Executar UMA VEZ:
 *   node utils/migrarCategorias.js
 */

require('dotenv').config();
const mongoose = require('mongoose');

async function migrar() {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ Conectado ao MongoDB Atlas');

    const db = mongoose.connection.db;
    const collection = db.collection('users');

    // Busca todos os profissionais onde categoria NÃO é array
    const cursor = collection.find({
        tipo: 'profissional',
        'profissional.categoria': { $exists: true, $not: { $type: 'array' } },
    });

    let count = 0;
    while (await cursor.hasNext()) {
        const doc = await cursor.next();
        const cat = doc.profissional?.categoria;

        let novaCategoria = [];
        if (typeof cat === 'string' && cat.trim()) {
            novaCategoria = [cat.trim()];
        } else if (cat === null || cat === undefined) {
            novaCategoria = [];
        }

        await collection.updateOne(
            { _id: doc._id },
            { $set: { 'profissional.categoria': novaCategoria } }
        );
        count++;
        console.log(`  Migrado: ${doc.nome} → [${novaCategoria.join(', ')}]`);
    }

    console.log(`\n✅ Migração concluída: ${count} usuário(s) atualizados.`);
    await mongoose.disconnect();
}

migrar().catch((err) => {
    console.error('❌ Erro na migração:', err);
    process.exit(1);
});
