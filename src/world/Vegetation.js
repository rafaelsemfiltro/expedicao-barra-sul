import * as THREE from 'three';
import { toonMaterial, PALETA } from './toon.js';
import { ZONAS, LIMITE_MUNDO } from '../data/zonas.js';

// Árvores procedurais toon. Layout com seed fixa pra ficar sempre igual.

const TRUNK_MAT = toonMaterial(PALETA.troncoArvore);
const LEAVES_MATS = [
  toonMaterial(0x9ed67d),
  toonMaterial(0x7fbf5f),
  toonMaterial(0xb5e39a),
  toonMaterial(0x6fa851)
];

export class Vegetation {
  constructor(scene, { quantidade = 200 } = {}) {
    this.group = new THREE.Group();
    this.group.name = 'vegetation';
    const rand = mulberry32(1337);
    let placed = 0;
    let attempts = 0;
    while (placed < quantidade && attempts < quantidade * 6) {
      attempts++;
      const x = (rand() - 0.5) * 2 * (LIMITE_MUNDO - 10);
      const z = (rand() - 0.5) * 2 * (LIMITE_MUNDO - 10);
      if (this._insideAnyZone(x, z, 4)) continue;
      if (this._pertoDoLitoral(x)) continue;
      const arvore = this._makeTree(rand);
      arvore.position.set(x, 0, z);
      arvore.rotation.y = rand() * Math.PI * 2;
      const escala = 0.85 + rand() * 0.5;
      arvore.scale.setScalar(escala);
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

  _pertoDoLitoral(x) { return x > 100; }

  _makeTree(rand) {
    const g = new THREE.Group();
    const alturaTronco = 1.3 + rand() * 0.8;
    const raioTronco = 0.20 + rand() * 0.08;
    const tronco = new THREE.Mesh(
      new THREE.CylinderGeometry(raioTronco * 0.85, raioTronco * 1.15, alturaTronco, 6),
      TRUNK_MAT
    );
    tronco.position.y = alturaTronco / 2;
    tronco.castShadow = true;
    g.add(tronco);

    const mat = LEAVES_MATS[Math.floor(rand() * LEAVES_MATS.length)];

    // 2-3 esferas amontoadas dão silhueta mais interessante
    const bolhas = 2 + Math.floor(rand() * 2);
    for (let i = 0; i < bolhas; i++) {
      const raio = 0.8 + rand() * 0.5;
      const bola = new THREE.Mesh(new THREE.IcosahedronGeometry(raio, 0), mat);
      bola.position.set(
        (rand() - 0.5) * 0.35,
        alturaTronco + raio * 0.5 + i * 0.35,
        (rand() - 0.5) * 0.35
      );
      bola.scale.set(1, 0.95, 1);
      bola.castShadow = true;
      g.add(bola);
    }

    return g;
  }

  update() {}
}

function mulberry32(seed) {
  let a = seed;
  return () => {
    a |= 0; a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
