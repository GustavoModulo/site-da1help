const formLogin = document.querySelector('form');

if (formLogin) {
    formLogin.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const email = document.getElementById('email').value;
        const senha = document.getElementById('password').value;
        const btn = document.querySelector('.btn-submit');
        
        btn.innerText = 'Entrando...';
        btn.disabled = true;

        try {
            const res = await fetch('http://127.0.0.1:3000/api/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, senha })
            });

            const data = await res.json();

            if (res.ok) {
                // Salva os dados do usuário no navegador
                localStorage.setItem('da1help_user', JSON.stringify(data));
                saveUserToCookie(data); // Salva em cookie também
                // Manda para a página de Perfil/Dashboard
                window.location.href = 'perfil.html';
            } else {
                alert("❌ " + data.error);
            }
        } catch (err) {
            alert("❌ Erro de conexão com o servidor.");
        } finally {
            btn.innerText = 'Entrar na Plataforma';
            btn.disabled = false;
        }
    });
}