import * as THREE from 'three';
import { chaoZona, placaZona, predioBox, distribuirAoRedor } from './_common.js';
import { toonMaterial, PALETA } from '../toon.js';

// Vilarejo: casinhas coloridas baixinhas + palmeiras.
export function build(scene, zona) {
  const g = new THREE.Group();
  g.name = 'zona-' + zona.id;
  g.add(chaoZona(zona));

  const grupoCasas = new THREE.Group();
  grupoCasas.position.set(zona.centro.x, 0, zona.centro.z);

  const tonsCasas = [0xffb27a, 0xffe08a, 0xffcbd2, 0x9ed9d6, 0xffd6a0];

  distribuirAoRedor(grupoCasas, zona, 10, 5, (i) => {
    const casa = new THREE.Group();
    const parede = predioBox(4, 3, 4, tonsCasas[i % tonsCasas.length]);
    parede.position.y = 1.5;
    casa.add(parede);

    const telhado = new THREE.Mesh(
      new THREE.ConeGeometry(3.2, 2, 4),
      toonMaterial(0xc76a55)
    );
    telhado.rotation.y = Math.PI / 4;
    telhado.position.y = 4;
    telhado.castShadow = true;
    casa.add(telhado);
    return casa;
  });

  // 4 palmeiras
  for (let i = 0; i < 4; i++) {
    const ang = (i / 4) * Math.PI * 2 + 0.5;
    const r = zona.raio - 5;
    const pos = { x: Math.cos(ang) * r, z: Math.sin(ang) * r };
    grupoCasas.add(palmeiraEm(pos));
  }

  g.add(grupoCasas);
  g.add(placaZona(zona));
  scene.add(g);
  return g;
}

function palmeiraEm(pos) {
  const g = new THREE.Group();
  g.position.set(pos.x, 0, pos.z);
  const troncoMat = toonMaterial(0x9a6c47);
  const folhaMat  = toonMaterial(0x7fbf5f);

  // Tronco levemente curvo — 3 segmentos
  const alturas = [1.6, 1.4, 1.2];
  let y = 0;
  for (let i = 0; i < alturas.length; i++) {
    const seg = new THREE.Mesh(
      new THREE.CylinderGeometry(0.16, 0.20, alturas[i], 6),
      troncoMat
    );
    seg.position.set(i * 0.12, y + alturas[i] / 2, 0);
    seg.castShadow = true;
    g.add(seg);
    y += alturas[i];
  }
  const yTopo = y;

  // Folhas — 6 elipsoides ao redor
  for (let i = 0; i < 6; i++) {
    const ang = (i / 6) * Math.PI * 2;
    const folha = new THREE.Mesh(
      new THREE.SphereGeometry(0.6, 8, 5),
      folhaMat
    );
    folha.scale.set(1.5, 0.4, 0.6);
    folha.position.set(Math.cos(ang) * 0.9 + 0.36, yTopo + 0.1, Math.sin(ang) * 0.9);
    folha.rotation.y = ang;
    folha.rotation.z = 0.3;
    folha.castShadow = true;
    g.add(folha);
  }
  return g;
}
