const API = 'http://localhost:3000/colecao';

const grid    = document.getElementById('cards-grid');
const loading = document.getElementById('loading');
const errMsg  = document.getElementById('error-msg');

function fmtPreco(valor) {
  return valor.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}

function criarCard(item) {
  const card = document.createElement('article');
  card.className = 'card';
  card.innerHTML = `
    <img src="${item.imagem}" alt="${item.titulo}" loading="lazy" />
    ${item.destaque ? '<span class="card-badge">Destaque</span>' : ''}
    <div class="card-body">
      <h3 class="card-titulo">${item.titulo}</h3>
      <p class="card-meta">${item.categoria} · ${item.ano} · ${item.origem}</p>
      <p class="card-meta">${item.material}</p>
      <p class="card-preco">${fmtPreco(item.preco)}</p>
    </div>
    <a class="btn-detalhes" href="details.html?id=${item.id}">Ver detalhes</a>
  `;
  return card;
}

function renderizar(itens) {
  grid.innerHTML = '';
  if (itens.length === 0) {
    grid.innerHTML = '<p style="grid-column:1/-1;text-align:center;color:var(--muted);font-style:italic">Nenhuma peça encontrada.</p>';
    return;
  }
  itens.forEach((item, i) => {
    const card = criarCard(item);
    card.style.animationDelay = `${i * 0.07}s`;
    grid.appendChild(card);
  });
}

async function carregarAcervo() {
  try {
    const res = await fetch(API);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const dados = await res.json();
    loading.style.display = 'none';
    renderizar(dados);
    window._acervo = dados;
  } catch (err) {
    loading.style.display = 'none';
    errMsg.style.display  = 'block';
    console.error('Erro ao buscar acervo:', err);
  }
}

function buscar() {
  const termo = document.getElementById('busca-input').value.trim().toLowerCase();
  if (!window._acervo) return;
  if (!termo) { renderizar(window._acervo); return; }
  const filtrados = window._acervo.filter(i =>
    i.titulo.toLowerCase().includes(termo)    ||
    i.categoria.toLowerCase().includes(termo) ||
    i.material.toLowerCase().includes(termo)  ||
    i.origem.toLowerCase().includes(termo)
  );
  renderizar(filtrados);
}

document.getElementById('busca-btn').addEventListener('click', buscar);
document.getElementById('busca-input').addEventListener('keydown', e => {
  if (e.key === 'Enter') buscar();
});

carregarAcervo();
  