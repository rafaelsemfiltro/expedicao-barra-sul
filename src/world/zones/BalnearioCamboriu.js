import * as THREE from 'three';
import { chaoZona, placaZona, predioBox, distribuirAoRedor } from './_common.js';
import { toonMaterial, PALETA } from '../toon.js';

// Torres altas em vários tons pastel + farol icônico.
export function build(scene, zona) {
  const g = new THREE.Group();
  g.name = 'zona-' + zona.id;
  g.add(chaoZona(zona));

  const grupoPredios = new THREE.Group();
  grupoPredios.position.set(zona.centro.x, 0, zona.centro.z);

  const tonsTorre = [0xfaf6ef, 0xe8dcc7, 0xf5d9c4, 0xf7ecd0, 0xffe5ce];

  distribuirAoRedor(grupoPredios, zona, 14, 6, (i) => {
    const w = 3 + Math.random() * 2;
    const h = 14 + Math.random() * 22;
    const d = 3 + Math.random() * 2;
    const cor = tonsTorre[i % tonsTorre.length];
    const p = predioBox(w, h, d, cor);
    p.position.y = h / 2;
    return p;
  });

  // Torre-marco central com "chapéu" arredondado
  const torre = predioBox(5, 60, 5, 0xffffff);
  torre.position.set(0, 30, 0);
  grupoPredios.add(torre);
  const topoTorre = new THREE.Mesh(
    new THREE.SphereGeometry(3.2, 20, 12, 0, Math.PI * 2, 0, Math.PI / 2),
    toonMaterial(PALETA.floripaPonte)
  );
  topoTorre.position.set(0, 60, 0);
  topoTorre.castShadow = true;
  grupoPredios.add(topoTorre);

  // Farol
  const farol = new THREE.Group();
  const corpo = predioBox(2.4, 12, 2.4, 0xffffff);
  corpo.position.y = 6;
  farol.add(corpo);
  const listra = predioBox(2.6, 1.8, 2.6, PALETA.floripaPonte);
  listra.position.y = 8;
  farol.add(listra);
  const cupula = new THREE.Mesh(
    new THREE.ConeGeometry(1.8, 2.4, 12),
    toonMaterial(PALETA.floripaPonte)
  );
  cupula.position.y = 13.2;
  cupula.castShadow = true;
  farol.add(cupula);
  const lampada = new THREE.Mesh(
    new THREE.SphereGeometry(0.6, 12, 8),
    new THREE.MeshBasicMaterial({ color: 0xfff2b0 })
  );
  lampada.position.y = 11.6;
  farol.add(lampada);
  farol.position.set(zona.raio - 4, 0, 0);
  grupoPredios.add(farol);

  g.add(grupoPredios);
  g.add(placaZona(zona));
  scene.add(g);
  return g;
}
