// Registro das 6 zonas do mundo (blockout — cores/posições, sem detalhes finos).
// Coordenadas em unidades de mundo. Norte = -Z, Sul = +Z, Leste (mar) = +X.

export const ZONAS = [
  {
    id: 'balneario-camboriu',
    nome: 'Balneário Camboriú',
    cor: 0xf5d76e,          // areia dourada
    corPredios: 0xf5f7fa,   // torres brancas
    centro: { x: 90, z: 0 },
    raio: 34,
    estilo: 'skyline',      // torres altas (verticalizado)
    slogan: 'Torres, praia e agito'
  },
  {
    id: 'bombinhas',
    nome: 'Bombinhas',
    cor: 0x9be7a3,          // verde claro
    corPredios: 0xff9f68,   // casas laranja
    centro: { x: 60, z: -95 },
    raio: 26,
    estilo: 'vilarejo',
    slogan: 'Água turquesa e sossego'
  },
  {
    id: 'florianopolis',
    nome: 'Florianópolis',
    cor: 0xd8e6f5,          // areia acinzentada
    corPredios: 0xdb7f7f,   // vermelho suave (ponte)
    centro: { x: 130, z: 100 },
    raio: 38,
    estilo: 'ilha',
    slogan: 'A ilha da magia'
  },
  {
    id: 'beto-carrero',
    nome: 'Beto Carrero World',
    cor: 0xffd166,          // amarelo parque
    corPredios: 0xef476f,   // rosa/vermelho
    centro: { x: -40, z: 40 },
    raio: 30,
    estilo: 'parque',
    slogan: 'Roda-gigante e adrenalina'
  },
  {
    id: 'blumenau',
    nome: 'Blumenau',
    cor: 0xc8e0b0,          // verde vale
    corPredios: 0xb23a48,   // vermelho enxaimel
    centro: { x: -110, z: -40 },
    raio: 30,
    estilo: 'enxaimel',
    slogan: 'Vale europeu e Oktoberfest'
  },
  {
    id: 'serra-rio-do-rastro',
    nome: 'Serra do Rio do Rastro',
    cor: 0x7a8f6a,          // verde-cinza serra
    corPredios: 0x5a4633,   // marrom madeira
    centro: { x: -170, z: 80 },
    raio: 36,
    estilo: 'serra',
    slogan: 'Curvas e mirantes'
  }
];

// Ponto de spawn do jogador (BC — o hub das vendas).
export const SPAWN = { x: 90, y: 0, z: 20 };

// Estradas: pares de zonas ligadas. BC é o hub.
export const ESTRADAS = [
  ['balneario-camboriu', 'bombinhas'],
  ['balneario-camboriu', 'florianopolis'],
  ['balneario-camboriu', 'beto-carrero'],
  ['beto-carrero', 'blumenau'],
  ['blumenau', 'serra-rio-do-rastro'],
  ['florianopolis', 'beto-carrero']
];

export function encontrarZona(x, z) {
  for (const z2 of ZONAS) {
    const dx = x - z2.centro.x;
    const dz = z - z2.centro.z;
    if (dx * dx + dz * dz <= z2.raio * z2.raio) return z2;
  }
  return null;
}
