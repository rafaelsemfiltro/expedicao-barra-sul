import { niveis } from '../entities/CharacterCustomization.js';

// Painel de teste: slider de nível 1-6, grade de opções por slot. Aplica o look em
// tempo real no Character do player. Serve pra ver todos os visuais desbloqueáveis
// antes do sistema de XP/quiz existir (Fase 4).

export class CustomizationPanel {
  constructor(customization) {
    this.customization = customization;
    this.nivelAtual = 1;

    this.look = {
      corCorpo: null, cabelo: null, chapeu: null,
      oculos: null, roupa: null, acessorio: null, itemCidade: null
    };

    this._criarDOM();
  }

  _criarDOM() {
    const btn = document.createElement('button');
    btn.id = 'custom-toggle';
    btn.textContent = '👕 Visual';
    btn.setAttribute('aria-label', 'Abrir painel de customização');
    document.body.appendChild(btn);

    const painel = document.createElement('div');
    painel.id = 'custom-panel';
    painel.innerHTML = `
      <div class="custom-header">
        <span>Customização (Fase 2 — teste)</span>
        <button id="custom-close" aria-label="Fechar">×</button>
      </div>
      <div class="custom-body">
        <label class="custom-label">Nível: <b id="nivel-out">1</b> <span id="nivel-titulo"></span></label>
        <input type="range" id="nivel-slider" min="1" max="6" value="1" />
        <div id="custom-slots"></div>
        <button id="custom-reset" class="custom-reset">Zerar look</button>
      </div>
    `;
    document.body.appendChild(painel);

    btn.addEventListener('click', () => painel.classList.toggle('open'));
    painel.querySelector('#custom-close').addEventListener('click', () => painel.classList.remove('open'));

    const slider = painel.querySelector('#nivel-slider');
    const nivelOut = painel.querySelector('#nivel-out');
    const nivelTitulo = painel.querySelector('#nivel-titulo');
    const slotsDiv = painel.querySelector('#custom-slots');

    const atualizarNivel = () => {
      this.nivelAtual = parseInt(slider.value, 10);
      nivelOut.textContent = this.nivelAtual;
      const n = niveis().find(x => x.nivel === this.nivelAtual);
      nivelTitulo.textContent = n ? '— ' + n.titulo : '';
      this._renderSlots(slotsDiv);
    };
    slider.addEventListener('input', atualizarNivel);
    atualizarNivel();

    painel.querySelector('#custom-reset').addEventListener('click', () => {
      this.look = { corCorpo: null, cabelo: null, chapeu: null, oculos: null, roupa: null, acessorio: null, itemCidade: null };
      this.customization.aplicarLook(this.look);
      this._renderSlots(slotsDiv);
    });
  }

  _renderSlots(container) {
    const unlocks = this.customization.desbloqueiosAte(this.nivelAtual);
    const porSlot = {};
    for (const u of unlocks) {
      if (!porSlot[u.slot]) porSlot[u.slot] = [];
      porSlot[u.slot].push(u);
    }

    const labels = {
      corCorpo: 'Cor do corpo',
      cabelo: 'Cabelo',
      chapeu: 'Chapéu',
      oculos: 'Óculos',
      roupa: 'Roupa',
      acessorio: 'Acessório',
      itemCidade: 'Item de cidade'
    };

    container.innerHTML = '';
    if (Object.keys(porSlot).length === 0) {
      container.innerHTML = '<p class="custom-vazio">Nível 1 — sem desbloqueios ainda. Suba o slider!</p>';
      return;
    }

    for (const slot of ['corCorpo', 'cabelo', 'chapeu', 'oculos', 'roupa', 'acessorio', 'itemCidade']) {
      const opcoes = porSlot[slot];
      if (!opcoes) continue;
      const bloco = document.createElement('div');
      bloco.className = 'custom-slot';
      bloco.innerHTML = `<div class="custom-slot-label">${labels[slot]}</div><div class="custom-slot-opts"></div>`;
      const optsDiv = bloco.querySelector('.custom-slot-opts');

      // Opção "nenhum"
      const btnNone = document.createElement('button');
      btnNone.className = 'custom-opt' + (this.look[slot] === null ? ' selected' : '');
      btnNone.textContent = '—';
      btnNone.title = 'Nenhum';
      btnNone.addEventListener('click', () => {
        this.look[slot] = null;
        this.customization.aplicarLook(this.look);
        this._renderSlots(container);
      });
      optsDiv.appendChild(btnNone);

      for (const u of opcoes) {
        const btn = document.createElement('button');
        btn.className = 'custom-opt' + (this.look[slot] === u.id ? ' selected' : '');
        btn.style.background = u.hex || '#888';
        btn.title = u.nome;
        btn.textContent = u.nome.split(' ')[0];
        btn.addEventListener('click', () => {
          this.look[slot] = u.id;
          this.customization.aplicarLook(this.look);
          this._renderSlots(container);
        });
        optsDiv.appendChild(btn);
      }

      container.appendChild(bloco);
    }
  }

  update() {}
}
