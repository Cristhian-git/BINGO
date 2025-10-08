alert('BEM VINDO');

// script.js
// Scaffold para o jogo de Bingo (compatível com o index.html enviado)
// IDs usados no HTML:
// - #numeroSorteado
// - #btnSortear
// - #btnReiniciar
// - #btnConferir
// - #listaSorteados
// - #listaGanhadores

document.addEventListener('DOMContentLoaded', () => {
  // --- Elementos DOM ---
  const elNumeroSorteado = document.getElementById('numeroSorteado');
  const btnSortear = document.getElementById('btnSortear');
  const btnReiniciar = document.getElementById('btnReiniciar');
  const btnConferir = document.getElementById('btnConferir');
  const elListaSorteados = document.getElementById('listaSorteados');
  const elListaGanhadores = document.getElementById('listaGanhadores');

  // --- Estado (base) ---
  // Você pode adaptar: por exemplo, mudar MIN/MAX para outro tipo de bingo
  const MIN_NUMBER = 1;
  const MAX_NUMBER = 75;

  // Estado em memória (vazio ao iniciar). Sua lógica pode preencher/manipular.
  let drawnNumbers = []; // números já sorteados, ordem cronológica
  let remainingNumbers = []; // números ainda disponíveis para sortear

  // --- Storage keys (para persistência simples no navegador) ---
  const STORAGE_KEYS = {
    WINNERS: 'bingo_winners_v1',
    DRAWN: 'bingo_drawn_v1' // opcional: se quiser persistir os sorteios
  };

  // -------------------------
  // Funções de inicialização
  // -------------------------
  function init() {
    resetNumberPools();
    loadPersistedState();
    renderCurrentNumber();    // mostra -- quando não há número
    renderDrawnList();
    renderWinners();
  }

  function resetNumberPools() {
    remainingNumbers = [];
    drawnNumbers = [];
    for (let i = MIN_NUMBER; i <= MAX_NUMBER; i++) remainingNumbers.push(i);
  }

  // -------------------------
  // Render / Atualização UI
  // -------------------------
  function renderCurrentNumber(value) {
    // Se value for undefined, mostra o placeholder
    elNumeroSorteado.textContent = (typeof value === 'number') ? value : '--';
  }

  function renderDrawnList() {
    elListaSorteados.innerHTML = ''; // limpa
    if (!drawnNumbers || drawnNumbers.length === 0) {
      elListaSorteados.textContent = 'Nenhum número sorteado ainda.';
      return;
    }
    // Exibe como texto separado por vírgula (você pode alterar para <li> se preferir)
    elListaSorteados.textContent = drawnNumbers.join(', ');
  }

  function renderWinners() {
    const winners = loadWinnersFromStorage();
    elListaGanhadores.innerHTML = '';

    if (!winners || winners.length === 0) {
      const li = document.createElement('li');
      li.textContent = 'Nenhum ganhador registrado.';
      elListaGanhadores.appendChild(li);
      return;
    }

    winners.forEach(w => {
      const li = document.createElement('li');
      li.textContent = `${w.name} — ${w.date || 'data não informada'}`;
      elListaGanhadores.appendChild(li);
    });
  }

  // -------------------------
  // Persistência simples (localStorage)
  // -------------------------
  function loadWinnersFromStorage() {
    try {
      const raw = localStorage.getItem(STORAGE_KEYS.WINNERS);
      return raw ? JSON.parse(raw) : [];
    } catch (e) {
      console.error('Erro ao ler ganhadores do storage', e);
      return [];
    }
  }
  function saveWinnersToStorage(list) {
    try {
      localStorage.setItem(STORAGE_KEYS.WINNERS, JSON.stringify(list || []));
    } catch (e) {
      console.error('Erro ao salvar ganhadores no storage', e);
    }
  }

  function loadPersistedState() {
    // Opcional: carregue drawnNumbers/remainingNumbers se quiser persistir sorteios
    try {
      const rawDrawn = localStorage.getItem(STORAGE_KEYS.DRAWN);
      if (rawDrawn) {
        const parsed = JSON.parse(rawDrawn);
        if (Array.isArray(parsed.drawn)) drawnNumbers = parsed.drawn;
        if (Array.isArray(parsed.remaining)) remainingNumbers = parsed.remaining;
      }
    } catch (e) {
      console.warn('Não foi possível restaurar estado de sorteios:', e);
    }
  }

  function savePersistedState() {
    // Opcional: chame quando quiser persistir o estado atual dos sorteios
    try {
      localStorage.setItem(STORAGE_KEYS.DRAWN, JSON.stringify({
        drawn: drawnNumbers,
        remaining: remainingNumbers
      }));
    } catch (e) {
      console.warn('Erro ao salvar estado de sorteios:', e);
    }
  }

  // -------------------------
  // Helpers para gerenciar ganhadores
  // -------------------------
  function addWinner(name, date) {
    const list = loadWinnersFromStorage();
    list.unshift({ name, date });
    // limite opcional para evitar lista muito grande
    if (list.length > 100) list.pop();
    saveWinnersToStorage(list);
    renderWinners();
  }

  function clearWinners() {
    if (!confirm('Deseja limpar todos os ganhadores?')) return;
    localStorage.removeItem(STORAGE_KEYS.WINNERS);
    renderWinners();
  }

  // -------------------------
  // Ponto de integração: lógica de sorteio
  // -------------------------
  // Abaixo há duas opções (exemplo):
  // 1) função de exemplo já implementada (drawRandomWithoutRepeat)
  // 2) espaço para você substituir pela sua lógica (por exemplo: puxar de servidor)
  //
  // Comentário: você disse que vai escrever a lógica. Mantenha/edite a função
  // drawNumber() abaixo conforme sua necessidade.

  function drawRandomWithoutRepeat() {
    // sorteio aleatório sem repetição (usa remainingNumbers)
    if (!remainingNumbers || remainingNumbers.length === 0) {
      alert('Todos os números já foram sorteados. Reinicie o jogo.');
      return null;
    }
    const idx = Math.floor(Math.random() * remainingNumbers.length);
    const num = remainingNumbers.splice(idx, 1)[0];
    drawnNumbers.push(num);
    savePersistedState();
    return num;
  }

  function drawNumber() {
    // === Opção A (usa a função de exemplo acima):
    const num = drawRandomWithoutRepeat();
    if (num !== null) {
      renderCurrentNumber(num);
      renderDrawnList();
    }

    // === Opção B (substitua aqui com sua lógica):
    // Exemplo de comentário: se você quiser buscar do servidor:
    // fetch('/api/sortear')
    //   .then(r => r.json())
    //   .then(data => {
    //     const num = data.numero; // formato imaginado
    //     drawnNumbers.push(num);
    //     renderCurrentNumber(num);
    //     renderDrawnList();
    //   });
  }

  function reiniciarJogo() {
    if (!confirm('Deseja reiniciar o jogo? Isso apagará os números sorteados.')) return;
    resetNumberPools();
    // também remover persistência se desejar:
    localStorage.removeItem(STORAGE_KEYS.DRAWN);
    renderCurrentNumber();
    renderDrawnList();
  }

  // -------------------------
  // Eventos (ligações)
  // -------------------------
  btnSortear.addEventListener('click', () => {
    // gateway para sua lógica de backend/servidor ou lógica local
    drawNumber();
  });

  btnReiniciar.addEventListener('click', () => {
    reiniciarJogo();
  });

  btnConferir.addEventListener('click', () => {
    // Pode abrir um modal, alternar visibilidade, ou apenas focar na lista.
    // Aqui eu faço um scroll até a lista e a deixo visível.
    if (elListaSorteados) {
      elListaSorteados.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  });

  // Exemplo de API para adicionar ganhador (você pode chamar isso de um formulário)
  // addWinner('Maria', '2025-10-07');

  // Inicializa tudo
  init();

  // Export (opcional) — permite testar no console pelo devtools:
  window.__bingo = {
    drawNumber,
    reiniciarJogo,
    addWinner,
    clearWinners,
    getState: () => ({ drawnNumbers: [...drawnNumbers], remainingNumbers: [...remainingNumbers] })
  };
});
