import * as THREE from 'three';
import { chaoZona, placaZona, predioBox, distribuirAoRedor } from './_common.js';
import { toonMaterial } from '../toon.js';

// Parque temático em cores pastel vibrantes + roda-gigante central.
export function build(scene, zona) {
  const g = new THREE.Group();
  g.name = 'zona-' + zona.id;
  g.add(chaoZona(zona));

  const grupo = new THREE.Group();
  grupo.position.set(zona.centro.x, 0, zona.centro.z);

  const paleta = [0xf47a9a, 0x8de3c3, 0xffe08a, 0x86c6e0, 0xf9a686];
  distribuirAoRedor(grupo, zona, 12, 6, (i) => {
    const casa = new THREE.Group();
    const box = predioBox(3.5, 3, 3.5, paleta[i % paleta.length]);
    box.position.y = 1.5;
    casa.add(box);

    const teto = new THREE.Mesh(
      new THREE.ConeGeometry(2.6, 1.5, 16),
      toonMaterial(0xffffff)
    );
    teto.position.y = 3.75;
    teto.castShadow = true;
    casa.add(teto);
    return casa;
  });

  // Roda-gigante ao centro
  const anelMat = toonMaterial(0xf47a9a);
  const anel = new THREE.Mesh(new THREE.TorusGeometry(7, 0.5, 12, 32), anelMat);
  anel.position.set(0, 9, 0);
  anel.rotation.y = Math.PI / 2;
  anel.castShadow = true;
  grupo.add(anel);

  // Cabines
  const cabineMat = toonMaterial(0xffe08a);
  for (let i = 0; i < 8; i++) {
    const ang = (i / 8) * Math.PI * 2;
    const cabine = new THREE.Mesh(
      new THREE.SphereGeometry(0.7, 12, 8),
      cabineMat
    );
    cabine.position.set(0, 9 + Math.cos(ang) * 7, Math.sin(ang) * 7);
    cabine.castShadow = true;
    grupo.add(cabine);
  }

  // Suporte
  const suporte = predioBox(1, 9, 1, 0xefefef);
  suporte.position.set(0, 4.5, 0);
  grupo.add(suporte);

  g.add(grupo);
  g.add(placaZona(zona));
  scene.add(g);
  return g;
}
