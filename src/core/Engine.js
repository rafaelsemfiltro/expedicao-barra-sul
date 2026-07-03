import * as THREE from 'three';

// Loop principal: cria renderer, cena e câmera; chama update(dt) e render() a cada frame.
// Todo objeto de jogo se registra via engine.add(obj) e recebe obj.update(dt) todo frame.

export class Engine {
  constructor(container) {
    this.container = container;
    this.updatables = new Set();

    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(0x9dd3ec);
    this.scene.fog = new THREE.Fog(0x9dd3ec, 220, 520);

    this.camera = new THREE.PerspectiveCamera(
      60,
      window.innerWidth / window.innerHeight,
      0.1,
      1200
    );
    this.camera.position.set(0, 10, 20);

    this.renderer = new THREE.WebGLRenderer({
      antialias: true,
      powerPreference: 'high-performance'
    });
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    this.renderer.outputColorSpace = THREE.SRGBColorSpace;
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = 1.05;

    container.appendChild(this.renderer.domElement);

    this.clock = new THREE.Clock();
    this._running = false;
    this._onResize = this._onResize.bind(this);
    window.addEventListener('resize', this._onResize);
  }

  add(obj) { this.updatables.add(obj); return obj; }
  remove(obj) { this.updatables.delete(obj); }

  start() {
    if (this._running) return;
    this._running = true;
    this.clock.start();
    const tick = () => {
      if (!this._running) return;
      const dt = Math.min(this.clock.getDelta(), 0.05); // clamp p/ evitar teleporte
      for (const obj of this.updatables) obj.update(dt);
      this.renderer.render(this.scene, this.camera);
      requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  }

  stop() { this._running = false; }

  _onResize() {
    const w = window.innerWidth;
    const h = window.innerHeight;
    this.camera.aspect = w / h;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(w, h);
  }
}
