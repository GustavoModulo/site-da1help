'use strict';

const { Resend } = require('resend');

// RESEND
let _resend = null;
function getResend() {
    if (!_resend) _resend = new Resend(process.env.RESEND_API_KEY);
    return _resend;
}

const FROM    = () => process.env.EMAIL_FROM || 'Da1Help <onboarding@resend.dev>';
const APP_URL = () => process.env.APP_URL    || 'http://localhost:3000';

// TEMPLATE BASE
function wrapTemplate(content) {
    return `<!DOCTYPE html>
<html lang="pt-br">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<style>
  *{box-sizing:border-box;margin:0;padding:0}
  body{font-family:'Segoe UI',Arial,sans-serif;background:#f3f4f6;padding:32px 16px}
  .container{max-width:560px;margin:0 auto;background:#ffffff;border-radius:20px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,.08)}
  .header{background:linear-gradient(135deg,#7c3aed,#1d4ed8);padding:36px 40px;text-align:center}
  .logo{font-size:2rem;font-weight:800;color:#fff;letter-spacing:-2px;text-decoration:none}
  .logo span{opacity:.65}
  .body{padding:36px 40px}
  h2{font-size:1.35rem;font-weight:700;color:#111827;margin-bottom:12px}
  p{color:#4b5563;font-size:.95rem;line-height:1.7;margin-bottom:16px}
  .btn{display:block;text-align:center;background:linear-gradient(135deg,#7c3aed,#1d4ed8);color:#ffffff!important;font-weight:700;font-size:1rem;padding:16px 32px;border-radius:999px;text-decoration:none;margin:24px 0}
  .quote{background:#f9fafb;border-left:4px solid #7c3aed;padding:14px 18px;border-radius:0 10px 10px 0;margin:16px 0;color:#374151;font-style:italic}
  .link-box{background:#f3f4f6;border-radius:10px;padding:12px 16px;margin:12px 0;word-break:break-all;font-size:.85rem;color:#6d28d9}
  .divider{height:1px;background:#f3f4f6;margin:20px 0}
  .note{font-size:.82rem;color:#9ca3af}
  .footer{padding:24px 40px;text-align:center;background:#f9fafb;border-top:1px solid #f3f4f6}
  .footer p{font-size:.78rem;color:#9ca3af}
</style>
</head>
<body>
<div class="container">
  <div class="header">
    <span class="logo">Da1Help<span>.</span></span>
  </div>
  <div class="body">${content}</div>
  <div class="footer">
    <p>© ${new Date().getFullYear()} Da1Help. — Todos os direitos reservados.</p>
    <p style="margin-top:4px">Se não solicitou este e-mail, pode ignorá-lo com segurança.</p>
  </div>
</div>
</body>
</html>`;
}

// ENVIO GENÉRICO
async function sendMail({ to, subject, html }) {
    const apiKey = process.env.RESEND_API_KEY;

    if (!apiKey || apiKey.startsWith('re_COLE') || apiKey === '') {
        console.log('\n📧  [E-MAIL SIMULADO — RESEND_API_KEY não configurada]');
        console.log(`    Para: ${to}`);
        console.log(`    Assunto: ${subject}\n`);
        return { success: true, simulated: true };
    }

    try {
        const { data, error } = await getResend().emails.send({
            from:    FROM(),
            to:      [to],
            subject,
            html,
        });

        if (error) {
            console.error('❌  Resend error:', JSON.stringify(error));
            return { success: false, error };
        }

        console.log(`✅  E-mail enviado → ${to}  [id: ${data?.id}]`);
        return { success: true, id: data?.id };
    } catch (err) {
        console.error('❌  Falha ao enviar e-mail:', err.message);
        return { success: false, error: err.message };
    }
}

// BOAS-VINDAS
async function sendWelcomeEmail({ to, nome }) {
    const html = wrapTemplate(`
        <h2>Bem-vindo ao Da1Help, ${nome}! 🎉</h2>
        <p>Sua conta foi criada com sucesso. Agora você pode encontrar os melhores profissionais da sua região ou oferecer seus próprios serviços.</p>
        <a href="${APP_URL()}/searchpage.html" class="btn">🔍 Explorar Profissionais</a>
        <div class="divider"></div>
        <p class="note">Dúvidas? Acesse <a href="${APP_URL()}/contatopage.html" style="color:#6d28d9">nossa página de contato</a>.</p>
    `);
    return sendMail({ to, subject: '🎉 Bem-vindo ao Da1Help!', html });
}

// RESET DE SENHA
async function sendResetPasswordEmail({ to, nome, token }) {
    const resetUrl = `${APP_URL()}/reset-senha.html?token=${token}`;
    const html = wrapTemplate(`
        <h2>Redefinição de senha 🔑</h2>
        <p>Olá, <strong>${nome}</strong>! Recebemos uma solicitação para redefinir a senha da sua conta no Da1Help.</p>
        <p>Clique no botão abaixo para criar uma nova senha:</p>
        <a href="${resetUrl}" class="btn">Criar nova senha</a>
        <div class="divider"></div>
        <p class="note">Ou copie e cole este link no seu navegador:</p>
        <div class="link-box">${resetUrl}</div>
        <p class="note">⏱ Este link expira em <strong>1 hora</strong>. Se não foi você quem solicitou, ignore este e-mail — sua senha continua a mesma.</p>
    `);
    return sendMail({ to, subject: '🔑 Redefinição de senha — Da1Help.', html });
}

// NOTIFICAÇÃO DE MENSAGEM
async function sendNewMessageNotification({ to, nomeDestinatario, nomeRemetente, preview, chatUrl }) {
    const html = wrapTemplate(`
        <h2>Nova mensagem recebida 💬</h2>
        <p>Olá, <strong>${nomeDestinatario}</strong>! Você recebeu uma mensagem de <strong>${nomeRemetente}</strong>:</p>
        <div class="quote">"${preview}"</div>
        <a href="${chatUrl}" class="btn">💬 Responder mensagem</a>
        <div class="divider"></div>
        <p class="note">Para parar de receber estas notificações, acesse Configurações → Notificações.</p>
    `);
    return sendMail({ to, subject: `💬 Nova mensagem de ${nomeRemetente} — Da1Help.`, html });
}

module.exports = { sendMail, sendWelcomeEmail, sendResetPasswordEmail, sendNewMessageNotification };
