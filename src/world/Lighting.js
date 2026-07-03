import * as THREE from 'three';

// Sol + ambiente hemisférico. Sombras só do sol (orçamento mobile).
export class Lighting {
  constructor(scene) {
    const hemi = new THREE.HemisphereLight(0xbde5ff, 0x556b3a, 0.75);
    scene.add(hemi);

    const sun = new THREE.DirectionalLight(0xfff2d5, 1.15);
    sun.position.set(80, 140, 60);
    sun.castShadow = true;
    sun.shadow.mapSize.set(1024, 1024);
    const s = 180;
    sun.shadow.camera.left = -s;
    sun.shadow.camera.right = s;
    sun.shadow.camera.top = s;
    sun.shadow.camera.bottom = -s;
    sun.shadow.camera.near = 10;
    sun.shadow.camera.far = 320;
    sun.shadow.bias = -0.0004;
    scene.add(sun);
    scene.add(sun.target);

    this.hemi = hemi;
    this.sun = sun;
  }

  update() { /* estático nesta fase */ }
}
