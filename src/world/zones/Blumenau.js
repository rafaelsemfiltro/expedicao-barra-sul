import * as THREE from 'three';
import { chaoZona, placaZona, predioBox, distribuirAoRedor } from './_common.js';
import { toonMaterial, PALETA } from '../toon.js';

// Casas enxaimel + torre da igreja.
export function build(scene, zona) {
  const g = new THREE.Group();
  g.name = 'zona-' + zona.id;
  g.add(chaoZona(zona));

  const grupo = new THREE.Group();
  grupo.position.set(zona.centro.x, 0, zona.centro.z);

  distribuirAoRedor(grupo, zona, 12, 5, (i) => {
    const casa = new THREE.Group();

    const parede = predioBox(4, 4, 4, PALETA.bluParede);
    parede.position.y = 2;
    casa.add(parede);

    const vigaVert = predioBox(0.3, 4, 4.1, PALETA.bluViga);
    vigaVert.position.set(0, 2, 0);
    casa.add(vigaVert);
    const vigaHoriz = predioBox(4.1, 0.3, 4, PALETA.bluViga);
    vigaHoriz.position.set(0, 2.5, 0);
    casa.add(vigaHoriz);

    // Telhado vermelho triangular
    const telhado = new THREE.Mesh(
      new THREE.CylinderGeometry(0.001, 2.9, 2.6, 4, 1, false, Math.PI / 4),
      toonMaterial(PALETA.bluEnxaimel)
    );
    telhado.position.y = 5.3;
    telhado.rotation.y = Math.PI / 4;
    telhado.castShadow = true;
    casa.add(telhado);

    return casa;
  });

  // Torre da igreja
  const torre = predioBox(2, 12, 2, PALETA.bluParede);
  torre.position.set(0, 6, 0);
  grupo.add(torre);
  const cupula = new THREE.Mesh(
    new THREE.ConeGeometry(1.5, 3, 6),
    toonMaterial(PALETA.bluEnxaimel)
  );
  cupula.position.set(0, 13.5, 0);
  cupula.castShadow = true;
  grupo.add(cupula);

  g.add(grupo);
  g.add(placaZona(zona));
  scene.add(g);
  return g;
}
