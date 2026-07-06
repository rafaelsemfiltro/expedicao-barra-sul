// Registro das 6 zonas do mundo (blockout — cores/posições, sem detalhes finos).
// Coordenadas em unidades de mundo. Norte = -Z, Sul = +Z, Leste (mar) = +X.
// Mundo compacto: cidades a 40-90 unidades entre si (10-15s andando) — NPCs se
// esbarram com frequência, essencial pra Fase 3 (conversas espontâneas).

export const ZONAS = [
  {
    id: 'balneario-camboriu',
    nome: 'Balneário Camboriú',
    cor: 0xf7e0a0,
    corPredios: 0xfaf6ef,
    centro: { x: 55, z: 0 },
    raio: 26,
    estilo: 'skyline',
    slogan: 'Torres, praia e agito'
  },
  {
    id: 'bombinhas',
    nome: 'Bombinhas',
    cor: 0xb7e8b3,
    corPredios: 0xffb27a,
    centro: { x: 40, z: -60 },
    raio: 20,
    estilo: 'vilarejo',
    slogan: 'Água turquesa e sossego'
  },
  {
    id: 'florianopolis',
    nome: 'Florianópolis',
    cor: 0xdcecf5,
    corPredios: 0xe08c8c,
    centro: { x: 80, z: 65 },
    raio: 28,
    estilo: 'ilha',
    slogan: 'A ilha da magia'
  },
  {
    id: 'beto-carrero',
    nome: 'Beto Carrero World',
    cor: 0xffe08a,
    corPredios: 0xf47a9a,
    centro: { x: -25, z: 25 },
    raio: 22,
    estilo: 'parque',
    slogan: 'Roda-gigante e adrenalina'
  },
  {
    id: 'blumenau',
    nome: 'Blumenau',
    cor: 0xd1e5b8,
    corPredios: 0xc76a7a,
    centro: { x: -70, z: -25 },
    raio: 22,
    estilo: 'enxaimel',
    slogan: 'Vale europeu e Oktoberfest'
  },
  {
    id: 'serra-rio-do-rastro',
    nome: 'Serra do Rio do Rastro',
    cor: 0x9ab48a,
    corPredios: 0x8a6a4a,
    centro: { x: -105, z: 50 },
    raio: 26,
    estilo: 'serra',
    slogan: 'Curvas e mirantes'
  }
];

// Ponto de spawn do jogador (BC — o hub das vendas).
export const SPAWN = { x: 55, y: 0, z: 15 };

// Estradas: pares de zonas ligadas. BC é o hub.
export const ESTRADAS = [
  ['balneario-camboriu', 'bombinhas'],
  ['balneario-camboriu', 'florianopolis'],
  ['balneario-camboriu', 'beto-carrero'],
  ['beto-carrero', 'blumenau'],
  ['blumenau', 'serra-rio-do-rastro'],
  ['florianopolis', 'beto-carrero']
];

// Limite do mundo (usado pelo Player pra não sair do chão renderizado).
export const LIMITE_MUNDO = 220;

export function encontrarZona(x, z) {
  for (const zona of ZONAS) {
    const dx = x - zona.centro.x;
    const dz = z - zona.centro.z;
    if (dx * dx + dz * dz <= zona.raio * zona.raio) return zona;
  }
  return null;
}
