const checkProf = document.getElementById('check-profissional');
const camposProf = document.getElementById('campos-profissional');
const form = document.getElementById('form-registro');

// Mostrar/Esconder campos de profissional
if (checkProf) {
    checkProf.addEventListener('change', () => {
        camposProf.style.display = checkProf.checked ? 'block' : 'none';
    });
}

if (form) {
    form.addEventListener('submit', async (e) => {
        e.preventDefault();

        const btn = document.getElementById('btn-cadastrar');
        btn.innerText = 'Processando...';
        btn.disabled = true;

        const payload = {
            nome: document.getElementById('nome').value,
            email: document.getElementById('email').value,
            senha: document.getElementById('password').value,
            cpfCnpj: document.getElementById('cpfCnpj').value,
            tipo: checkProf.checked ? 'profissional' : 'cliente'
        };

        if (checkProf.checked) {
            payload.profissional = {
                categoria: document.getElementById('categoria').value,
                whatsapp: document.getElementById('whatsapp').value,
                descricao: "Novo profissional na plataforma Da1Help."
            };
        }

        try {
            const res = await fetch('http://127.0.0.1:3000/api/auth/register', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });

            const data = await res.json();

            if (res.ok) {
                alert("✅ Conta criada com sucesso!");
                window.location.href = 'loginpage.html';
            } else {
                alert("❌ Erro: " + data.error);
            }
        } catch (err) {
            alert("❌ Erro ao conectar no servidor. O Node.js está rodando?");
        } finally {
            btn.innerText = 'Criar minha conta';
            btn.disabled = false;
        }
    });
}