// Da1Help — API v2.1

const API_BASE_URL = 'http://localhost:3000/api';

// SESSÃO
const Session = {
    getToken()        { return localStorage.getItem('da1help_token'); },
    getUser()         { const u = localStorage.getItem('da1help_user'); return u ? JSON.parse(u) : null; },
    isLoggedIn()      { return !!this.getToken(); },
    save(token, user) {
        localStorage.setItem('da1help_token', token);
        localStorage.setItem('da1help_user', JSON.stringify(user));
    },
    clear() {
        localStorage.removeItem('da1help_token');
        localStorage.removeItem('da1help_user');
    },
    headers(extra = {}) {
        const h = { 'Content-Type': 'application/json', ...extra };
        const token = this.getToken();
        if (token) h['Authorization'] = `Bearer ${token}`;
        return h;
    },
};

// FETCH WRAPPER
async function apiFetch(path, options = {}) {
    const url    = `${API_BASE_URL}${path}`;
    const config = { ...options, headers: Session.headers(options.headers || {}) };
    const res    = await fetch(url, config);
    const data   = await res.json().catch(() => ({ success: false, error: 'Resposta inválida do servidor.' }));
    if (!res.ok) {
        if (res.status === 401) {
            Session.clear();
            if (!window.location.pathname.includes('loginpage')) window.location.href = 'loginpage.html';
        }
        throw new ApiError(data.error || 'Erro desconhecido.', res.status);
    }
    return data;
}

class ApiError extends Error {
    constructor(message, status) { super(message); this.status = status; }
}

// UPLOAD MULTIPART
async function apiUpload(path, formData) {
    const res  = await fetch(`${API_BASE_URL}${path}`, {
        method:  'POST',
        headers: { Authorization: `Bearer ${Session.getToken()}` },
        body:    formData,
    });
    const data = await res.json().catch(() => ({ success: false, error: 'Erro no upload.' }));
    if (!res.ok) throw new ApiError(data.error || 'Erro no upload.', res.status);
    return data;
}

// ENDPOINTS
const API = {
    auth: {
        register:       (body) => apiFetch('/auth/register',        { method: 'POST', body: JSON.stringify(body) }),
        login:          (body) => apiFetch('/auth/login',           { method: 'POST', body: JSON.stringify(body) }),
        me:             ()     => apiFetch('/auth/me'),
        upgradePro:     (body) => apiFetch('/auth/upgrade-pro',     { method: 'POST', body: JSON.stringify(body) }),
        forgotPassword: (body) => apiFetch('/auth/forgot-password', { method: 'POST', body: JSON.stringify(body) }),
        resetPassword:  (body) => apiFetch('/auth/reset-password',  { method: 'POST', body: JSON.stringify(body) }),
    },

    upload: {
        perfil:  (fd) => apiUpload('/upload/perfil',  fd),
        banner:  (fd) => apiUpload('/upload/banner',  fd),
        anuncio: (fd) => apiUpload('/upload/anuncio', fd),
    },

    categorias: {
        listar:    ()          => apiFetch('/categorias'),
        criar:     (body)      => apiFetch('/categorias',      { method: 'POST',   body: JSON.stringify(body) }),
        atualizar: (id, body)  => apiFetch(`/categorias/${id}`,{ method: 'PUT',    body: JSON.stringify(body) }),
        deletar:   (id)        => apiFetch(`/categorias/${id}`,{ method: 'DELETE' }),
    },

    users: {
        getCategorias:    ()         => apiFetch('/categorias'),
        getProfissionais: (params)   => apiFetch(`/professionals?${new URLSearchParams(params)}`),
        getProfissional:  (id)       => apiFetch(`/professionals/${id}`),
        avaliar:          (id, body) => apiFetch(`/professionals/${id}/avaliar`,   { method: 'POST', body: JSON.stringify(body) }),
        getAvaliacoes:    (id)       => apiFetch(`/professionals/${id}/avaliacoes`),
        denunciar:        (id, body) => apiFetch(`/professionals/${id}/denunciar`, { method: 'POST', body: JSON.stringify(body) }),
        updateProfile:    (body)     => apiFetch('/profile',   { method: 'PUT',  body: JSON.stringify(body) }),
        updateConfig:     (body)     => apiFetch('/config',    { method: 'PUT',  body: JSON.stringify(body) }),
    },

    anuncios: {
        listar:    (params)   => apiFetch(`/anuncios?${new URLSearchParams(params)}`),
        getById:   (id)       => apiFetch(`/anuncios/${id}`),
        getMeus:   ()         => apiFetch('/anuncios/meus/lista'),
        criar:     (body)     => apiFetch('/anuncios',       { method: 'POST',   body: JSON.stringify(body) }),
        atualizar: (id, body) => apiFetch(`/anuncios/${id}`, { method: 'PUT',    body: JSON.stringify(body) }),
        remover:   (id)       => apiFetch(`/anuncios/${id}`, { method: 'DELETE' }),
    },

    messages: {
        enviar:       (body) => apiFetch('/messages',              { method: 'POST', body: JSON.stringify(body) }),
        getHistorico: (u2)   => apiFetch(`/messages/${u2}`),
        getConversas: ()     => apiFetch('/messages/conversas'),
        getNaoLidas:  ()     => apiFetch('/messages/nao-lidas'),
    },

    admin: {
        getDashboard:     ()         => apiFetch('/admin/dashboard'),
        getUsuarios:      (params)   => apiFetch(`/admin/usuarios?${new URLSearchParams(params)}`),
        bloquear:         (id, body) => apiFetch(`/admin/usuarios/${id}/bloquear`,    { method: 'PUT', body: JSON.stringify(body) }),
        desbloquear:      (id)       => apiFetch(`/admin/usuarios/${id}/desbloquear`, { method: 'PUT' }),
        getDenuncias:     (params)   => apiFetch(`/admin/denuncias?${new URLSearchParams(params)}`),
        resolverDenuncia: (id, body) => apiFetch(`/admin/denuncias/${id}`,            { method: 'PUT', body: JSON.stringify(body) }),
        removerAnuncio:   (id)       => apiFetch(`/admin/anuncios/${id}`,             { method: 'DELETE' }),
    },
};
