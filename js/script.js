// js/script.js
// Lógica completa do jogo de Bingo (em português)
// Compatível com o index.html enviado:
// IDs esperados:
// - #numeroSorteado
// - #btnSortear
// - #btnReiniciar
// - #btnConferir
// - #listaSorteados
// - #listaGanhadores

document.addEventListener('DOMContentLoaded', () => {
  // ----- Elementos do DOM -----
  const elNumeroSorteado = document.getElementById('numeroSorteado');
  const btnSortear = document.getElementById('btnSortear');
  const btnReiniciar = document.getElementById('btnReiniciar');
  const btnConferir = document.getElementById('btnConferir');
  const elListaSorteados = document.getElementById('listaSorteados');
  const elListaGanhadores = document.getElementById('listaGanhadores');

  // ----- Parâmetros do jogo -----
  const NUM_MINIMO = 1;
 
  const pergunta = prompt('Qual a maior pedra a ser gritada nesse bingo?')
  const NUM_MAXIMO = pergunta;

  // ----- Estado em memória -----
  let numerosSorteados = [];   // array com a ordem dos sorteios
  let numerosRestantes = [];   // números que ainda podem ser sorteados

  // ----- Chaves para localStorage -----
  const CHAVES = {
    SORTEIOS: 'bingo_sorteios_v1',
    GANHADORES: 'bingo_ganhadores_v1'
  };

  // ----- Inicialização -----
  function inicializar() {
    montarPiscinaNumeros();
    restaurarEstadoPersistente();
    atualizarInterface(); // atualiza número atual, lista de sorteados e ganhadores
    atualizarBotoes();
  }

  function montarPiscinaNumeros() {
    numerosRestantes = [];
    numerosSorteados = [];
    for (let i = NUM_MINIMO; i <= NUM_MAXIMO; i++) numerosRestantes.push(i);
  }

  // ----- Render / UI -----
  function atualizarInterface() {
    renderizarNumeroAtual(); // mostra placeholder ou último sorteado
    renderizarListaSorteados();
    renderizarGanhadores();
  }

  function renderizarNumeroAtual(valor) {
    if (typeof valor === 'number') {
      elNumeroSorteado.textContent = valor;
      elNumeroSorteado.classList.add('ativo');
      // pequeno efeito visual (remover após 600ms)
      setTimeout(() => elNumeroSorteado.classList.remove('ativo'), 600);
    } else {
      elNumeroSorteado.textContent = '--';
    }
  }

  function renderizarListaSorteados() {
    elListaSorteados.innerHTML = '';
    if (!numerosSorteados || numerosSorteados.length === 0) {
      elListaSorteados.textContent = 'Nenhum número sorteado ainda.';
      return;
    }

    // criar badges para cada número sorteado
    const container = document.createElement('div');
    container.style.display = 'flex';
    container.style.flexWrap = 'wrap';
    container.style.justifyContent = 'center';
    container.style.gap = '8px';

    numerosSorteados.forEach(num => {
      const span = document.createElement('span');
      span.textContent = num;
      span.style.display = 'inline-flex';
      span.style.alignItems = 'center';
      span.style.justifyContent = 'center';
      span.style.minWidth = '36px';
      span.style.height = '36px';
      span.style.borderRadius = '8px';
      span.style.background = '#fff';
      span.style.border = '2px solid #0077b6';
      span.style.color = '#0077b6';
      span.style.fontWeight = '700';
      span.style.boxShadow = '0 2px 6px rgba(0,0,0,0.08)';
      container.appendChild(span);
    });

    elListaSorteados.appendChild(container);
  }

  function renderizarGanhadores() {
    const lista = carregarGanhadores();
    elListaGanhadores.innerHTML = '';

    if (!lista || lista.length === 0) {
      const li = document.createElement('li');
      li.textContent = 'Nenhum ganhador registrado.';
      elListaGanhadores.appendChild(li);
      return;
    }

    lista.forEach((item, índice) => {
      const li = document.createElement('li');
      li.style.display = 'flex';
      li.style.justifyContent = 'space-between';
      li.style.alignItems = 'center';
      li.style.gap = '8px';
      li.style.marginBottom = '8px';

      const texto = document.createElement('span');
      texto.textContent = `${item.nome} — ${item.data || 'data não informada'}`;
      texto.style.flex = '1';

      const btnExcluir = document.createElement('button');
      btnExcluir.textContent = 'Excluir';
      btnExcluir.style.marginLeft = '8px';
      btnExcluir.style.padding = '6px 8px';
      btnExcluir.style.border = 'none';
      btnExcluir.style.borderRadius = '6px';
      btnExcluir.style.background = '#ef4444';
      btnExcluir.style.color = '#fff';
      btnExcluir.style.cursor = 'pointer';
      btnExcluir.addEventListener('click', () => {
        if (!confirm(`Remover ganhador(a) "${item.nome}"?`)) return;
        removerGanhador(índice);
      });

      li.appendChild(texto);
      li.appendChild(btnExcluir);
      elListaGanhadores.appendChild(li);
    });
  }

  // ----- Persistência (localStorage) -----
  function salvarSorteiosNoStorage() {
    try {
      const obj = {
        sorteados: numerosSorteados,
        restantes: numerosRestantes
      };
      localStorage.setItem(CHAVES.SORTEIOS, JSON.stringify(obj));
    } catch (e) {
      console.warn('Erro ao salvar sorteios:', e);
    }
  }

  function restaurarEstadoPersistente() {
    try {
      const bruto = localStorage.getItem(CHAVES.SORTEIOS);
      if (!bruto) return;
      const obj = JSON.parse(bruto);
      if (Array.isArray(obj.sorteados)) numerosSorteados = obj.sorteados;
      if (Array.isArray(obj.restantes)) numerosRestantes = obj.restantes;
    } catch (e) {
      console.warn('Não foi possível restaurar sorteios:', e);
    }
  }

  function salvarGanhadores(lista) {
    try {
      localStorage.setItem(CHAVES.GANHADORES, JSON.stringify(lista || []));
    } catch (e) {
      console.warn('Erro ao salvar ganhadores:', e);
    }
  }

  function carregarGanhadores() {
    try {
      const bruto = localStorage.getItem(CHAVES.GANHADORES);
      return bruto ? JSON.parse(bruto) : [];
    } catch (e) {
      console.warn('Erro ao carregar ganhadores:', e);
      return [];
    }
  }

  // ----- Funções de gerência de ganhadores -----
  function adicionarGanhador(nome, data) {
    if (!nome || nome.trim() === '') {
      alert('Nome inválido.');
      return;
    }
    const lista = carregarGanhadores();
    lista.unshift({ nome: nome.trim(), data: data || dataAtualISO() });
    // limite opcional
    if (lista.length > 100) lista.pop();
    salvarGanhadores(lista);
    renderizarGanhadores();
    alert('Ganhador(a) adicionado com sucesso.');
  }

  function removerGanhador(índice) {
    const lista = carregarGanhadores();
    if (índice < 0 || índice >= lista.length) return;
    lista.splice(índice, 1);
    salvarGanhadores(lista);
    renderizarGanhadores();
  }

  function limparTodosGanhadores() {
    if (!confirm('Deseja remover todos os ganhadores salvos?')) return;
    localStorage.removeItem(CHAVES.GANHADORES);
    renderizarGanhadores();
  }

  function dataAtualISO() {
    const d = new Date();
    // formato YYYY-MM-DD
    return d.toISOString().slice(0, 10);
  }

  // ----- Lógica de sorteio -----
  function sortearAleatorioSemRepeticao() {
    if (!numerosRestantes || numerosRestantes.length === 0) {
      alert('Todos os números já foram sorteados. Reinicie o jogo para sortear novamente.');
      return null;
    }
    const índice = Math.floor(Math.random() * numerosRestantes.length);
    const numero = numerosRestantes.splice(índice, 1)[0];
    numerosSorteados.push(numero);
    salvarSorteiosNoStorage();
    return numero;
  }

  function sortear() {
    const numero = sortearAleatorioSemRepeticao();
    if (numero === null) return;
    renderizarNumeroAtual(numero);
    renderizarListaSorteados();
    atualizarBotoes();
  }

  function reiniciarJogo() {
    if (!confirm('Deseja reiniciar o jogo? Isso apagará os números sorteados.')) return;
    montarPiscinaNumeros();
    localStorage.removeItem(CHAVES.SORTEIOS);
    renderizarNumeroAtual();
    renderizarListaSorteados();
    atualizarBotoes();
  }

  function atualizarBotoes() {
    // desabilita sortear se não houver números restantes
    if (!numerosRestantes || numerosRestantes.length === 0) {
      btnSortear.disabled = true;
      btnSortear.style.opacity = '0.6';
      btnSortear.textContent = 'Sem números';
    } else {
      btnSortear.disabled = false;
      btnSortear.style.opacity = '1';
      btnSortear.textContent = 'Sortear Pedra';
    }
  }

  // ----- Ações rápidas / atalhos -----
  // Ao dar duplo clique no número sorteado, abre prompt para adicionar ganhador
  elNumeroSorteado.addEventListener('dblclick', () => {
    const atual = elNumeroSorteado.textContent;
    if (!atual || atual === '--') {
      alert('Não há número atual para registrar como ganhador.');
      return;
    }
    const nome = prompt(`Adicionar ganhador(a) para o número ${atual}. Digite o nome:`);
    if (!nome) return;
    const data = new Date()
    adicionarGanhador(nome, data);
  });

  // Tecla "g" abre prompt para adicionar ganhador manual (qualquer hora)
  document.addEventListener('keydown', (evt) => {
    if (evt.key.toLowerCase() === 'g') {
      const nome = prompt('Adicionar ganhador(a) - digite o nome:');
      if (!nome) return;
      const data = new Date()
      adicionarGanhador(nome, data );
    }
  });

  // Botões - ligações de eventos
  btnSortear.addEventListener('click', sortear);
  btnReiniciar.addEventListener('click', reiniciarJogo);
  btnConferir.addEventListener('click', () => {
    // rola até a lista de sorteados
    const insereGanhador = prompt('Insira o nome do ganhador');
    adicionarGanhador(insereGanhador);

    if (elListaSorteados) elListaSorteados.scrollIntoView({ behavior: 'smooth', block: 'center' });
  });

  // Expor API simples no window para testes e uso pelo console
  window.__bingo = {
    sortear,
    reiniciarJogo,
    adicionarGanhador,
    removerGanhador,
    limparTodosGanhadores,
    obterEstado: () => ({
      numerosSorteados: [...numerosSorteados],
      numerosRestantes: [...numerosRestantes],
      ganhadores: carregarGanhadores()
    })
  };

  // Inicializa
  inicializar();
});
