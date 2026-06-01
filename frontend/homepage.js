const searchInput = document.querySelector('.search-input');
const searchBtn = document.querySelector('.search-btn');

function realizarBusca() {
    const termo = searchInput.value.trim();
    localStorage.setItem('termoBusca', termo);
    window.location.href = 'searchpage.html';
}

searchBtn.addEventListener('click', realizarBusca);
searchInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') realizarBusca();
});