'use strict';

const Message = require('../models/Message');
const User    = require('../models/User');
const R       = require('../utils/response');
const { sendNewMessageNotification } = require('../utils/emailService');

// ENVIAR MENSAGEM
exports.send = async (req, res) => {
    try {
        const { destinatarioId, texto } = req.body;
        const remetenteId = req.user._id;

        if (remetenteId.toString() === destinatarioId) {
            return R.badRequest(res, 'Você não pode enviar mensagem para si mesmo.');
        }

        const destinatario = await User.findById(destinatarioId).select('nome email notificacoes');
        if (!destinatario) return R.notFound(res, 'Destinatário não encontrado.');

        const msg = await Message.create({ remetenteId, destinatarioId, texto });

        // notificação por e-mail — fire-and-forget
        if (destinatario.notificacoes !== false && destinatario.email) {
            sendNewMessageNotification({
                to:               destinatario.email,
                nomeDestinatario: destinatario.nome,
                nomeRemetente:    req.user.nome,
                preview:          texto.slice(0, 120),
                chatUrl:          `${process.env.APP_URL || 'http://localhost:3000'}/chat.html?id=${remetenteId}`,
            }).catch((err) => console.error('❌  Notif e-mail falhou:', err.message));
        }

        return R.created(res, { message: msg });
    } catch (err) {
        return R.serverError(res, err);
    }
};

// HISTÓRICO DE CONVERSA
exports.getHistorico = async (req, res) => {
    try {
        const u2 = req.params.u2;
        const u1 = req.user._id;

        const msgs = await Message
            .find({
                $or: [
                    { remetenteId: u1, destinatarioId: u2 },
                    { remetenteId: u2, destinatarioId: u1 },
                ],
            })
            .populate('remetenteId',    'nome fotoUrl')
            .populate('destinatarioId', 'nome fotoUrl')
            .sort({ createdAt: 1 })
            .limit(200);

        await Message.updateMany(
            { remetenteId: u2, destinatarioId: u1, lida: false },
            { lida: true }
        );

        return R.success(res, { mensagens: msgs });
    } catch (err) {
        return R.serverError(res, err);
    }
};

// CONVERSAS DO USUÁRIO
exports.getConversas = async (req, res) => {
    try {
        const userId = req.user._id;

        const todasMensagens = await Message
            .find({ $or: [{ remetenteId: userId }, { destinatarioId: userId }] })
            .populate('remetenteId',    'nome fotoUrl')
            .populate('destinatarioId', 'nome fotoUrl')
            .sort({ createdAt: -1 });

        const conversasMap = new Map();
        for (const msg of todasMensagens) {
            const rem      = msg.remetenteId;
            const dest     = msg.destinatarioId;
            const parceiro = rem?._id?.toString() === userId.toString() ? dest : rem;
            if (!parceiro?._id) continue;

            const key = parceiro._id.toString();
            if (!conversasMap.has(key)) {
                conversasMap.set(key, { parceiro, ultimaMensagem: msg, naoLidas: 0 });
            }
            if (dest?._id?.toString() === userId.toString() && msg.lida === false) {
                conversasMap.get(key).naoLidas++;
            }
        }

        return R.success(res, { conversas: Array.from(conversasMap.values()) });
    } catch (err) {
        return R.serverError(res, err);
    }
};

// MENSAGENS NÃO LIDAS
exports.getNaoLidas = async (req, res) => {
    try {
        const count = await Message.countDocuments({
            destinatarioId: req.user._id,
            lida: false,
        });
        return R.success(res, { total: count });
    } catch (err) {
        return R.serverError(res, err);
    }
};
