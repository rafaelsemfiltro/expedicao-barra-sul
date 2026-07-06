import * as THREE from 'three';
import { chaoZona, placaZona, predioBox } from './_common.js';
import { toonMaterial, PALETA } from '../toon.js';

// Serra: morros em cones + cabaninhas de madeira. Menos "cidade", mais paisagem.
export function build(scene, zona) {
  const g = new THREE.Group();
  g.name = 'zona-' + zona.id;
  g.add(chaoZona(zona));

  const grupo = new THREE.Group();
  grupo.position.set(zona.centro.x, 0, zona.centro.z);

  const morroMat = toonMaterial(PALETA.serraMorro);

  for (let i = 0; i < 8; i++) {
    const ang = (i / 8) * Math.PI * 2;
    const r = zona.raio - 6 - Math.random() * 4;
    const altura = 12 + Math.random() * 12;
    const morro = new THREE.Mesh(
      new THREE.ConeGeometry(6 + Math.random() * 3, altura, 8),
      morroMat
    );
    morro.position.set(Math.cos(ang) * r, altura / 2, Math.sin(ang) * r);
    morro.castShadow = true;
    morro.receiveShadow = true;
    grupo.add(morro);
  }

  for (let i = 0; i < 4; i++) {
    const ang = (i / 4) * Math.PI * 2;
    const r = 6;
    const cabana = new THREE.Group();
    const parede = predioBox(3, 2.5, 3, PALETA.serraCabana);
    parede.position.y = 1.25;
    cabana.add(parede);
    const telhado = new THREE.Mesh(
      new THREE.ConeGeometry(2.4, 1.6, 4),
      toonMaterial(0x5a3a25)
    );
    telhado.rotation.y = Math.PI / 4;
    telhado.position.y = 3.3;
    telhado.castShadow = true;
    cabana.add(telhado);
    cabana.position.set(Math.cos(ang) * r, 0, Math.sin(ang) * r);
    grupo.add(cabana);
  }

  // Mirante
  const plataforma = predioBox(4, 0.3, 4, PALETA.serraMadeira);
  plataforma.position.set(zona.raio - 8, 14, 0);
  grupo.add(plataforma);

  g.add(grupo);
  g.add(placaZona(zona));
  scene.add(g);
  return g;
}
