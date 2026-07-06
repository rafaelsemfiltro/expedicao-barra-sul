// Banco de eventos com decaimento exponencial por meia-vida (seção 6 do doc).
// Cada evento nasce com um peso inicial e vai perdendo relevância com o tempo:
// peso_atual = peso_inicial * 0.5^(idade / meia_vida).
//
// Eventos alimentam o DialogueEngine (sorteio ponderado) e a utility AI do
// NPCBrain (ZOAR usa deu_mole; VIAJAR pode consultar city_completed etc.).

export const MEIA_VIDA = {
  // segundos — na Fase 3 aceleramos porque o dia de jogo é curto.
  // Quando Supabase entrar (Fase 4), passamos pra dias reais.
  deu_mole:        600,   // 10 min
  city_completed:  900,
  rank_change:     720,
  player_said:     1200,
  absence:         720,
  encontro:        180,   // "vi fulano em X" — só serve pra evitar repetir
  cotidiano:       120
};

export const PESO_INICIAL = {
  deu_mole:        1.0,
  city_completed:  0.8,
  rank_change:     0.9,
  player_said:     0.7,
  absence:         0.6,
  encontro:        0.4,
  cotidiano:       0.3
};

export class MemoryBank {
  constructor(now = Date.now) {
    this.eventos = [];  // { id, kind, actor, target?, payload?, weight, ts }
    this._id = 1;
    this._now = now;
  }

  add(kind, { actor = null, target = null, payload = null, weight = null } = {}) {
    const w = weight ?? PESO_INICIAL[kind] ?? 0.5;
    const ev = {
      id: this._id++,
      kind, actor, target, payload,
      weight: w,
      ts: this._now()
    };
    this.eventos.push(ev);
    // Trim: mantém no máximo 200 eventos totais
    if (this.eventos.length > 200) this.eventos.splice(0, this.eventos.length - 200);
    return ev;
  }

  pesoAtual(ev, agora = this._now()) {
    const idadeSeg = (agora - ev.ts) / 1000;
    const mv = MEIA_VIDA[ev.kind] ?? 300;
    return ev.weight * Math.pow(0.5, idadeSeg / mv);
  }

  // Devolve os eventos filtrados, cada um com o peso atual. Ordem descendente.
  atuais(filtro = () => true, agora = this._now()) {
    const arr = [];
    for (const ev of this.eventos) {
      if (!filtro(ev)) continue;
      const p = this.pesoAtual(ev, agora);
      if (p < 0.02) continue;
      arr.push({ ev, peso: p });
    }
    arr.sort((a, b) => b.peso - a.peso);
    return arr;
  }

  // Sorteio ponderado por peso atual entre os eventos que passam no filtro.
  amostrar(filtro = () => true, agora = this._now()) {
    const pool = this.atuais(filtro, agora);
    if (pool.length === 0) return null;
    let total = 0;
    for (const { peso } of pool) total += peso;
    let r = Math.random() * total;
    for (const { ev, peso } of pool) {
      r -= peso;
      if (r <= 0) return ev;
    }
    return pool[0].ev;
  }

  ultimoEncontro(a, b, agora = this._now()) {
    for (let i = this.eventos.length - 1; i >= 0; i--) {
      const ev = this.eventos[i];
      if (ev.kind !== 'encontro') continue;
      const pares = [ev.actor, ev.target];
      if (pares.includes(a) && pares.includes(b)) {
        return { ev, idadeSeg: (agora - ev.ts) / 1000 };
      }
    }
    return null;
  }
}
