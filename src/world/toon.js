import * as THREE from 'three';

// Paleta pastel do jogo. Um único lugar pra ajustar o "sabor" do mundo inteiro.
export const PALETA = {
  // Chão / natureza
  gramaClara:  0xb7e88a,
  gramaMedia:  0x8fd06a,
  gramaEscura: 0x6fa851,
  mar:         0x7ac9de,
  praia:       0xf5e4a8,
  troncoArvore:0x8a5a3a,
  copaArvore:  0x7fbf5f,

  // Céu (usado no CanvasTexture)
  ceuTopo:     '#8bc9e6',
  ceuMeio:     '#c6e6f2',
  ceuHorizonte:'#fbf1d8',

  // Zonas
  bcAreia:     0xf7e0a0,
  bcTorre:     0xfaf6ef,
  bombVerde:   0xb7e8b3,
  bombCasa:    0xffb27a,
  floripaAreia:0xd8e6f5,
  floripaPonte:0xe08c8c,
  betoAmarelo: 0xffe08a,
  betoRosa:    0xf47a9a,
  bluVale:     0xd1e5b8,
  bluEnxaimel: 0xc76a7a,
  bluParede:   0xf9f2df,
  bluViga:     0x5c3a25,
  serraVerde:  0x9ab48a,
  serraMorro:  0x8ba876,
  serraMadeira:0x8a6a4a,
  serraCabana: 0xd1a97a,

  // Personagem
  pele:        0xf5cba0,
  corpoAzul:   0x4fa8d8
};

export const PELE = PALETA.pele;

// Gradiente de 3 níveis — clássico visual toon (celshade). Uma textura só, reutilizada.
let _gradMap = null;
export function gerarGradientMap() {
  if (_gradMap) return _gradMap;
  const data = new Uint8Array([80, 80, 80, 180, 180, 180, 255, 255, 255]);
  const tex = new THREE.DataTexture(data, 3, 1, THREE.RedFormat);
  tex.needsUpdate = true;
  tex.magFilter = THREE.NearestFilter;
  tex.minFilter = THREE.NearestFilter;
  _gradMap = tex;
  return tex;
}

// Fábrica de material toon com defaults saudáveis. Use em quase tudo do mundo.
export function toonMaterial(color, opts = {}) {
  return new THREE.MeshToonMaterial({
    color,
    gradientMap: gerarGradientMap(),
    ...opts
  });
}
