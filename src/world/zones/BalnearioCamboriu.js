import * as THREE from 'three';
import { chaoZona, placaZona, predioBox, distribuirAoRedor } from './_common.js';

// Blockout: torres altas em vários tons de claro, marcando o skyline verticalizado da orla.
export function build(scene, zona) {
  const g = new THREE.Group();
  g.name = 'zona-' + zona.id;
  g.add(chaoZona(zona));

  const grupoPredios = new THREE.Group();
  grupoPredios.position.set(zona.centro.x, 0, zona.centro.z);

  distribuirAoRedor(grupoPredios, zona, 14, 6, (i) => {
    const w = 3 + Math.random() * 2;
    const h = 14 + Math.random() * 22;
    const d = 3 + Math.random() * 2;
    const tone = 0xf0f4f8 - (i % 4) * 0x080808;
    const p = predioBox(w, h, d, tone);
    p.position.y = h / 2;
    return p;
  });

  // Uma torre-marco bem alta ao centro (Millennium Palace vibes)
  const torre = predioBox(5, 60, 5, 0xffffff);
  torre.position.set(0, 30, 0);
  grupoPredios.add(torre);

  // Farol icônico na ponta leste da orla
  const farol = new THREE.Group();
  const corpo = predioBox(2.4, 12, 2.4, 0xffffff);
  corpo.position.y = 6;
  farol.add(corpo);
  const listra = predioBox(2.6, 1.8, 2.6, 0xd94f4f);
  listra.position.y = 8;
  farol.add(listra);
  const cupula = new THREE.Mesh(
    new THREE.ConeGeometry(1.8, 2.4, 12),
    new THREE.MeshStandardMaterial({ color: 0xd94f4f })
  );
  cupula.position.y = 13.2;
  cupula.castShadow = true;
  farol.add(cupula);
  const lampada = new THREE.Mesh(
    new THREE.SphereGeometry(0.6, 12, 8),
    new THREE.MeshStandardMaterial({ color: 0xfff2b0, emissive: 0xfff2b0, emissiveIntensity: 0.7 })
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
