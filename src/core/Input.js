// Input desktop: teclado (WASD + shift) + captura de mouse para girar câmera.
// Estado exposto de forma agregada (moveVec, run, look) para ser lido pelo Player e CameraRig.

export class Input {
  constructor(canvas) {
    this.canvas = canvas;
    this.keys = new Set();
    this.mouseDX = 0;
    this.mouseDY = 0;
    this.wheelDelta = 0;
    this.pointerLocked = false;
    this.run = false;

    this._onKeyDown = (e) => {
      this.keys.add(e.code);
      if (e.code === 'ShiftLeft' || e.code === 'ShiftRight') this.run = true;
    };
    this._onKeyUp = (e) => {
      this.keys.delete(e.code);
      if (e.code === 'ShiftLeft' || e.code === 'ShiftRight') this.run = false;
    };
    this._onMouseMove = (e) => {
      if (!this.pointerLocked) return;
      this.mouseDX += e.movementX || 0;
      this.mouseDY += e.movementY || 0;
    };
    this._onWheel = (e) => {
      this.wheelDelta += e.deltaY;
      e.preventDefault();
    };
    this._onCanvasClick = () => {
      if (!this.pointerLocked && document.pointerLockElement !== this.canvas) {
        this.canvas.requestPointerLock?.();
      }
    };
    this._onPointerLockChange = () => {
      this.pointerLocked = document.pointerLockElement === this.canvas;
      const hint = document.getElementById('hint');
      if (hint) hint.style.display = this.pointerLocked ? 'none' : '';
    };
    this._onContextMenu = (e) => e.preventDefault();

    window.addEventListener('keydown', this._onKeyDown);
    window.addEventListener('keyup', this._onKeyUp);
    window.addEventListener('mousemove', this._onMouseMove);
    canvas.addEventListener('wheel', this._onWheel, { passive: false });
    canvas.addEventListener('click', this._onCanvasClick);
    canvas.addEventListener('contextmenu', this._onContextMenu);
    document.addEventListener('pointerlockchange', this._onPointerLockChange);
  }

  // Vetor de movimento em relação à câmera: x = strafe (dir/esq), z = frente/trás.
  // Convenção: z negativo = frente (frente da câmera).
  getMoveVec() {
    let x = 0, z = 0;
    if (this.keys.has('KeyW') || this.keys.has('ArrowUp'))    z -= 1;
    if (this.keys.has('KeyS') || this.keys.has('ArrowDown'))  z += 1;
    if (this.keys.has('KeyA') || this.keys.has('ArrowLeft'))  x -= 1;
    if (this.keys.has('KeyD') || this.keys.has('ArrowRight')) x += 1;
    const len = Math.hypot(x, z);
    if (len > 0) { x /= len; z /= len; }
    return { x, z };
  }

  // Consome o delta acumulado do mouse (chamado uma vez por frame pelo CameraRig).
  consumeLook() {
    const dx = this.mouseDX, dy = this.mouseDY;
    this.mouseDX = 0; this.mouseDY = 0;
    return { dx, dy };
  }

  consumeWheel() {
    const w = this.wheelDelta;
    this.wheelDelta = 0;
    return w;
  }
}
