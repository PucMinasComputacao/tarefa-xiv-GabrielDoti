const API = 'http://localhost:3000/colecao';

const elLoading  = document.getElementById('loading-det');
const elError    = document.getElementById('error-det');
const elNotFound = document.getElementById('not-found');
const elDetalhe  = document.getElementById('detalhe');

function show(el) {
  [elLoading, elError, elNotFound, elDetalhe].forEach(e => e.style.display = 'none');
  el.style.display = 'block';
}

function fmtPreco(valor) {
  return valor.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}

const params = new URLSearchParams(window.location.search);
const id     = params.get('id');

if (!id) {
  show(elNotFound);
  elNotFound.textContent = 'Nenhum ID informado na URL.';
} else {
  carregarDetalhe(id);
}

async function carregarDetalhe(id) {
  try {
    const res = await fetch(`${API}/${id}`);

    if (res.status === 404) { show(elNotFound); return; }
    if (!res.ok) throw new Error(`HTTP ${res.status}`);

    const item = await res.json();
    renderizarDetalhe(item);

  } catch (err) {
    show(elError);
    console.error('Erro ao buscar detalhe:', err);
  }
}

function renderizarDetalhe(item) {
  document.title = `${item.titulo} — Coleção Joia`;

  document.getElementById('d-imagem').src              = item.imagem;
  document.getElementById('d-imagem').alt              = item.titulo;
  document.getElementById('d-categoria').textContent   = item.categoria;
  document.getElementById('d-titulo').textContent      = item.titulo;
  document.getElementById('d-descricao').textContent   = item.descricao;
  document.getElementById('d-preco').textContent       = fmtPreco(item.preco);
  document.getElementById('d-material').textContent    = item.material;
  document.getElementById('d-ano').textContent         = item.ano;
  document.getElementById('d-origem').textContent      = item.origem;
  document.getElementById('d-dimensoes').textContent   = item.dimensoes;
  document.getElementById('d-peso').textContent        = item.peso;
  document.getElementById('d-estado').textContent      = item.estado;

  if (item.destaque) {
    document.getElementById('d-badge').style.display = 'block';
  }

  show(elDetalhe);
}