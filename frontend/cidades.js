// CIDADES DO BRASIL — SP com prioridade

const CIDADES_SP = [
  "Adamantina","Aguaí","Agudos","Álvares Machado","Americana","Amparo","Andradina","Araçatuba",
  "Araraquara","Araras","Araçoiaba da Serra","Assis","Atibaia","Avaré","Barretos","Barueri",
  "Batatais","Bauru","Bebedouro","Birigui","Botucatu","Bragança Paulista","Brotas","Caçapava",
  "Campinas","Campo Limpo Paulista","Campos do Jordão","Cananéia","Capivari","Caraguatatuba",
  "Casa Branca","Catanduva","Cerquilho","Cotia","Diadema","Descalvado","Dois Córregos","Embu das Artes",
  "Fernandópolis","Ferraz de Vasconcelos","Franca","Francisco Morato","Franco da Rocha","Guaratinguetá",
  "Guarujá","Guarulhos","Hortolândia","Ibitinga","Igaraçu do Tietê","Ilha Solteira","Indaiatuba",
  "Itanhaém","Itu","Itupeva","Jaguariúna","Jaú","Jundiaí","Leme","Limeira","Lins","Lorena",
  "Marília","Mauá","Mogi das Cruzes","Mogi Guaçu","Mogi Mirim","Mongaguá","Monte Alto",
  "Monteiro Lobato","Osasco","Ourinhos","Peruíbe","Pindamonhangaba","Piracicaba","Pirassununga",
  "Porto Ferreira","Praia Grande","Presidente Prudente","Rio Claro","Ribeirão Preto","Ribeirão Pires",
  "Salto","Santa Bárbara d'Oeste","Santo André","Santos","São Bernardo do Campo","São Caetano do Sul",
  "São Carlos","São João da Boa Vista","São José do Rio Pardo","São José do Rio Preto","São José dos Campos",
  "São Paulo","São Roque","São Sebastião","Sorocaba","Sumaré","Suzano","Taboão da Serra","Tatuí",
  "Taubaté","Tupã","Ubatuba","Valinhos","Vargem Grande Paulista","Várzea Paulista","Vinhedo","Votuporanga"
];

const CIDADES_OUTROS = [
  // Minas Gerais
  "Belo Horizonte, MG","Uberlândia, MG","Juiz de Fora, MG","Contagem, MG","Betim, MG",
  "Uberaba, MG","Montes Claros, MG","Ribeirão das Neves, MG","Governador Valadares, MG",
  // Rio de Janeiro
  "Rio de Janeiro, RJ","Niterói, RJ","Duque de Caxias, RJ","Nova Iguaçu, RJ","São Gonçalo, RJ",
  "Petrópolis, RJ","Volta Redonda, RJ","Campos dos Goytacazes, RJ",
  // Paraná
  "Curitiba, PR","Londrina, PR","Maringá, PR","Ponta Grossa, PR","Cascavel, PR","Foz do Iguaçu, PR",
  // Bahia
  "Salvador, BA","Feira de Santana, BA","Vitória da Conquista, BA","Camaçari, BA","Ilhéus, BA",
  // Pernambuco
  "Recife, PE","Caruaru, PE","Petrolina, PE","Olinda, PE","Jaboatão dos Guararapes, PE",
  // Ceará
  "Fortaleza, CE","Caucaia, CE","Juazeiro do Norte, CE","Maracanaú, CE",
  // Rio Grande do Sul
  "Porto Alegre, RS","Caxias do Sul, RS","Pelotas, RS","Canoas, RS","Santa Maria, RS",
  // Goiás
  "Goiânia, GO","Aparecida de Goiânia, GO","Anápolis, GO","Rio Verde, GO",
  // Santa Catarina
  "Florianópolis, SC","Joinville, SC","Blumenau, SC","São José, SC","Criciúma, SC",
  // Outros estados
  "Manaus, AM","Belém, PA","São Luís, MA","Natal, RN","Maceió, AL","Aracaju, SE",
  "Porto Velho, RO","Cuiabá, MT","Campo Grande, MS","Macapá, AP","Palmas, TO","Rio Branco, AC","Boa Vista, RR"
];

const TODAS_CIDADES = [
  ...CIDADES_SP.map(c => `${c}, SP`),
  ...CIDADES_OUTROS,
];

// AUTOCOMPLETE DE CIDADE (input)
function initCidadeAutocomplete(inputId) {
    const input = document.getElementById(inputId);
    if (!input) return;

    const wrapper = document.createElement('div');
    wrapper.style.cssText = 'position:relative;display:block';
    input.parentNode.insertBefore(wrapper, input);
    wrapper.appendChild(input);

    const dropdown = document.createElement('div');
    dropdown.style.cssText = `
        position:absolute; top:100%; left:0; right:0; z-index:999;
        background:#fff; border:1.5px solid var(--brand-blue);
        border-top:none; border-radius:0 0 14px 14px;
        max-height:220px; overflow-y:auto;
        box-shadow:0 8px 24px rgba(0,0,0,.1);
        display:none;
    `;
    wrapper.appendChild(dropdown);

    if (document.body.classList.contains('dark-mode')) {
        dropdown.style.background = '#1a1a2e';
        dropdown.style.border = '1.5px solid var(--brand-blue)';
    }

    function renderSuggestions(query) {
        const q = query.trim().toLowerCase();
        if (q.length < 2) { dropdown.style.display = 'none'; return; }

        const matches = TODAS_CIDADES.filter(c => c.toLowerCase().includes(q)).slice(0, 10);
        if (!matches.length) { dropdown.style.display = 'none'; return; }

        const isDark = document.body.classList.contains('dark-mode');
        dropdown.innerHTML = matches.map(c => `
            <div class="cidade-option" style="
                padding:10px 16px; cursor:pointer; font-size:.88rem;
                color:${isDark ? '#d1d5db' : '#374151'};
                border-bottom:1px solid ${isDark ? 'rgba(255,255,255,.05)' : '#f3f4f6'};
                transition:background .15s;
            " onmouseover="this.style.background='${isDark ? 'rgba(255,255,255,.07)' : '#eff6ff'}';this.style.color='var(--brand-blue)'"
               onmouseout="this.style.background='';this.style.color='${isDark ? '#d1d5db' : '#374151'}'"
            >${c}</div>
        `).join('');
        dropdown.style.display = 'block';

        dropdown.querySelectorAll('.cidade-option').forEach(opt => {
            opt.addEventListener('mousedown', (e) => {
                e.preventDefault();
                input.value = opt.textContent.trim();
                dropdown.style.display = 'none';
                input.dispatchEvent(new Event('change'));
            });
        });
    }

    input.addEventListener('input', () => renderSuggestions(input.value));
    input.addEventListener('focus', () => { if (input.value.length >= 2) renderSuggestions(input.value); });
    input.addEventListener('blur', () => setTimeout(() => { dropdown.style.display = 'none'; }, 150));

    // NAVEGAÇÃO POR TECLADO
    input.addEventListener('keydown', (e) => {
        const opts = dropdown.querySelectorAll('.cidade-option');
        const active = dropdown.querySelector('.cidade-active');
        if (e.key === 'ArrowDown') {
            e.preventDefault();
            const next = active ? active.nextElementSibling : opts[0];
            if (active) active.classList.remove('cidade-active');
            if (next) { next.classList.add('cidade-active'); next.style.background = '#eff6ff'; next.style.color = 'var(--brand-blue)'; }
        } else if (e.key === 'ArrowUp') {
            e.preventDefault();
            const prev = active ? active.previousElementSibling : opts[opts.length - 1];
            if (active) active.classList.remove('cidade-active');
            if (prev) { prev.classList.add('cidade-active'); prev.style.background = '#eff6ff'; prev.style.color = 'var(--brand-blue)'; }
        } else if (e.key === 'Enter' && active) {
            e.preventDefault();
            input.value = active.textContent.trim();
            dropdown.style.display = 'none';
        } else if (e.key === 'Escape') {
            dropdown.style.display = 'none';
        }
    });
}

// SELECIONAR CIDADE (select)
function preencherSelectCidades(selectId) {
    const sel = document.getElementById(selectId);
    if (!sel) return;

    const placeholder = sel.options[0] || new Option('Selecione sua cidade...', '');

    sel.innerHTML = '';
    sel.appendChild(placeholder);

    // SP primeiro
    const grupSP = document.createElement('optgroup');
    grupSP.label = 'São Paulo — SP';
    CIDADES_SP.forEach(cidade => {
        grupSP.appendChild(new Option(`${cidade}, SP`, `${cidade}, SP`));
    });
    sel.appendChild(grupSP);

    // demais estados
    const estados = {};
    CIDADES_OUTROS.forEach(cidade => {
        const partes = cidade.split(', ');
        const uf = partes[partes.length - 1];
        if (!estados[uf]) estados[uf] = [];
        estados[uf].push(cidade);
    });

    Object.keys(estados).sort().forEach(uf => {
        const nomes = {
            MG: 'Minas Gerais', RJ: 'Rio de Janeiro', PR: 'Paraná',
            BA: 'Bahia', PE: 'Pernambuco', CE: 'Ceará', RS: 'Rio Grande do Sul',
            GO: 'Goiás', SC: 'Santa Catarina', AM: 'Amazonas', PA: 'Pará',
            MA: 'Maranhão', RN: 'Rio Grande do Norte', AL: 'Alagoas',
            SE: 'Sergipe', RO: 'Rondônia', MT: 'Mato Grosso', MS: 'Mato Grosso do Sul',
            AP: 'Amapá', TO: 'Tocantins', AC: 'Acre', RR: 'Roraima',
        };
        const grup = document.createElement('optgroup');
        grup.label = `${nomes[uf] || uf} — ${uf}`;
        estados[uf].forEach(cidade => grup.appendChild(new Option(cidade, cidade)));
        sel.appendChild(grup);
    });

    // DARK MODE SYNC
    const syncDark = () => {
        const isDark = document.body.classList.contains('dark-mode');
        sel.style.background = isDark ? '#1a1a2e' : 'var(--white, #fff)';
        sel.style.color      = isDark ? '#d1d5db' : 'var(--gray-800, #1f2937)';
        sel.style.borderColor = isDark ? 'rgba(255,255,255,.12)' : 'var(--gray-200, #e5e7eb)';
    };
    syncDark();
    const observer = new MutationObserver(syncDark);
    observer.observe(document.body, { attributes: true, attributeFilter: ['class'] });
}

// CEP AUTOMÁTICO (ViaCEP)
// Uso: initCepLookup({ cepId, endId, cidadeSelectId, statusId, btnId })
function initCepLookup({ cepId, endId, cidadeSelectId, statusId, btnId }) {
    const cepEl    = document.getElementById(cepId);
    const btnEl    = document.getElementById(btnId);
    const statusEl = document.getElementById(statusId);
    if (!cepEl) return;

    // MÁSCARA 00000-000
    cepEl.addEventListener('input', function () {
        let v = this.value.replace(/\D/g, '').slice(0, 8);
        if (v.length > 5) v = v.slice(0, 5) + '-' + v.slice(5);
        this.value = v;
        if (statusEl && v.replace(/\D/g, '').length < 8) statusEl.textContent = '';
    });

    // ENTER dispara busca
    cepEl.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') { e.preventDefault(); executarBusca(); }
    });

    // BOTÃO clica busca
    if (btnEl) btnEl.addEventListener('click', executarBusca);

    async function executarBusca() {
        const cep = cepEl.value.replace(/\D/g, '');
        if (cep.length !== 8) {
            if (statusEl) { statusEl.style.color = 'var(--danger)'; statusEl.textContent = '⚠️ CEP precisa ter 8 dígitos.'; }
            return;
        }

        if (btnEl)    { btnEl.disabled = true; btnEl.textContent = 'Buscando...'; }
        if (statusEl) { statusEl.style.color = 'var(--gray-400)'; statusEl.textContent = 'Consultando ViaCEP...'; }

        try {
            const res  = await fetch(`https://viacep.com.br/ws/${cep}/json/`);
            const json = await res.json();

            if (json.erro) {
                if (statusEl) { statusEl.style.color = 'var(--danger)'; statusEl.textContent = '❌ CEP não encontrado.'; }
                return;
            }

            // preenche endereço
            const endEl = document.getElementById(endId);
            if (endEl) {
                const partes = [json.logradouro, json.bairro].filter(Boolean);
                if (partes.length) endEl.value = partes.join(', ');
            }

            // preenche cidade no select
            if (cidadeSelectId) {
                const cidadeStr = `${json.localidade}, ${json.uf}`;
                const sel = document.getElementById(cidadeSelectId);
                if (sel) {
                    const opt = Array.from(sel.options).find(o => o.value === cidadeStr);
                    if (opt) {
                        sel.value = cidadeStr;
                    } else {
                        const custom = new Option(cidadeStr, cidadeStr, true, true);
                        sel.appendChild(custom);
                        sel.value = cidadeStr;
                    }
                }
            }

            if (statusEl) {
                statusEl.style.color = 'var(--success)';
                statusEl.textContent = `✅ ${json.localidade} — ${json.uf}`;
            }
            if (typeof Toast !== 'undefined') Toast.success('Endereço preenchido automaticamente!');
        } catch (_) {
            if (statusEl) { statusEl.style.color = 'var(--danger)'; statusEl.textContent = '❌ Erro ao consultar o CEP.'; }
        } finally {
            if (btnEl) { btnEl.disabled = false; btnEl.textContent = '🔍 Buscar CEP'; }
        }
    }
}
