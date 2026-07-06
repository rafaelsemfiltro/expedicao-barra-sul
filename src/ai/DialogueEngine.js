// DialogueEngine — pipeline 4 passos, tudo local (seção 7 do doc):
// 1. CONTEXTO: quem, pra quem, cidade, relação
// 2. ASSUNTO: sorteia proporcional ao MemoryBank + assuntos favoritos do falante
// 3. TEMPLATE: template random do tema, com anti-repetição por par de personagens
// 4. VOZ: VoiceFilter aplica bordão e estilo do falante
//
// Templates ficam em cooldown de N segundos por par pra não repetir a mesma
// piada pra mesma dupla. O par (a,b) é ordenado — dá igual quem falou primeiro.
//
// REGRA DE OURO (PROJETO-MESTRE): provocações só falam de trabalho —
// desempenho de venda, meta, ranking, quiz. Nunca sobre traço pessoal
// (aparência, origem, condição, família). Os templates em grammar/provocacoes
// respeitam isso e novos templates devem seguir a mesma regra.

import cotidiano   from './grammar/cotidiano.js';
import destinos    from './grammar/destinos.js';
import provocacoes from './grammar/provocacoes.js';
import sumidos     from './grammar/sumidos.js';
import { VoiceFilter } from './VoiceFilter.js';

const TEMAS = { cotidiano, destinos, provocacoes, sumidos };
const COOLDOWN_TEMPLATE = 90; // segundos que o mesmo template não repete pro mesmo par

export class DialogueEngine {
  constructor({ personagens, socialGraph, memoryBank, now = Date.now }) {
    this.porId = new Map(personagens.map(p => [p.id, p]));
    this.social = socialGraph;
    this.memory = memoryBank;
    this._now = now;
    this._cooldowns = new Map(); // key "a|b|templateIdx|tema" -> ts
  }

  // Gera fala de `falanteId` pra `ouvinteId` na cidade `nomeCidade`.
  // Retorna { texto, tema, assunto } — o brain publica no feed / balão.
  gerar(falanteId, ouvinteId, nomeCidade) {
    const falante = this.porId.get(falanteId);
    if (!falante) return null;

    const tema = this._escolherTema(falanteId, ouvinteId);
    const contexto = this._montarContexto(falanteId, ouvinteId, nomeCidade, tema);
    const template = this._escolherTemplate(tema, falanteId, ouvinteId);
    if (!template) return null;

    const voz = new VoiceFilter(falante);
    const texto = voz.aplicar(template.texto, contexto);

    return { texto, tema, tipo: template.tipo, falante: falanteId, ouvinte: ouvinteId };
  }

  _escolherTema(a, b) {
    const pa = this.porId.get(a);
    const relacao = this.social.relacao(a, b);

    // Pesos base
    const pesos = { cotidiano: 1.0, destinos: 1.2 };
    if (relacao === 'rival') pesos.provocacoes = 1.6;

    // Assuntos favoritos empurram o tema
    const favs = pa.social.assuntos_favoritos || [];
    if (favs.includes('provocacao') && relacao === 'rival') pesos.provocacoes = (pesos.provocacoes || 0.4) + 0.6;
    if (favs.includes('destinos'))                          pesos.destinos    += 0.5;
    if (favs.includes('vida_alheia'))                       pesos.sumidos      = (pesos.sumidos || 0.3) + 0.5;
    if (favs.includes('cotidiano'))                         pesos.cotidiano   += 0.5;

    // Se tem alguém "ausente" no MemoryBank, sumidos ganha bônus
    const evAbs = this.memory.amostrar(e => e.kind === 'absence');
    if (evAbs) pesos.sumidos = (pesos.sumidos || 0.3) + 0.8;

    // Personalidade: fofoqueiro puxa vida_alheia; competitivo puxa destinos/venda
    if (pa.personalidade.fofoca > 0.7)          pesos.sumidos = (pesos.sumidos || 0.3) + 0.3;
    if (pa.personalidade.competitividade > 0.8) pesos.destinos += 0.3;

    return sortearPorPeso(pesos);
  }

  _montarContexto(a, b, cidade, tema) {
    const pa = this.porId.get(a);
    const pb = this.porId.get(b);

    const ctx = {
      nome: pa.nome,
      alvo: pb ? pb.nome : 'você',
      cidade
    };

    if (tema === 'sumidos') {
      const evAbs = this.memory.amostrar(e => e.kind === 'absence');
      const alvoId = evAbs?.target || evAbs?.actor;
      const pAus = alvoId ? this.porId.get(alvoId) : null;
      if (pAus) ctx.ausente = pAus.nome;
    }

    return ctx;
  }

  _escolherTemplate(tema, a, b) {
    const pool = TEMAS[tema];
    if (!pool || pool.length === 0) return null;

    const parKey = [a, b].sort().join('|');
    const agora = this._now();

    // Filtra em cooldown
    const disponiveis = pool
      .map((t, i) => ({ t, i }))
      .filter(({ i }) => {
        const key = `${parKey}|${tema}|${i}`;
        const ts = this._cooldowns.get(key);
        if (!ts) return true;
        return (agora - ts) / 1000 > COOLDOWN_TEMPLATE;
      });

    const pick = disponiveis.length > 0 ? disponiveis : pool.map((t, i) => ({ t, i }));
    const idx = Math.floor(Math.random() * pick.length);
    const escolhido = pick[idx];
    this._cooldowns.set(`${parKey}|${tema}|${escolhido.i}`, agora);
    return escolhido.t;
  }
}

function sortearPorPeso(map) {
  let total = 0;
  for (const k in map) total += map[k];
  let r = Math.random() * total;
  for (const k in map) {
    r -= map[k];
    if (r <= 0) return k;
  }
  return Object.keys(map)[0];
}
