import * as THREE from 'three';
import { chaoZona, placaZona, predioBox, distribuirAoRedor } from './_common.js';

// Vilarejo baixinho, casinhas com "telhado" (pirâmide simples).
export function build(scene, zona) {
  const g = new THREE.Group();
  g.name = 'zona-' + zona.id;
  g.add(chaoZona(zona));

  const grupoCasas = new THREE.Group();
  grupoCasas.position.set(zona.centro.x, 0, zona.centro.z);

  distribuirAoRedor(grupoCasas, zona, 10, 5, (i) => {
    const casa = new THREE.Group();
    const parede = predioBox(4, 3, 4, zona.corPredios);
    parede.position.y = 1.5;
    casa.add(parede);

    const telhado = new THREE.Mesh(
      new THREE.ConeGeometry(3.2, 2, 4),
      new THREE.MeshStandardMaterial({ color: 0xb04a2f, roughness: 0.9 })
    );
    telhado.rotation.y = Math.PI / 4;
    telhado.position.y = 4;
    telhado.castShadow = true;
    casa.add(telhado);
    return casa;
  });

  g.add(grupoCasas);
  g.add(placaZona(zona));
  scene.add(g);
  return g;
}
