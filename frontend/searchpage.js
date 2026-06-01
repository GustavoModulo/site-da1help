const grid = document.querySelector('.results-grid');
const input = document.getElementById('campo-busca');

let profissionalIdSelecionado = null;

async function buscar(termo = "") {
    try {
        const res = await fetch(`http://127.0.0.1:3000/api/professionals?busca=${termo}`);
        const data = await res.json();
        
        grid.innerHTML = "";
        
        data.forEach(p => {
            const prof = p.profissional;
            const isPatrocinado = prof.isPatrocinado;
            
            // Define a foto: usa a do banco ou a padrão da sua pasta images
            const fotoUrl = p.fotoUrl || "images/Default_FotoPerfil.png";
            
            let sociais = `<a href="https://wa.me/${prof.whatsapp}" target="_blank" style="color: #25D366; font-size: 1.5rem; text-decoration: none;"><i class="fa-brands fa-whatsapp"></i></a>`;
            if (prof.redesSociais?.instagram) {
                sociais += `<a href="https://instagram.com/${prof.redesSociais.instagram}" target="_blank" style="color: #E1306C; font-size: 1.5rem; margin-left: 10px; text-decoration: none;"><i class="fa-brands fa-instagram"></i></a>`;
            }
            if (prof.redesSociais?.googleFotos) {
                sociais += `<a href="${prof.redesSociais.googleFotos}" target="_blank" style="color: #4285F4; font-size: 1.5rem; margin-left: 10px; text-decoration: none;"><i class="fa-brands fa-google"></i></a>`;
            }

            const card = `
                <li class="result-item glass-card ${isPatrocinado ? 'destaque' : ''}" style="margin-bottom: 15px; ${isPatrocinado ? 'border: 2px solid #fbbf24;' : ''}">
                    <div class="card-top" style="display:flex; justify-content:space-between; align-items: flex-start;">
                        <div style="display: flex; gap: 15px; align-items: center;">
                            <img src="${fotoUrl}" alt="Foto" style="width: 60px; height: 60px; border-radius: 50%; object-fit: cover; border: 2px solid #eee;">
                            
                            <div>
                                <h3 style="margin-bottom: 2px; display: flex; align-items: center; gap: 5px; font-size: 1.1rem;">
                                    ${prof.categoria} 
                                    ${isPatrocinado ? '<i class="fa-solid fa-circle-check" style="color:#fbbf24;" title="Verificado"></i>' : ''}
                                </h3>
                                <p style="color: #4b5563; font-weight: 600; font-size: 0.9rem;">${p.nome}</p>
                                <div class="rating" style="font-size: 0.85rem; color: #fbbf24;">
                                    <i class="fa-solid fa-star"></i> ${prof.avaliacao ? prof.avaliacao.toFixed(1) : 'Novo'}
                                </div>
                            </div>
                        </div>
                        <div>${sociais}</div>
                    </div>
                    <p style="margin-top: 15px; font-size: 0.9rem; color: #4b5563; line-height: 1.5;">${prof.descricao || "Profissional parceiro Da1Help."}</p>
                    
                    <div style="margin-top: 20px; display: flex; gap: 10px; justify-content: flex-end; border-top: 1px solid #f3f4f6; padding-top: 15px;">
                        <button onclick="verPerfil('${p._id}')" class="btn-secondary" style="border:none; cursor:pointer; font-size: 0.85rem; padding: 8px 15px;">👤 Ver Perfil</button>
                        <button onclick="abrirModalAvaliacao('${p._id}')" class="btn-secondary" style="border:none; cursor:pointer; font-size: 0.85rem; padding: 8px 15px;">⭐ Avaliar</button>
                        <button onclick="abrirModalDenuncia('${p._id}')" style="cursor:pointer; background: none; border: none; color: #ef4444; font-size: 1.1rem; margin-left: 10px;" title="Denunciar Perfil"><i class="fa-solid fa-flag"></i></button>
                    </div>
                </li>
            `;
            grid.innerHTML += card;
        });
    } catch(err) {
        grid.innerHTML = "<p style='text-align:center; width:100%;'>Erro ao carregar profissionais.</p>";
    }
}

// Funções de Modal continuam iguais abaixo...
function abrirModalAvaliacao(id) { profissionalIdSelecionado = id; document.getElementById('modal-avaliacao').classList.add('active'); }
function abrirModalDenuncia(id) { profissionalIdSelecionado = id; document.getElementById('modal-denuncia').classList.add('active'); }
function fecharModais() { 
    document.getElementById('modal-avaliacao').classList.remove('active'); 
    document.getElementById('modal-denuncia').classList.remove('active'); 
}

// === ENVIOS PARA O BACKEND CORRIGIDOS ===
window.enviarAvaliacao = async function() {
    const estrelaSelecionada = document.querySelector('input[name="rate"]:checked');
    const feedback = document.getElementById('texto-avaliacao').value;
    const user = JSON.parse(localStorage.getItem('da1help_user'));

    if (!estrelaSelecionada) {
        alert("⚠️ Por favor, selecione pelo menos uma estrela.");
        return;
    }

    if (!user) {
        alert("⚠️ Você precisa estar logado para avaliar.");
        return;
    }

    try {
        const res = await fetch(`http://127.0.0.1:3000/api/avaliar/${profissionalIdSelecionado}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ nota: Number(estrelaSelecionada.value), feedback, clienteId: user._id })
        });

        if (res.ok) {
            alert("✅ Avaliação enviada com sucesso! Obrigado.");
            fecharModais();
            buscar(input.value); // Atualiza a tela para mostrar a nova nota
        } else {
            const erro = await res.json();
            alert("❌ Erro: " + (erro.error || "Não foi possível avaliar."));
        }
    } catch(err) {
        alert("❌ Erro ao conectar com o servidor.");
    }
}

window.enviarDenuncia = async function() {
    const motivo = document.getElementById('texto-denuncia').value.trim();

    if (!motivo) {
        alert("⚠️ Por favor, explique o motivo da denúncia.");
        return;
    }

    try {
        const res = await fetch(`http://127.0.0.1:3000/api/denunciar/${profissionalIdSelecionado}`, { 
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ motivo })
        });

        if (res.ok) {
            alert("🚨 Denúncia registrada. Nossa equipe avaliará o perfil em breve.");
            fecharModais();
        } else {
            const erro = await res.json();
            alert("❌ Erro: " + (erro.error || "Não foi possível enviar denúncia."));
        }
    } catch(err) {
        alert("❌ Erro ao conectar com o servidor.");
    }
}

window.verPerfil = function(id) {
    window.location.href = `perfil-profissional.html?id=${id}`;
}