import * as THREE from 'three';
import { ZONAS, LIMITE_MUNDO } from '../data/zonas.js';

// Espalha árvores procedurais (tronco marrom + copa verde/oval) no terreno,
// evitando os círculos das zonas e as estradas. Reduz gate visual "chão vazio".

const TRUNK_MAT = new THREE.MeshStandardMaterial({ color: 0x6b4a2b, roughness: 0.95 });
const LEAVES_PALETTE = [0x4a7c3a, 0x5a8f45, 0x3f6a34, 0x6ba050];

export class Vegetation {
  constructor(scene, { quantidade = 220 } = {}) {
    this.group = new THREE.Group();
    this.group.name = 'vegetation';
    const rand = mulberry32(1337);   // seed fixa pra layout reproduzível
    let placed = 0;
    let attempts = 0;
    while (placed < quantidade && attempts < quantidade * 6) {
      attempts++;
      const x = (rand() - 0.5) * 2 * (LIMITE_MUNDO - 10);
      const z = (rand() - 0.5) * 2 * (LIMITE_MUNDO - 10);
      if (this._insideAnyZone(x, z, 4)) continue;      // não dentro de cidade
      if (this._perto180Litoral(x)) continue;          // não na praia
      const arvore = this._makeTree(rand);
      arvore.position.set(x, 0, z);
      arvore.rotation.y = rand() * Math.PI * 2;
      this.group.add(arvore);
      placed++;
    }
    scene.add(this.group);
  }

  _insideAnyZone(x, z, margem) {
    for (const zona of ZONAS) {
      const dx = x - zona.centro.x;
      const dz = z - zona.centro.z;
      const r = zona.raio + margem;
      if (dx * dx + dz * dz <= r * r) return true;
    }
    return false;
  }

  // Praia + orla do mar estão em x ~ 180-200 no Terrain
  _perto180Litoral(x) { return x > 160; }

  _makeTree(rand) {
    const g = new THREE.Group();
    const alturaTronco = 1.3 + rand() * 0.8;
    const raioTronco = 0.18 + rand() * 0.1;
    const tronco = new THREE.Mesh(
      new THREE.CylinderGeometry(raioTronco, raioTronco * 1.2, alturaTronco, 6),
      TRUNK_MAT
    );
    tronco.position.y = alturaTronco / 2;
    tronco.castShadow = true;
    g.add(tronco);

    const raioCopa = 0.9 + rand() * 0.6;
    const cor = LEAVES_PALETTE[Math.floor(rand() * LEAVES_PALETTE.length)];
    const copa = new THREE.Mesh(
      new THREE.IcosahedronGeometry(raioCopa, 0),
      new THREE.MeshStandardMaterial({ color: cor, roughness: 0.9, flatShading: true })
    );
    copa.position.y = alturaTronco + raioCopa * 0.6;
    copa.scale.set(1, 1.15, 1);
    copa.castShadow = true;
    g.add(copa);

    return g;
  }

  update() { /* estático */ }
}

// PRNG determinístico simples pra árvores nascerem sempre no mesmo lugar
function mulberry32(seed) {
  let a = seed;
  return () => {
    a |= 0; a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
