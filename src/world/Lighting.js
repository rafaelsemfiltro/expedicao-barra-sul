import * as THREE from 'three';

// Toon precisa de luz ambiente forte (senão áreas de sombra viram pretos duros).
// Hemi + sol + fill = look "diorama iluminado".
export class Lighting {
  constructor(scene) {
    const hemi = new THREE.HemisphereLight(0xd6ecf5, 0x99b06d, 1.0);
    scene.add(hemi);

    const sun = new THREE.DirectionalLight(0xfff2d5, 1.35);
    sun.position.set(60, 120, 40);
    sun.castShadow = true;
    sun.shadow.mapSize.set(1024, 1024);
    const s = 130;
    sun.shadow.camera.left = -s;
    sun.shadow.camera.right = s;
    sun.shadow.camera.top = s;
    sun.shadow.camera.bottom = -s;
    sun.shadow.camera.near = 10;
    sun.shadow.camera.far = 260;
    sun.shadow.bias = -0.0004;
    sun.shadow.radius = 4;   // sombra levemente suavizada
    scene.add(sun);
    scene.add(sun.target);

    // Fill oposto ao sol pra iluminar o back dos objetos e evitar pretos duros
    const fill = new THREE.DirectionalLight(0xa8c8ff, 0.35);
    fill.position.set(-60, 60, -40);
    scene.add(fill);

    this.hemi = hemi;
    this.sun = sun;
    this.fill = fill;
  }

  update() {}
}
