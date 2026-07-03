import * as THREE from 'three';
import { chaoZona, placaZona, predioBox, distribuirAoRedor } from './_common.js';

// Parque temático: cores berrantes + roda-gigante como marco central.
export function build(scene, zona) {
  const g = new THREE.Group();
  g.name = 'zona-' + zona.id;
  g.add(chaoZona(zona));

  const grupo = new THREE.Group();
  grupo.position.set(zona.centro.x, 0, zona.centro.z);

  // Barraquinhas coloridas
  const paleta = [0xef476f, 0x06d6a0, 0xffd166, 0x118ab2, 0xf78c6b];
  distribuirAoRedor(grupo, zona, 12, 6, (i) => {
    const casa = new THREE.Group();
    const box = predioBox(3.5, 3, 3.5, paleta[i % paleta.length]);
    box.position.y = 1.5;
    casa.add(box);

    const teto = new THREE.Mesh(
      new THREE.ConeGeometry(2.6, 1.5, 16),
      new THREE.MeshStandardMaterial({ color: 0xffffff })
    );
    teto.position.y = 3.75;
    teto.castShadow = true;
    casa.add(teto);
    return casa;
  });

  // Roda-gigante ao centro
  const rodaMat = new THREE.MeshStandardMaterial({ color: 0xef476f, roughness: 0.6 });
  const anel = new THREE.Mesh(new THREE.TorusGeometry(7, 0.5, 12, 32), rodaMat);
  anel.position.set(0, 9, 0);
  anel.rotation.y = Math.PI / 2;
  anel.castShadow = true;
  grupo.add(anel);

  for (let i = 0; i < 8; i++) {
    const raioMesh = new THREE.Mesh(
      new THREE.BoxGeometry(0.15, 14, 0.15),
      new THREE.MeshStandardMaterial({ color: 0xffffff })
    );
    raioMesh.position.set(0, 9, 0);
    raioMesh.rotation.z = (i / 8) * Math.PI * 2;
    grupo.add(raioMesh);
  }
  // suporte
  const suporte = predioBox(1, 9, 1, 0x333333);
  suporte.position.set(0, 4.5, 0);
  grupo.add(suporte);

  g.add(grupo);
  g.add(placaZona(zona));
  scene.add(g);
  return g;
}
