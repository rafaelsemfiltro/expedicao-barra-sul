import * as THREE from 'three';
import { RoundedBoxGeometry } from 'three/examples/jsm/geometries/RoundedBoxGeometry.js';
import { toonMaterial } from '../toon.js';

// Utilidades compartilhadas pelo blockout das zonas — agora com toon + cantos arredondados.

export function chaoZona(zona) {
  const geo = new THREE.CircleGeometry(zona.raio, 40);
  const mesh = new THREE.Mesh(geo, toonMaterial(zona.cor));
  mesh.rotation.x = -Math.PI / 2;
  mesh.position.set(zona.centro.x, 0.01, zona.centro.z);
  mesh.receiveShadow = true;
  return mesh;
}

export function placaZona(zona) {
  const grupo = new THREE.Group();
  grupo.position.set(zona.centro.x, 0, zona.centro.z);

  const poste = new THREE.Mesh(
    new THREE.CylinderGeometry(0.15, 0.15, 4, 8),
    toonMaterial(0x8b7355)
  );
  poste.position.y = 2;
  poste.castShadow = true;
  grupo.add(poste);

  const placa = new THREE.Mesh(
    new RoundedBoxGeometry(4, 1.2, 0.15, 3, 0.15),
    toonMaterial(0xffffff)
  );
  placa.position.y = 3.6;
  placa.castShadow = true;
  grupo.add(placa);

  return grupo;
}

// Caixa arredondada — replacement do antigo predioBox().
export function predioBox(w, h, d, color, opts = {}) {
  const radius = Math.min(0.25, Math.min(w, h, d) * 0.15);
  const geo = new RoundedBoxGeometry(w, h, d, 2, radius);
  const mesh = new THREE.Mesh(geo, toonMaterial(color, opts.matOpts));
  mesh.castShadow = true;
  mesh.receiveShadow = true;
  return mesh;
}

// Distribui prédios em anel ao redor do centro da zona.
export function distribuirAoRedor(grupo, zona, quantidade, raioInterno, fn) {
  for (let i = 0; i < quantidade; i++) {
    const ang = (i / quantidade) * Math.PI * 2;
    const r = raioInterno + Math.random() * (zona.raio - raioInterno - 3);
    const x = Math.cos(ang) * r;
    const z = Math.sin(ang) * r;
    const item = fn(i);
    item.position.x += x;
    item.position.z += z;
    grupo.add(item);
  }
}
