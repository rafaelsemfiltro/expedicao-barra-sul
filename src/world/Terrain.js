import * as THREE from 'three';

// Chão verde plano (blockout) + mar azul cobrindo o leste e envolvendo a costa.
// Praias douradas nas zonas litorâneas ficam por conta das próprias zones.

export class Terrain {
  constructor(scene) {
    this.group = new THREE.Group();
    this.group.name = 'terrain';

    // Grama
    const chao = new THREE.Mesh(
      new THREE.PlaneGeometry(700, 700, 1, 1),
      new THREE.MeshStandardMaterial({ color: 0x7fb96a, roughness: 0.95, metalness: 0 })
    );
    chao.rotation.x = -Math.PI / 2;
    chao.receiveShadow = true;
    this.group.add(chao);

    // Mar (leve abaixo do chão para simular praia)
    this.marMat = new THREE.MeshStandardMaterial({
      color: 0x2f8fc9,
      roughness: 0.5,
      metalness: 0.15,
      transparent: true,
      opacity: 0.92
    });
    const mar = new THREE.Mesh(new THREE.PlaneGeometry(1600, 1600, 1, 1), this.marMat);
    mar.rotation.x = -Math.PI / 2;
    mar.position.set(600, -0.35, 0);   // costa a leste
    mar.receiveShadow = true;
    this.group.add(mar);

    // Fita de praia dourada bem no litoral
    const praia = new THREE.Mesh(
      new THREE.PlaneGeometry(60, 500, 1, 1),
      new THREE.MeshStandardMaterial({ color: 0xf5d76e, roughness: 1 })
    );
    praia.rotation.x = -Math.PI / 2;
    praia.position.set(190, 0.02, 20);
    praia.receiveShadow = true;
    this.group.add(praia);

    scene.add(this.group);
  }

  update(dt) {
    // Efeito sutil de brilho oscilante no mar
    const t = performance.now() * 0.0006;
    this.marMat.color.setHSL(0.58, 0.55, 0.42 + Math.sin(t) * 0.02);
  }
}
