const searchInput = document.querySelector('.search-input');
const searchBtn = document.querySelector('.search-btn');

function irParaBusca() {
    const termo = searchInput.value.trim();
    if (termo !== "") {
        // Salva o termo na memória do navegador e muda de página
        localStorage.setItem('termoBusca', termo);
        window.location.href = 'searchpage.html';
    } else {
        window.location.href = 'searchpage.html';
    }
}

searchBtn.addEventListener('click', irParaBusca);

searchInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') irParaBusca();
});