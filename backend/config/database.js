'use strict';

const mongoose = require('mongoose');

// CONEXÃO MONGODB
const connectDB = async () => {
    try {
        const conn = await mongoose.connect(process.env.MONGO_URI, {
            serverSelectionTimeoutMS: 5000,
            socketTimeoutMS: 45000,
        });

        console.log(`✅ MongoDB Atlas conectado: ${conn.connection.host}`);

        mongoose.connection.on('error', (err) => {
            console.error('❌ Erro na conexão MongoDB:', err.message);
        });

        mongoose.connection.on('disconnected', () => {
            console.warn('⚠️  MongoDB desconectado. Tentando reconectar...');
        });

    } catch (err) {
        console.error('❌ Falha ao conectar ao MongoDB:', err.message);
        process.exit(1);
    }
};

module.exports = connectDB;
