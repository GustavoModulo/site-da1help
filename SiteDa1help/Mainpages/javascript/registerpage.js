const form = document.querySelector('form');

form.addEventListener('submit', (e) => {
    e.preventDefault();
    
    const nome = document.getElementById('nome').value;
    const email = document.getElementById('email').value;
    const senha = document.getElementById('password').value;

    if (senha.length < 6) {
        alert("A senha deve ter pelo menos 6 caracteres.");
        return;
    }

    console.log("Cadastro realizado:", { nome, email });
    alert(`Bem-vindo, ${nome}! Sua conta foi simulada com sucesso.`);
    window.location.href = 'loginpage.html';
});