import * as THREE from 'three';
import { toonMaterial } from './toon.js';
import { ZONAS, ESTRADAS } from '../data/zonas.js';

// Estradas cinza pastel entre centros de zonas.
export class Roads {
  constructor(scene) {
    this.group = new THREE.Group();
    this.group.name = 'roads';

    const mat = toonMaterial(0xc4beb2);   // areia/estrada pastel
    const larguraEstrada = 5;

    const zonaPorId = new Map(ZONAS.map(z => [z.id, z]));

    for (const [aId, bId] of ESTRADAS) {
      const a = zonaPorId.get(aId);
      const b = zonaPorId.get(bId);
      if (!a || !b) continue;

      const ax = a.centro.x, az = a.centro.z;
      const bx = b.centro.x, bz = b.centro.z;
      const dx = bx - ax, dz = bz - az;
      const dist = Math.hypot(dx, dz);
      const geo = new THREE.PlaneGeometry(larguraEstrada, dist);
      const mesh = new THREE.Mesh(geo, mat);
      mesh.rotation.x = -Math.PI / 2;
      mesh.position.set((ax + bx) / 2, 0.03, (az + bz) / 2);
      mesh.rotation.z = -Math.atan2(dx, dz);
      mesh.receiveShadow = true;
      this.group.add(mesh);
    }

    scene.add(this.group);
  }

  update() {}
}
