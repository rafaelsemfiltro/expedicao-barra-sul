import * as THREE from 'three';
import { chaoZona, placaZona, predioBox } from './_common.js';

// Serra: morros em cones e cabaninhas de madeira. Menos "cidade", mais paisagem.
export function build(scene, zona) {
  const g = new THREE.Group();
  g.name = 'zona-' + zona.id;
  g.add(chaoZona(zona));

  const grupo = new THREE.Group();
  grupo.position.set(zona.centro.x, 0, zona.centro.z);

  // Anel de morros
  for (let i = 0; i < 8; i++) {
    const ang = (i / 8) * Math.PI * 2;
    const r = zona.raio - 6 - Math.random() * 4;
    const altura = 12 + Math.random() * 12;
    const morro = new THREE.Mesh(
      new THREE.ConeGeometry(6 + Math.random() * 3, altura, 8),
      new THREE.MeshStandardMaterial({ color: 0x5f7a4a, roughness: 1 })
    );
    morro.position.set(Math.cos(ang) * r, altura / 2, Math.sin(ang) * r);
    morro.castShadow = true;
    morro.receiveShadow = true;
    grupo.add(morro);
  }

  // Algumas cabanas centrais
  for (let i = 0; i < 4; i++) {
    const ang = (i / 4) * Math.PI * 2;
    const r = 6;
    const cabana = new THREE.Group();
    const parede = predioBox(3, 2.5, 3, zona.corPredios);
    parede.position.y = 1.25;
    cabana.add(parede);
    const telhado = new THREE.Mesh(
      new THREE.ConeGeometry(2.4, 1.6, 4),
      new THREE.MeshStandardMaterial({ color: 0x2c1810 })
    );
    telhado.rotation.y = Math.PI / 4;
    telhado.position.y = 3.3;
    telhado.castShadow = true;
    cabana.add(telhado);
    cabana.position.set(Math.cos(ang) * r, 0, Math.sin(ang) * r);
    grupo.add(cabana);
  }

  // Mirante — plataforma no ar em um dos morros
  const plataforma = predioBox(4, 0.3, 4, 0xd9b382);
  plataforma.position.set(zona.raio - 8, 14, 0);
  grupo.add(plataforma);

  g.add(grupo);
  g.add(placaZona(zona));
  scene.add(g);
  return g;
}
