const API = 'http://localhost:3000/colecao';

const PALETTE = [
  '#b8976a', '#d4b896', '#8a6e4b', '#e8d5b5',
  '#6b5035', '#c4a47a', '#f0e4cc', '#9a7d5a',
  '#7a5c3a', '#dfc9a0', '#4a3520', '#bfa080'
];

const fmtBRL = v => v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL', maximumFractionDigits: 0 });

Chart.defaults.font.family = "'Raleway', sans-serif";
Chart.defaults.color = '#8a7d72';
Chart.defaults.plugins.legend.labels.padding = 16;
Chart.defaults.plugins.legend.labels.usePointStyle = true;

async function init() {
  console.log(`[Charts] GET ${API}`);
  try {
    const res = await fetch(API);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const dados = await res.json();
    console.log(`[Charts] ${dados.length} itens carregados`, dados);

    document.getElementById('charts-loading').style.display = 'none';
    document.getElementById('charts-content').style.display = 'block';

    preencherStats(dados);
    graficoPizza(dados);
    graficoMediaCategoria(dados);
    graficoEpoca(dados);
    graficoDestaque(dados);
    graficoRanking(dados);

  } catch (err) {
    console.error('[Charts] Erro:', err);
    document.getElementById('charts-loading').style.display = 'none';
    document.getElementById('charts-error').style.display   = 'block';
  }
}

function preencherStats(dados) {
  const total      = dados.length;
  const categorias = new Set(dados.map(i => i.categoria)).size;
  const media      = dados.reduce((s, i) => s + i.preco, 0) / total;
  const maisAntiga = Math.min(...dados.map(i => i.ano));

  document.getElementById('stat-total').textContent      = total;
  document.getElementById('stat-categorias').textContent = categorias;
  document.getElementById('stat-media').textContent      = fmtBRL(media);
  document.getElementById('stat-mais-antiga').textContent = maisAntiga;
}

function graficoPizza(dados) {
  const contagem = {};
  dados.forEach(i => { contagem[i.categoria] = (contagem[i.categoria] || 0) + 1; });
  const labels = Object.keys(contagem);
  const values = Object.values(contagem);

  new Chart(document.getElementById('chart-pizza'), {
    type: 'pie',
    data: {
      labels,
      datasets: [{
        data: values,
        backgroundColor: PALETTE.slice(0, labels.length),
        borderColor: '#fff',
        borderWidth: 2,
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { position: 'bottom' },
        tooltip: {
          callbacks: {
            label: ctx => ` ${ctx.label}: ${ctx.parsed} peça(s)`
          }
        }
      }
    }
  });
}

function graficoMediaCategoria(dados) {
  const soma  = {};
  const count = {};
  dados.forEach(i => {
    soma[i.categoria]  = (soma[i.categoria]  || 0) + i.preco;
    count[i.categoria] = (count[i.categoria] || 0) + 1;
  });
  const labels = Object.keys(soma).sort((a, b) => soma[b]/count[b] - soma[a]/count[a]);
  const values = labels.map(l => Math.round(soma[l] / count[l]));

  new Chart(document.getElementById('chart-media-categoria'), {
    type: 'bar',
    data: {
      labels,
      datasets: [{
        label: 'Valor médio (R$)',
        data: values,
        backgroundColor: PALETTE[0],
        borderColor: PALETTE[2],
        borderWidth: 1,
        borderRadius: 2,
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: { legend: { display: false } },
      scales: {
        x: { grid: { display: false } },
        y: {
          ticks: {
            callback: v => 'R$ ' + v.toLocaleString('pt-BR')
          }
        }
      }
    }
  });
}

function graficoEpoca(dados) {
  const epocas = {};
  dados.forEach(i => {
    const seculo = Math.floor(i.ano / 100) * 100;
    const label  = `Séc. ${Math.floor(i.ano / 100) + 1} (${seculo}s)`;
    epocas[label] = (epocas[label] || 0) + 1;
  });
  const labels = Object.keys(epocas).sort();
  const values = labels.map(l => epocas[l]);

  new Chart(document.getElementById('chart-epoca'), {
    type: 'bar',
    data: {
      labels,
      datasets: [{
        label: 'Número de peças',
        data: values,
        backgroundColor: PALETTE.slice(0, labels.length).map(c => c + 'cc'),
        borderColor:     PALETTE.slice(0, labels.length),
        borderWidth: 1,
        borderRadius: 2,
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: { legend: { display: false } },
      scales: {
        x: { grid: { display: false } },
        y: { ticks: { stepSize: 1 } }
      }
    }
  });
}

function graficoDestaque(dados) {
  const destaque = dados.filter(i => i.destaque).length;
  const normal   = dados.length - destaque;

  new Chart(document.getElementById('chart-destaque'), {
    type: 'doughnut',
    data: {
      labels: ['Em destaque', 'Demais peças'],
      datasets: [{
        data: [destaque, normal],
        backgroundColor: [PALETTE[0], PALETTE[3]],
        borderColor: '#fff',
        borderWidth: 3,
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      cutout: '60%',
      plugins: {
        legend: { position: 'bottom' },
        tooltip: {
          callbacks: {
            label: ctx => ` ${ctx.label}: ${ctx.parsed} peça(s)`
          }
        }
      }
    }
  });
}

function graficoRanking(dados) {
  const ordenados = [...dados].sort((a, b) => b.preco - a.preco);
  const labels    = ordenados.map(i => i.titulo);
  const values    = ordenados.map(i => i.preco);
  const colors    = ordenados.map(i => i.destaque ? PALETTE[0] : PALETTE[3]);

  new Chart(document.getElementById('chart-ranking'), {
    type: 'bar',
    data: {
      labels,
      datasets: [{
        label: 'Valor (R$)',
        data: values,
        backgroundColor: colors,
        borderRadius: 2,
      }]
    },
    options: {
      indexAxis: 'y',
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { display: false },
        tooltip: {
          callbacks: {
            label: ctx => ' ' + fmtBRL(ctx.parsed.x)
          }
        }
      },
      scales: {
        x: {
          ticks: { callback: v => 'R$ ' + v.toLocaleString('pt-BR') }
        },
        y: {
          grid: { display: false },
          ticks: { font: { size: 11 } }
        }
      }
    }
  });
}

init();