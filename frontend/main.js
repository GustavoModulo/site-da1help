// Da1Help — main.js v2.2

// DARK MODE
if (localStorage.getItem('da1help_theme') === 'dark') {
    document.documentElement.classList.add('dark-mode');
    document.body.classList.add('dark-mode');
}

function toggleDarkMode() {
    const isDark = document.body.classList.toggle('dark-mode');
    document.documentElement.classList.toggle('dark-mode', isDark);
    localStorage.setItem('da1help_theme', isDark ? 'dark' : 'light');
    const btn = document.getElementById('dark-mode-btn');
    if (btn) btn.textContent = isDark ? '☀️' : '🌙';
}

// TOAST
const Toast = (() => {
    let container = null;

    function getContainer() {
        if (container && document.body.contains(container)) return container;
        container = document.createElement('div');
        container.id = 'toast-container';
        Object.assign(container.style, {
            position: 'fixed', bottom: '30px', right: '30px',
            display: 'flex', flexDirection: 'column', gap: '10px',
            zIndex: '99999', pointerEvents: 'none',
            maxWidth: '380px', width: 'calc(100% - 40px)',
        });
        document.body.appendChild(container);

        if (!document.getElementById('toast-style')) {
            const s = document.createElement('style');
            s.id = 'toast-style';
            s.textContent = `
                @keyframes toastIn  { from { opacity:0; transform:translateX(20px) scale(.95); } to { opacity:1; transform:translateX(0) scale(1); } }
                @keyframes toastOut { from { opacity:1; transform:translateX(0) scale(1); } to { opacity:0; transform:translateX(20px) scale(.95); } }
            `;
            document.head.appendChild(s);
        }
        return container;
    }

    function show(message, type = 'info', duration = 4000) {
        const cfg = {
            success: { bg: '#f0fdf4', border: '#86efac', text: '#166534', icon: '✅' },
            error:   { bg: '#fef2f2', border: '#fca5a5', text: '#991b1b', icon: '❌' },
            warning: { bg: '#fffbeb', border: '#fcd34d', text: '#92400e', icon: '⚠️' },
            info:    { bg: '#eff6ff', border: '#93c5fd', text: '#1e40af', icon: 'ℹ️' },
        };
        const c = cfg[type] || cfg.info;

        const toast = document.createElement('div');
        Object.assign(toast.style, {
            background: c.bg, border: `1px solid ${c.border}`, color: c.text,
            padding: '13px 18px', borderRadius: '14px',
            fontSize: '.88rem', fontWeight: '500',
            display: 'flex', alignItems: 'center', gap: '10px',
            boxShadow: '0 8px 24px rgba(0,0,0,.08)',
            pointerEvents: 'all', cursor: 'pointer',
            animation: 'toastIn .3s cubic-bezier(.16,1,.3,1) forwards',
            fontFamily: "'Plus Jakarta Sans','Inter',sans-serif",
        });
        toast.innerHTML = `<span style="font-size:1rem;flex-shrink:0">${c.icon}</span><span style="flex:1">${message}</span>`;
        toast.addEventListener('click', () => dismiss(toast));

        getContainer().appendChild(toast);

        const timer = setTimeout(() => dismiss(toast), duration);
        toast._timer = timer;

        return toast;
    }

    function dismiss(toast) {
        if (!toast || !toast.parentNode) return;
        clearTimeout(toast._timer);
        toast.style.animation = 'toastOut .25s ease forwards';
        setTimeout(() => toast.remove(), 250);
    }

    return {
        success: (m, d) => show(m, 'success', d),
        error:   (m, d) => show(m, 'error',   d),
        warning: (m, d) => show(m, 'warning', d),
        info:    (m, d) => show(m, 'info',    d),
    };
})();

// LOGOUT
function logout() {
    Session.clear();
    window.location.href = 'loginpage.html';
}

// UPLOAD COM DRAG & DROP
function initUploadZone(zoneId, opts = {}) {
    const zone   = document.getElementById(zoneId);
    const input  = opts.inputId ? document.getElementById(opts.inputId) : zone?.nextElementSibling;
    if (!zone) return;

    const height = opts.height || '160px';
    zone.style.height = height;

    function setPreview(src) {
        zone.innerHTML = `<img src="${src}" alt="preview" style="width:100%;height:100%;object-fit:cover;border-radius:12px">`;
    }

    function resetZone() {
        zone.innerHTML = `
            <div class="upload-placeholder">
                <div class="up-icon">🖼️</div>
                <p>${opts.label || 'Clique ou arraste a imagem aqui'}</p>
                <small>${opts.hint || 'JPG, PNG ou WEBP — máx. 5MB'}</small>
            </div>`;
    }

    zone.addEventListener('click', () => {
        if (input) input.click();
    });

    zone.addEventListener('dragover', (e) => {
        e.preventDefault();
        zone.classList.add('drag-over');
    });
    zone.addEventListener('dragleave', () => zone.classList.remove('drag-over'));
    zone.addEventListener('drop', (e) => {
        e.preventDefault();
        zone.classList.remove('drag-over');
        const file = e.dataTransfer?.files?.[0];
        if (!file) return;
        handleFile(file);
    });

    if (input) {
        input.addEventListener('change', function () {
            if (this.files[0]) handleFile(this.files[0]);
        });
    }

    function handleFile(file) {
        const allowed = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
        if (!allowed.includes(file.type)) {
            Toast.error('Formato inválido. Use JPG, PNG ou WEBP.');
            return;
        }
        if (file.size > 5 * 1024 * 1024) {
            Toast.error('Imagem muito grande. Máximo 5MB.');
            return;
        }
        const reader = new FileReader();
        reader.onload = (e) => setPreview(e.target.result);
        reader.readAsDataURL(file);
        if (opts.onFile) opts.onFile(file);
    }

    if (!zone.querySelector('img')) resetZone();

    return { reset: resetZone };
}

// HEADER DINÂMICO
function initHeader() {
    const btn = document.getElementById('dark-mode-btn');
    if (btn) btn.textContent = document.body.classList.contains('dark-mode') ? '☀️' : '🌙';

    const user  = Session.getUser();
    const menu  = document.querySelector('.user-menu');
    if (!menu) return;

    if (user) {
        const primeiroNome = user.nome.split(' ')[0];
        const avatarUrl = user.fotoUrl && !user.fotoUrl.includes('Default')
            ? user.fotoUrl
            : `https://ui-avatars.com/api/?name=${encodeURIComponent(primeiroNome)}&background=1d4ed8&color=fff&rounded=true&bold=true`;

        const adminItem = user.tipo === 'admin'
            ? `<a href="admin.html" class="dropdown-item">🛡️ Painel Admin</a>` : '';
        const proItems = user.tipo === 'profissional' || user.tipo === 'admin'
            ? `<a href="perfil.html#anunciar" class="dropdown-item">📢 Meus Anúncios</a>` : '';

        menu.innerHTML = `
            <div class="user-dropdown-container">
                <button id="user-menu-btn" class="user-menu-btn" aria-haspopup="true" aria-expanded="false">
                    <img src="${avatarUrl}" alt="Avatar" class="user-avatar">
                    <span>${primeiroNome}</span>
                    <svg width="10" height="6" viewBox="0 0 10 6" fill="none" style="transition:.2s">
                        <path d="M1 1L5 5L9 1" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
                    </svg>
                </button>
                <div id="dropdown-menu" class="dropdown-menu" role="menu">
                    <div class="dropdown-header">
                        <strong>${user.nome}</strong>
                        <span class="dropdown-badge ${user.tipo}">${user.tipo === 'admin' ? '🛡️ Admin' : user.tipo === 'profissional' ? '⭐ Profissional' : '👤 Cliente'}</span>
                    </div>
                    <a href="perfil.html" class="dropdown-item">👤 Meu Perfil</a>
                    <a href="chat.html" class="dropdown-item" style="position:relative">
                        💬 Mensagens
                        <span id="badge-msgs" style="display:none;background:#ef4444;color:#fff;font-size:.65rem;font-weight:700;padding:1px 6px;border-radius:20px;margin-left:6px">0</span>
                    </a>
                    ${proItems}${adminItem}
                    <a href="configuracoes.html" class="dropdown-item">⚙️ Configurações</a>
                    <div class="dropdown-divider"></div>
                    <button onclick="logout()" class="dropdown-item dropdown-logout">🚪 Sair da Conta</button>
                </div>
            </div>`;

        injectDropdownStyles();

        const menuBtn  = document.getElementById('user-menu-btn');
        const dropdown = document.getElementById('dropdown-menu');

        menuBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            const isOpen = dropdown.classList.toggle('show');
            menuBtn.setAttribute('aria-expanded', isOpen);
            menuBtn.querySelector('svg').style.transform = isOpen ? 'rotate(180deg)' : '';
        });

        document.addEventListener('click', () => {
            if (dropdown.classList.contains('show')) {
                dropdown.classList.remove('show');
                menuBtn.setAttribute('aria-expanded', 'false');
                menuBtn.querySelector('svg').style.transform = '';
            }
        });
    }
}

function injectDropdownStyles() {
    if (document.getElementById('dropdown-injected-style')) return;
    const s = document.createElement('style');
    s.id = 'dropdown-injected-style';
    s.textContent = `
        .user-dropdown-container { position: relative; }
        .user-menu-btn {
            display: flex; align-items: center; gap: 8px; background: transparent;
            border: none; cursor: pointer; font-weight: 600; font-size: .95rem;
            color: inherit; font-family: inherit; padding: 6px 10px;
            border-radius: 10px; transition: background .2s;
        }
        .user-menu-btn:hover { background: rgba(0,0,0,.05); }
        .user-avatar { width: 34px; height: 34px; border-radius: 50%; object-fit: cover; border: 2px solid rgba(0,0,0,.08); }
        .dropdown-menu {
            display: none; position: absolute; right: 0; top: calc(100% + 8px);
            background: #fff; border: 1px solid rgba(0,0,0,.07);
            border-radius: 18px; box-shadow: 0 16px 48px rgba(0,0,0,.1);
            width: 240px; overflow: hidden; z-index: 9999;
        }
        .dropdown-menu.show { display: block; animation: ddFadeIn .2s cubic-bezier(.16,1,.3,1); }
        @keyframes ddFadeIn { from { opacity:0; transform:translateY(-8px); } to { opacity:1; transform:translateY(0); } }
        .dropdown-header { padding: 16px 18px 12px; border-bottom: 1px solid #f3f4f6; }
        .dropdown-header strong { display: block; font-size: .95rem; color: #111827; margin-bottom: 4px; }
        .dropdown-badge { font-size: .75rem; font-weight: 600; padding: 2px 8px; border-radius: 20px; }
        .dropdown-badge.profissional { background: #ede9fe; color: #6d28d9; }
        .dropdown-badge.cliente      { background: #eff6ff; color: #1d4ed8; }
        .dropdown-badge.admin        { background: #fef3c7; color: #92400e; }
        .dropdown-item { display: block; padding: 12px 18px; color: #374151; text-decoration: none; font-size: .9rem; font-weight: 500; transition: background .15s; }
        .dropdown-item:hover { background: #f9fafb; color: #1d4ed8; }
        .dropdown-divider { height: 1px; background: #f3f4f6; margin: 4px 0; }
        .dropdown-logout { width: 100%; text-align: left; background: none; border: none; cursor: pointer; font-family: inherit; color: #ef4444; }
        .dropdown-logout:hover { background: #fef2f2; color: #dc2626; }
        body.dark-mode .dropdown-menu { background: #1e1e2e; border-color: rgba(255,255,255,.08); }
        body.dark-mode .dropdown-item { color: #d1d5db; }
        body.dark-mode .dropdown-item:hover { background: rgba(255,255,255,.05); color: #93c5fd; }
        body.dark-mode .dropdown-divider { background: rgba(255,255,255,.08); }
        body.dark-mode .dropdown-header { border-color: rgba(255,255,255,.08); }
        body.dark-mode .dropdown-header strong { color: #f9fafb; }
        body.dark-mode .user-menu-btn { color: #f9fafb; }
        body.dark-mode .user-menu-btn:hover { background: rgba(255,255,255,.08); }
    `;
    document.head.appendChild(s);
}

// MÁSCARA DE TELEFONE
function sanitizePhoneDigits(value) {
    return (value || '').toString().replace(/\D/g, '');
}

function formatPhone(value) {
    const digits = sanitizePhoneDigits(value);
    if (!digits) return '';
    const ddd = digits.slice(0, 2);
    const rest = digits.slice(2);
    if (!rest) return `(${ddd})`;
    if (rest.length <= 4) return `(${ddd}) ${rest}`;
    if (rest.length <= 9) {
        return `(${ddd}) ${rest.slice(0, rest.length - 4)}-${rest.slice(rest.length - 4)}`;
    }
    return `(${ddd}) ${rest.slice(0, 5)}-${rest.slice(5, 9)}`;
}

function applyPhoneMaskToInput(input) {
    if (input._phoneMaskApplied) return;
    input._phoneMaskApplied = true;

    input.addEventListener('input', () => {
        const start = input.selectionStart;
        const before = input.value.length;
        const digits = sanitizePhoneDigits(input.value);
        input.value = formatPhone(digits);
        const diff = input.value.length - before;
        try { input.setSelectionRange(start + diff, start + diff); } catch (_) {}
    });

    input.addEventListener('paste', (e) => {
        e.preventDefault();
        const paste = (e.clipboardData || window.clipboardData).getData('text');
        input.value = formatPhone(paste);
    });

    if (input.value) {
        const digits = sanitizePhoneDigits(input.value);
        input.value = formatPhone(digits);
    }
}

function initPhoneMask(selector) {
    document.querySelectorAll(selector).forEach(applyPhoneMaskToInput);
}

// CATEGORY PICKER
function initCategoryPicker({ rootId, categories = [], selected = [], placeholder = 'Selecione uma categoria...', multi = false, onChange }) {
    const root = document.getElementById(rootId);
    if (!root) return null;

    const items = Array.isArray(categories) ? categories : [];
    let selectedValues = Array.isArray(selected) ? [...selected] : (selected ? [selected] : []);

    const defaultLabel = placeholder;
    root.classList.add('category-picker');
    root.innerHTML = `
        <div class="category-picker-button" type="button" data-action="toggle">
            <div class="category-picker-label">${defaultLabel}</div>
            <span class="category-picker-caret">▾</span>
        </div>
        <div class="category-picker-menu">
            <input class="category-picker-search" type="search" placeholder="Buscar categoria..." aria-label="Buscar categoria">
            <div class="category-picker-options"></div>
        </div>
    `;

    const toggleButton = root.querySelector('.category-picker-button');
    const menu = root.querySelector('.category-picker-menu');
    const search = root.querySelector('.category-picker-search');
    const optionsContainer = root.querySelector('.category-picker-options');

    const getDisplayLabel = () => {
        if (selectedValues.length === 0) return defaultLabel;
        if (!multi || selectedValues.length === 1) return selectedValues[0];
        return selectedValues.map((value) => `<span class="category-picker-chip">${value}</span>`).join('');
    };

    const renderOptions = (filter = '') => {
        const normalized = filter.trim().toLowerCase();
        const filtered = items.filter((item) => item.nome.toLowerCase().includes(normalized));

        if (!filtered.length) {
            optionsContainer.innerHTML = `<div class="category-picker-empty">Nenhuma categoria encontrada.</div>`;
            return;
        }

        optionsContainer.innerHTML = filtered.map((item) => {
            const isSelected = selectedValues.includes(item.nome);
            return `
                <button type="button" class="category-picker-option ${isSelected ? 'selected' : ''}" data-value="${item.nome}">
                    <span class="option-icon">${item.icone || '🛠️'}</span>
                    <span>${item.nome}</span>
                </button>
            `;
        }).join('');
    };

    const updateSelection = (value) => {
        if (multi) {
            if (selectedValues.includes(value)) {
                selectedValues = selectedValues.filter((item) => item !== value);
            } else {
                selectedValues.push(value);
            }
        } else {
            selectedValues = [value];
            root.classList.remove('open');
        }
        render();
        onChange?.(multi ? selectedValues : selectedValues[0]);
    };

    const render = () => {
        const labelHtml = getDisplayLabel();
        root.querySelector('.category-picker-label').innerHTML = labelHtml;
        renderOptions(search.value || '');
    };

    toggleButton.addEventListener('click', (event) => {
        event.stopPropagation();
        root.classList.toggle('open');
        if (root.classList.contains('open')) {
            search.focus();
        }
    });

    menu.addEventListener('click', (event) => event.stopPropagation());
    search.addEventListener('input', () => renderOptions(search.value));

    optionsContainer.addEventListener('click', (event) => {
        const option = event.target.closest('.category-picker-option');
        if (!option) return;
        updateSelection(option.dataset.value);
    });

    document.addEventListener('click', () => root.classList.remove('open'));
    render();

    return {
        getValue: () => (multi ? [...selectedValues] : selectedValues[0] || ''),
        setValue: (value) => {
            selectedValues = Array.isArray(value) ? [...value] : value ? [value] : [];
            render();
        },
    };
}

// MENU MOBILE
let _drawerBuilt = false;

function abrirDrawer() {
    if (!_drawerBuilt) _buildDrawer();
    const drawer  = document.getElementById('mobile-drawer');
    const overlay = document.getElementById('mobile-overlay');
    if (!drawer || !overlay) return;
    drawer.classList.add('open');
    overlay.classList.add('show');
    document.body.style.overflow = 'hidden';
    const btn = document.getElementById('hamburger-btn');
    if (btn) btn.classList.add('open');
}

function fecharDrawer() {
    const drawer  = document.getElementById('mobile-drawer');
    const overlay = document.getElementById('mobile-overlay');
    if (drawer)  drawer.classList.remove('open');
    if (overlay) overlay.classList.remove('show');
    document.body.style.overflow = '';
    const btn = document.getElementById('hamburger-btn');
    if (btn) btn.classList.remove('open');
}

function buscarCatDrawer(cat) {
    fecharDrawer();
    localStorage.setItem('termoBusca', cat);
    window.location.href = 'searchpage.html';
}

function _buildDrawer() {
    if (_drawerBuilt || document.getElementById('mobile-drawer')) { _drawerBuilt = true; return; }
    _drawerBuilt = true;

    const user = Session.getUser();

    const overlay = document.createElement('div');
    overlay.id = 'mobile-overlay';
    overlay.className = 'mobile-menu-overlay';
    overlay.addEventListener('click', fecharDrawer);

    const drawer = document.createElement('div');
    drawer.id = 'mobile-drawer';
    drawer.className = 'mobile-drawer';

    let userSection = '';
    if (user) {
        const avatar = user.fotoUrl && !user.fotoUrl.includes('Default')
            ? user.fotoUrl
            : `https://ui-avatars.com/api/?name=${encodeURIComponent(user.nome)}&background=1d4ed8&color=fff&bold=true`;
        const tipoCls = `badge-${user.tipo}`;
        const tipoBadge = user.tipo === 'admin' ? '🛡️ Admin' : user.tipo === 'profissional' ? '⭐ Profissional' : '👤 Cliente';
        userSection = `
            <div class="drawer-user">
                <img src="${avatar}" alt="Avatar" class="drawer-user-avatar">
                <div>
                    <div class="drawer-user-name">${user.nome}</div>
                    <span class="drawer-user-type ${tipoCls}">${tipoBadge}</span>
                </div>
            </div>`;
    }

    const adminLink = user?.tipo === 'admin'
        ? `<a href="admin.html" class="drawer-link"><span class="drawer-icon">🛡️</span> Painel Admin</a>` : '';
    const proLink = (user?.tipo === 'profissional' || user?.tipo === 'admin')
        ? `<a href="perfil.html#anunciar" class="drawer-link"><span class="drawer-icon">📢</span> Meus Anúncios</a>` : '';
    const authLinks = user
        ? `<a href="perfil.html" class="drawer-link"><span class="drawer-icon">👤</span> Meu Perfil</a>
           ${proLink}${adminLink}
           <a href="configuracoes.html" class="drawer-link"><span class="drawer-icon">⚙️</span> Configurações</a>`
        : `<a href="loginpage.html" class="drawer-link"><span class="drawer-icon">🔑</span> Entrar</a>
           <a href="registerpage.html" class="drawer-link"><span class="drawer-icon">✨</span> Criar conta grátis</a>`;

    const bottomBtn = user
        ? `<button onclick="logout()" class="drawer-logout-btn">🚪 Sair da Conta</button>` : '';

    drawer.innerHTML = `
        <div class="drawer-header">
            <a href="homepage.html" class="logo" style="font-size:1.4rem">Da1Help<span>.</span></a>
            <button class="drawer-close" onclick="fecharDrawer()" aria-label="Fechar menu">✕</button>
        </div>
        ${userSection}
        <div class="drawer-section-title">Navegação</div>
        <a href="homepage.html"    class="drawer-link"><span class="drawer-icon">🏠</span> Início</a>
        <a href="searchpage.html"  class="drawer-link"><span class="drawer-icon">🔍</span> Explorar Profissionais</a>
        <a href="sobrepage.html"   class="drawer-link"><span class="drawer-icon">ℹ️</span> Sobre</a>
        <a href="contatopage.html" class="drawer-link"><span class="drawer-icon">💬</span> Contato</a>
        <div class="drawer-divider"></div>
        <div class="drawer-section-title">Minha Conta</div>
        ${authLinks}
        <div class="drawer-divider"></div>
        <div class="drawer-section-title">Categorias</div>
        <div id="drawer-cats" class="drawer-cats-grid">
            <div class="skeleton" style="height:60px;border-radius:10px"></div>
            <div class="skeleton" style="height:60px;border-radius:10px"></div>
            <div class="skeleton" style="height:60px;border-radius:10px"></div>
            <div class="skeleton" style="height:60px;border-radius:10px"></div>
        </div>
        <div class="drawer-bottom">${bottomBtn}</div>`;

    document.body.appendChild(overlay);
    document.body.appendChild(drawer);

    if (typeof API !== 'undefined') {
        API.categorias.listar().then(data => {
            const grid = document.getElementById('drawer-cats');
            if (!grid || !data.categorias?.length) return;
            grid.innerHTML = data.categorias.slice(0, 10).map(c => `
                <button class="drawer-cat-btn" onclick="buscarCatDrawer('${c.nome.replace(/'/g, "\\'")}')">
                    <span class="cat-em">${c.icone}</span>
                    <span>${c.nome}</span>
                </button>`).join('');
        }).catch(() => {
            const grid = document.getElementById('drawer-cats');
            if (grid) grid.innerHTML = '<div style="grid-column:1/-1;padding:8px;color:var(--gray-400);font-size:.82rem">Não disponível</div>';
        });
    }
}

document.addEventListener('keydown', (e) => { if (e.key === 'Escape') fecharDrawer(); });

// INIT
window.addEventListener('DOMContentLoaded', () => {
    const btn = document.getElementById('dark-mode-btn');
    if (btn) btn.textContent = document.body.classList.contains('dark-mode') ? '☀️' : '🌙';

    initHeader();

    const nav = document.querySelector('.nav-container');
    if (nav && !document.getElementById('hamburger-btn')) {
        const userMenu = nav.querySelector('.user-menu');
        if (userMenu) userMenu.classList.add('nav-links-desktop');

        const hambBtn = document.createElement('button');
        hambBtn.id        = 'hamburger-btn';
        hambBtn.className = 'hamburger-btn';
        hambBtn.setAttribute('aria-label', 'Abrir menu');
        hambBtn.setAttribute('aria-expanded', 'false');
        hambBtn.onclick   = abrirDrawer;
        hambBtn.innerHTML = `<span></span><span></span><span></span>`;
        nav.appendChild(hambBtn);
    }

    const header = document.querySelector('.glass-header');
    const main   = document.querySelector('main');
    if (header && !header.classList.contains('no-anim')) header.classList.add('page-header-anim');
    if (main   && !main.classList.contains('no-anim'))   main.classList.add('page-main-anim');

    initPhoneMask('input[data-mask="telefone"]');

    // CAPITALIZAR NOME
    function capitalizarPalavras(str) {
        return str.replace(/\b\w/g, (c) => c.toUpperCase());
    }
    document.querySelectorAll('input[data-capitalize]').forEach(input => {
        input.addEventListener('input', function () {
            const pos = this.selectionStart;
            this.value = capitalizarPalavras(this.value);
            this.setSelectionRange(pos, pos);
        });
        input.addEventListener('blur', function () {
            this.value = capitalizarPalavras(this.value.trim());
        });
    });
});
