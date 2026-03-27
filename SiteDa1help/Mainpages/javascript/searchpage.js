const searchInput = document.getElementById('campo-busca');
const resultItems = document.querySelectorAll('.result-item');

function filtrar() {
    const termo = searchInput.value.toLowerCase();
    resultItems.forEach(item => {
        const texto = item.innerText.toLowerCase();
        item.style.display = texto.includes(termo) ? 'flex' : 'none';
    });
}

// Verifica se existe um termo vindo da Homepage
window.addEventListener('DOMContentLoaded', () => {
    const termoSalvo = localStorage.getItem('termoBusca');
    if (termoSalvo) {
        searchInput.value = termoSalvo;
        filtrar();
        localStorage.removeItem('termoBusca'); // Limpa após usar
    }
});

searchInput.addEventListener('input', filtrar);