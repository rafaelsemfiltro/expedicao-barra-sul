// Resolve relações entre pares de personagens a partir do personagens.json.
// Não precisa de arquivo separado: as amizades/rivalidades já estão declaradas
// em cada personagem. Isso aqui só torna a consulta ergonômica.

export class SocialGraph {
  constructor(personagens) {
    this.porId = new Map(personagens.map(p => [p.id, p]));
  }

  // 'amigo' | 'rival' | 'neutro'
  relacao(a, b) {
    if (a === b) return 'self';
    const pa = this.porId.get(a);
    if (!pa) return 'neutro';
    if (pa.social.amigos.includes(b)) return 'amigo';
    if (pa.social.rivais.includes(b)) return 'rival';
    // Relações são simétricas — se b lista a como rival, tratamos como rival.
    const pb = this.porId.get(b);
    if (pb) {
      if (pb.social.amigos.includes(a)) return 'amigo';
      if (pb.social.rivais.includes(a)) return 'rival';
    }
    return 'neutro';
  }

  amigosDe(id) {
    const p = this.porId.get(id);
    return p ? [...p.social.amigos] : [];
  }

  rivaisDe(id) {
    const p = this.porId.get(id);
    return p ? [...p.social.rivais] : [];
  }

  // Afinidade numérica pra utility AI: 1 = melhor amigo, -1 = rival, 0 = neutro
  afinidade(a, b) {
    const r = this.relacao(a, b);
    if (r === 'amigo') return 0.9;
    if (r === 'rival') return -0.7;
    return 0;
  }
}
