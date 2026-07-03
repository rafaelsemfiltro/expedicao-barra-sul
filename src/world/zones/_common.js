import * as THREE from 'three';

// Utilidades compartilhadas pelo blockout das zonas.

export function chaoZona(zona) {
  const geo = new THREE.CircleGeometry(zona.raio, 40);
  const mat = new THREE.MeshStandardMaterial({ color: zona.cor, roughness: 0.95 });
  const mesh = new THREE.Mesh(geo, mat);
  mesh.rotation.x = -Math.PI / 2;
  mesh.position.set(zona.centro.x, 0.01, zona.centro.z);
  mesh.receiveShadow = true;
  return mesh;
}

export function placaZona(zona) {
  // Pequeno cubo vertical, marca o centro da cidade e ajuda a identificar de longe.
  const grupo = new THREE.Group();
  grupo.position.set(zona.centro.x, 0, zona.centro.z);

  const poste = new THREE.Mesh(
    new THREE.CylinderGeometry(0.15, 0.15, 4, 8),
    new THREE.MeshStandardMaterial({ color: 0x8b7355 })
  );
  poste.position.y = 2;
  poste.castShadow = true;
  grupo.add(poste);

  const placa = new THREE.Mesh(
    new THREE.BoxGeometry(4, 1.2, 0.15),
    new THREE.MeshStandardMaterial({ color: 0xffffff, emissive: 0x222222 })
  );
  placa.position.y = 3.6;
  placa.castShadow = true;
  grupo.add(placa);

  return grupo;
}

export function predioBox(w, h, d, color) {
  const mesh = new THREE.Mesh(
    new THREE.BoxGeometry(w, h, d),
    new THREE.MeshStandardMaterial({ color, roughness: 0.85 })
  );
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
