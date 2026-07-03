import * as THREE from 'three';
import { chaoZona, placaZona, predioBox, distribuirAoRedor } from './_common.js';

// Floripa: prédios médios + um "arco" simbolizando a Ponte Hercílio Luz.
export function build(scene, zona) {
  const g = new THREE.Group();
  g.name = 'zona-' + zona.id;
  g.add(chaoZona(zona));

  const grupoPredios = new THREE.Group();
  grupoPredios.position.set(zona.centro.x, 0, zona.centro.z);

  distribuirAoRedor(grupoPredios, zona, 12, 6, () => {
    const w = 3 + Math.random() * 2;
    const h = 6 + Math.random() * 8;
    const d = 3 + Math.random() * 2;
    const p = predioBox(w, h, d, 0xeaeef2);
    p.position.y = h / 2;
    return p;
  });

  // Ponte Hercílio Luz — arco vermelho estilizado
  const arco = new THREE.Mesh(
    new THREE.TorusGeometry(6, 0.8, 12, 24, Math.PI),
    new THREE.MeshStandardMaterial({ color: zona.corPredios, roughness: 0.6 })
  );
  arco.position.set(0, 6, 0);
  arco.rotation.x = 0;
  arco.castShadow = true;
  grupoPredios.add(arco);

  const base1 = predioBox(1, 6, 1, zona.corPredios);
  base1.position.set(-6, 3, 0);
  grupoPredios.add(base1);
  const base2 = predioBox(1, 6, 1, zona.corPredios);
  base2.position.set(6, 3, 0);
  grupoPredios.add(base2);

  g.add(grupoPredios);
  g.add(placaZona(zona));
  scene.add(g);
  return g;
}
