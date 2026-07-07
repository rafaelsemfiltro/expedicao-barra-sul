// NPCBrain — utility AI: a cada tick de decisão (~4-8s), pontua estados possíveis
// com base em personalidade + contexto e escolhe o vencedor com jitter aleatório.
// Executa até completar (chegou no destino) ou até estourar duração máxima.
//
// Estados nesta fase:
//   IDLE         parado, aguardando próxima decisão
//   PASSEAR      caminhar até ponto random dentro da cidade atual
//   VIAJAR       ir até o centro de outra cidade
//   OBSERVAR     parar N segundos "olhando" ao redor
//   FORMAR_RODA  ir até um grupo de 1-3 NPCs próximos
//   CONVERSAR    trocar 2-6 falas com quem está por perto
//   DESCANSAR    pausa longa
//
// ZOAR e CELEBRAR ficam preparados mas só disparam com eventos que só existirão
// depois (deu_mole, city_completed — Fase 4+).

import { ZONAS, encontrarZona } from '../data/zonas.js';

const RAIO_RODA = 4.0;         // NPCs a até 4m formam roda
const DIST_CONVERSAR = 3.5;    // conversa até essa distância
const MIN_DELAY_DECISAO = 4;
const MAX_DELAY_DECISAO = 8;

export class NPCBrain {
  constructor({ personagem, npc, npcs, social, memory, dialogue, bubbles, now = Date.now }) {
    this.p = personagem;
    this.npc = npc;
    this.npcs = npcs;         // referência aos outros NPCs pra proximidade
    this.social = social;
    this.memory = memory;
    this.dialogue = dialogue;
    this.bubbles = bubbles;
    this._now = now;

    this.estado = 'IDLE';
    this._tempoAteDecidir = 1 + Math.random() * 2;   // primeira decisão em 1-3s
    this._tempoNoEstado = 0;
    this._estadoData = null;
    this._proximaFalaEm = 0;
    this._falasRestantes = 0;
  }

  get id() { return this.p.id; }

  update(dt) {
    this._tempoAteDecidir -= dt;
    this._tempoNoEstado += dt;

    // Roda conforme o estado
    switch (this.estado) {
      case 'PASSEAR':
      case 'VIAJAR':
      case 'FORMAR_RODA':
        this._executarIrPara(dt); break;
      case 'OBSERVAR':
      case 'DESCANSAR':
        this._executarEsperar(); break;
      case 'CONVERSAR':
        this._executarConversar(dt); break;
    }

    if (this._tempoAteDecidir <= 0) this._decidir();
  }

  _decidir() {
    // Se está conversando, deixa terminar
    if (this.estado === 'CONVERSAR' && this._falasRestantes > 0) {
      this._tempoAteDecidir = 1;
      return;
    }

    const utilidades = this._calcularUtilidades();

    // Aplica jitter
    for (const k in utilidades) utilidades[k] += (Math.random() - 0.5) * 0.15;

    // Pega o vencedor (com peso positivo)
    let melhor = null; let melhorU = -Infinity;
    for (const k in utilidades) {
      if (utilidades[k] > melhorU) { melhorU = utilidades[k]; melhor = k; }
    }

    this._entrar(melhor);
    this._tempoAteDecidir = MIN_DELAY_DECISAO + Math.random() * (MAX_DELAY_DECISAO - MIN_DELAY_DECISAO);
  }

  _calcularUtilidades() {
    const p = this.p.personalidade;
    const u = {};

    // Base energética
    u.PASSEAR = 0.4 + p.energia * 0.4;
    u.VIAJAR  = 0.2 + p.competitividade * 0.5;   // competitivos "farmam presença" nas cidades
    u.OBSERVAR = 0.3 + (1 - p.energia) * 0.3;
    u.DESCANSAR = 0.15 + (1 - p.energia) * 0.5;

    // Formar roda: fofoqueiros + humor alto
    u.FORMAR_RODA = 0.3 + p.fofoca * 0.5 + p.humor * 0.2;

    // Se já tem alguém perto, boost em FORMAR_RODA
    const perto = this._npcsProximos(RAIO_RODA + 1.5);
    if (perto.length > 0) u.FORMAR_RODA += 0.4 + perto.length * 0.15;

    // Se já está numa roda (tem alguém em raio de conversa), pode CONVERSAR direto
    const naRoda = this._npcsProximos(DIST_CONVERSAR);
    if (naRoda.length > 0) u.CONVERSAR = 0.9 + p.fofoca * 0.4;
    else                   u.CONVERSAR = -1;  // sem alvo, não conversa

    // Estados repetidos ficam menos atrativos
    const repeat = this.estado;
    if (repeat && repeat !== 'IDLE') u[repeat] = (u[repeat] || 0) - 0.35;

    return u;
  }

  _entrar(novoEstado) {
    if (this.p.id === 'brenda' || this.p.id === 'joana') {
      console.log('[brain ' + this.p.id + '] ' + this.estado + ' -> ' + novoEstado);
    }
    this.estado = novoEstado;
    this._tempoNoEstado = 0;
    this._estadoData = null;

    switch (novoEstado) {
      case 'PASSEAR':      return this._setupPassear();
      case 'VIAJAR':       return this._setupViajar();
      case 'OBSERVAR':     return this._setupObservar();
      case 'DESCANSAR':    return this._setupDescansar();
      case 'FORMAR_RODA':  return this._setupFormarRoda();
      case 'CONVERSAR':    return this._setupConversar();
    }
  }

  // === setups ===

  _setupPassear() {
    const cidade = this._cidadeAtual() || this._cidadeById(this.p.cidade_base);
    const ang = Math.random() * Math.PI * 2;
    const r = Math.random() * (cidade.raio - 3);
    this._estadoData = {
      alvo: { x: cidade.centro.x + Math.cos(ang) * r, z: cidade.centro.z + Math.sin(ang) * r },
      duracaoMax: 20
    };
  }

  _setupViajar() {
    const atualId = this._cidadeAtual()?.id;
    const opcoes = ZONAS.filter(z => z.id !== atualId);
    const destino = opcoes[Math.floor(Math.random() * opcoes.length)];
    this._estadoData = {
      alvo: { x: destino.centro.x, z: destino.centro.z },
      cidade: destino,
      duracaoMax: 60
    };
  }

  _setupObservar() {
    this._estadoData = { duracao: 4 + Math.random() * 4 };
  }

  _setupDescansar() {
    this._estadoData = { duracao: 8 + Math.random() * 6 };
  }

  _setupFormarRoda() {
    const perto = this._npcsProximos(25);
    if (perto.length === 0) { this.estado = 'IDLE'; return; }
    const alvo = perto[Math.floor(Math.random() * perto.length)];
    this._estadoData = {
      alvo: { x: alvo.npc.position.x, z: alvo.npc.position.z },
      npcAlvo: alvo.npc,
      duracaoMax: 30
    };
  }

  _setupConversar() {
    const naRoda = this._npcsProximos(DIST_CONVERSAR);
    if (naRoda.length === 0) { this.estado = 'IDLE'; return; }
    const alvo = naRoda[0].npc;
    this._estadoData = {
      alvoNpc: alvo,
      turnos: 2 + Math.floor(Math.random() * 4)
    };
    this._falasRestantes = this._estadoData.turnos;
    this._proximaFalaEm = 0.3 + Math.random() * 0.5;

    this._registrarEncontro(alvo.brain.p.id);
  }

  // === execução por frame ===

  _executarIrPara(dt) {
    const alvo = this._estadoData?.alvo;
    if (!alvo) { this.estado = 'IDLE'; return; }
    const chegou = this.npc.moverPara(alvo, dt);
    if (chegou || this._tempoNoEstado > (this._estadoData.duracaoMax || 30)) {
      this.estado = 'IDLE';
      this._tempoAteDecidir = 0.5;
    }
  }

  _executarEsperar() {
    if (this._tempoNoEstado >= this._estadoData.duracao) {
      this.estado = 'IDLE';
      this._tempoAteDecidir = 0.5;
    }
  }

  _executarConversar(dt) {
    if (this._falasRestantes <= 0) {
      this.estado = 'IDLE';
      this._tempoAteDecidir = 1;
      return;
    }
    this._proximaFalaEm -= dt;
    if (this._proximaFalaEm > 0) return;

    const alvo = this._estadoData.alvoNpc;
    if (!alvo || this._distanciaXZ(alvo.position, this.npc.position) > DIST_CONVERSAR + 1) {
      this.estado = 'IDLE'; return;
    }

    // NPC vira pro alvo enquanto fala
    this.npc.olharPara(alvo.position);

    const cidadeAtual = this._cidadeAtual()?.nome || 'Santa Catarina';
    const fala = this.dialogue.gerar(this.p.id, alvo.brain.p.id, cidadeAtual);
    if (fala) {
      this.bubbles.mostrar(this.npc, fala.texto, 3.5);
    }
    this._falasRestantes--;
    this._proximaFalaEm = 2.5 + Math.random() * 1.5;
  }

  // === helpers ===

  _cidadeAtual() {
    return encontrarZona(this.npc.position.x, this.npc.position.z);
  }

  _cidadeById(id) {
    return ZONAS.find(z => z.id === id) || ZONAS[0];
  }

  _npcsProximos(raio) {
    const meu = this.npc.position;
    const arr = [];
    for (const other of this.npcs) {
      if (other === this.npc) continue;
      const d = this._distanciaXZ(other.position, meu);
      if (d <= raio) arr.push({ npc: other, d });
    }
    arr.sort((a, b) => a.d - b.d);
    return arr;
  }

  _distanciaXZ(a, b) {
    const dx = a.x - b.x, dz = a.z - b.z;
    return Math.hypot(dx, dz);
  }

  _registrarEncontro(outroId) {
    this.memory.add('encontro', { actor: this.p.id, target: outroId });
  }
}
