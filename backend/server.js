'use strict';

require('dotenv').config();

const express    = require('express');
const cors       = require('cors');
const helmet     = require('helmet');
const morgan     = require('morgan');
const path       = require('path');

const connectDB        = require('./config/database');
const seedCategorias   = require('./utils/seedCategorias');
const { apiLimiter, loginLimiter, registerLimiter } = require('./middlewares/rateLimiter');

// ROTAS
const authRoutes      = require('./routes/authRoutes');
const userRoutes      = require('./routes/userRoutes');
const anuncioRoutes   = require('./routes/anuncioRoutes');
const adminRoutes     = require('./routes/adminRoutes');
const messageRoutes   = require('./routes/messageRoutes');
const uploadRoutes    = require('./routes/uploadRoutes');
const categoriaRoutes = require('./routes/categoriaRoutes');

const app  = express();
const PORT = process.env.PORT || 3000;

// BANCO DE DADOS
connectDB().then(() => seedCategorias());

// SEGURANÇA
app.use(helmet({
    contentSecurityPolicy:     false,
    crossOriginEmbedderPolicy: false,
}));

const allowedOrigins = process.env.CORS_ORIGINS
    ? process.env.CORS_ORIGINS.split(',')
    : ['http://localhost:3000', 'http://127.0.0.1:3000', 'http://127.0.0.1:5500'];

app.use(cors({
    origin: (origin, callback) => {
        if (!origin || process.env.NODE_ENV === 'development') return callback(null, true);
        if (allowedOrigins.includes(origin)) return callback(null, true);
        callback(new Error(`CORS bloqueado para origem: ${origin}`));
    },
    credentials: true,
}));

// BODY PARSING
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// PROTEÇÃO NOSQL INJECTION
app.use((req, _res, next) => {
    const sanitize = (obj) => {
        if (obj && typeof obj === 'object') {
            Object.keys(obj).forEach(key => {
                if (key.startsWith('$') || key.includes('.')) delete obj[key];
                else sanitize(obj[key]);
            });
        }
    };
    sanitize(req.body);
    sanitize(req.params);
    next();
});

// LOGGING
if (process.env.NODE_ENV !== 'test') {
    app.use(morgan(process.env.NODE_ENV === 'production' ? 'combined' : 'dev'));
}

// ARQUIVOS ESTÁTICOS
app.use('/images', express.static(path.join(__dirname, '../frontend/images')));
app.use(express.static(path.join(__dirname, '../frontend')));

// RATE LIMITERS
app.use('/api', apiLimiter);
app.use('/api/auth/login',    loginLimiter);
app.use('/api/auth/register', registerLimiter);

// ROTAS DA API
app.use('/api/auth',       authRoutes);
app.use('/api',            userRoutes);
app.use('/api/anuncios',   anuncioRoutes);
app.use('/api/admin',      adminRoutes);
app.use('/api/messages',   messageRoutes);
app.use('/api/upload',     uploadRoutes);
app.use('/api/categorias', categoriaRoutes);

// ROTA RAIZ
app.get('/', (_req, res) => res.redirect('/homepage.html'));

// HEALTH CHECK
app.get('/api/health', (_req, res) => {
    res.json({ success: true, status: 'online', version: '2.1.0', time: new Date().toISOString() });
});

// 404
app.use((req, res) => {
    res.status(404).json({ success: false, error: `Rota não encontrada: ${req.method} ${req.path}` });
});

// ERRO GLOBAL
app.use((err, _req, res, _next) => {
    console.error('❌ Unhandled error:', err);
    res.status(err.status || 500).json({
        success: false,
        error: process.env.NODE_ENV === 'production' ? 'Erro interno.' : err.message,
    });
});

// START
app.listen(PORT, () => {
    console.log(`\n🚀 Da1Help API rodando na porta ${PORT}`);
    console.log(`📡 Ambiente: ${process.env.NODE_ENV || 'development'}`);
    console.log(`🌐 Health:   http://localhost:${PORT}/api/health\n`);
});

module.exports = app;
