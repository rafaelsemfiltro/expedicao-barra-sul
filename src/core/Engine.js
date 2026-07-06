import * as THREE from 'three';

// Loop principal: cria renderer, cena e câmera; chama update(dt) e render() a cada frame.
// Todo objeto de jogo se registra via engine.add(obj) e recebe obj.update(dt) todo frame.

export class Engine {
  constructor(container) {
    this.container = container;
    this.updatables = new Set();

    this.scene = new THREE.Scene();
    this.scene.background = criarCeuDegrade();
    this.scene.fog = new THREE.Fog(0xfbf1d8, 130, 320);

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
    // Toon fica mais bonito com tone mapping neutro/linear; ACES escurece muito
    this.renderer.toneMapping = THREE.NoToneMapping;

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

// Céu em degradê: canvas 2D → CanvasTexture. Barato e evita ter que instanciar Skybox 3D.
function criarCeuDegrade() {
  const c = document.createElement('canvas');
  c.width = 2;
  c.height = 256;
  const ctx = c.getContext('2d');
  const grad = ctx.createLinearGradient(0, 0, 0, 256);
  grad.addColorStop(0.0, '#8bc9e6');   // topo azul pastel
  grad.addColorStop(0.55, '#c6e6f2');  // meio azul-claro
  grad.addColorStop(1.0, '#fbf1d8');   // horizonte quente pastel
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, 2, 256);
  const tex = new THREE.CanvasTexture(c);
  tex.magFilter = THREE.LinearFilter;
  tex.minFilter = THREE.LinearFilter;
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}
