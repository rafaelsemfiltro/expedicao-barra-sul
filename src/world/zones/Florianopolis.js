import * as THREE from 'three';
import { chaoZona, placaZona, predioBox, distribuirAoRedor } from './_common.js';
import { toonMaterial, PALETA } from '../toon.js';

// Floripa: prédios médios pastel + arco vermelho estilizado (Ponte Hercílio Luz).
export function build(scene, zona) {
  const g = new THREE.Group();
  g.name = 'zona-' + zona.id;
  g.add(chaoZona(zona));

  const grupoPredios = new THREE.Group();
  grupoPredios.position.set(zona.centro.x, 0, zona.centro.z);

  const tons = [0xf5f7f9, 0xe3ecf3, 0xf0e4d0, 0xd7e5ef, 0xfae6d6];

  distribuirAoRedor(grupoPredios, zona, 12, 6, (i) => {
    const w = 3 + Math.random() * 2;
    const h = 6 + Math.random() * 8;
    const d = 3 + Math.random() * 2;
    const p = predioBox(w, h, d, tons[i % tons.length]);
    p.position.y = h / 2;
    return p;
  });

  // Ponte
  const arco = new THREE.Mesh(
    new THREE.TorusGeometry(6, 0.8, 12, 24, Math.PI),
    toonMaterial(PALETA.floripaPonte)
  );
  arco.position.set(0, 6, 0);
  arco.castShadow = true;
  grupoPredios.add(arco);

  const base1 = predioBox(1, 6, 1, PALETA.floripaPonte);
  base1.position.set(-6, 3, 0);
  grupoPredios.add(base1);
  const base2 = predioBox(1, 6, 1, PALETA.floripaPonte);
  base2.position.set(6, 3, 0);
  grupoPredios.add(base2);

  g.add(grupoPredios);
  g.add(placaZona(zona));
  scene.add(g);
  return g;
}
