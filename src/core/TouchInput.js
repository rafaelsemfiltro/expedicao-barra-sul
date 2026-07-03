// Joystick virtual (esquerda) + botão CORRER (direita).
// Também gira a câmera com arrasto de dedo na metade direita da tela (fora do botão).
// Expõe a mesma interface do Input desktop (getMoveVec, consumeLook, run) para uso indistinto.

export class TouchInput {
  constructor() {
    this.joystick = document.getElementById('joystick');
    this.nub = document.getElementById('joystick-nub');
    this.btnRun = document.getElementById('btn-run');

    this.moveX = 0;
    this.moveZ = 0;
    this.run = false;

    this.mouseDX = 0;
    this.mouseDY = 0;

    this._joyId = null;
    this._joyCenter = { x: 0, y: 0 };
    this._joyRadius = 60;

    this._lookId = null;
    this._lookLast = { x: 0, y: 0 };

    this._bind();

    this.enabled = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
    if (this.enabled) document.body.classList.add('is-touch');
  }

  _bind() {
    const touch = (el, handlers) => {
      for (const [type, fn] of Object.entries(handlers)) {
        el.addEventListener(type, fn, { passive: false });
      }
    };

    touch(this.joystick, {
      touchstart: (e) => this._joyStart(e),
      touchmove:  (e) => this._joyMove(e),
      touchend:   (e) => this._joyEnd(e),
      touchcancel:(e) => this._joyEnd(e)
    });

    touch(this.btnRun, {
      touchstart: (e) => { e.preventDefault(); this.run = true;  this.btnRun.classList.add('active'); },
      touchend:   (e) => { e.preventDefault(); this.run = false; this.btnRun.classList.remove('active'); },
      touchcancel:(e) => { e.preventDefault(); this.run = false; this.btnRun.classList.remove('active'); }
    });

    // Câmera: arrasto de dedo fora dos controles
    window.addEventListener('touchstart', (e) => this._lookStart(e), { passive: false });
    window.addEventListener('touchmove',  (e) => this._lookMove(e),  { passive: false });
    window.addEventListener('touchend',   (e) => this._lookEnd(e),   { passive: false });
    window.addEventListener('touchcancel',(e) => this._lookEnd(e),   { passive: false });
  }

  _isInsideControl(target) {
    return this.joystick.contains(target) || this.btnRun.contains(target);
  }

  _joyStart(e) {
    e.preventDefault();
    const t = e.changedTouches[0];
    this._joyId = t.identifier;
    const r = this.joystick.getBoundingClientRect();
    this._joyCenter = { x: r.left + r.width / 2, y: r.top + r.height / 2 };
    this._joyRadius = r.width / 2;
    this._updateJoy(t.clientX, t.clientY);
  }

  _joyMove(e) {
    if (this._joyId === null) return;
    for (const t of e.changedTouches) {
      if (t.identifier === this._joyId) {
        e.preventDefault();
        this._updateJoy(t.clientX, t.clientY);
      }
    }
  }

  _joyEnd(e) {
    if (this._joyId === null) return;
    for (const t of e.changedTouches) {
      if (t.identifier === this._joyId) {
        this._joyId = null;
        this.moveX = 0; this.moveZ = 0;
        this.nub.style.transform = 'translate(0, 0)';
      }
    }
  }

  _updateJoy(cx, cy) {
    let dx = cx - this._joyCenter.x;
    let dy = cy - this._joyCenter.y;
    const dist = Math.hypot(dx, dy);
    const max = this._joyRadius;
    if (dist > max) { dx = dx / dist * max; dy = dy / dist * max; }
    this.nub.style.transform = `translate(${dx}px, ${dy}px)`;
    // Normaliza pra [-1,1]; dy positivo = puxar dedo pra baixo = andar para trás.
    this.moveX = dx / max;
    this.moveZ = dy / max;
  }

  _lookStart(e) {
    if (this._lookId !== null) return;
    for (const t of e.changedTouches) {
      if (this._isInsideControl(t.target)) continue;
      this._lookId = t.identifier;
      this._lookLast = { x: t.clientX, y: t.clientY };
      return;
    }
  }

  _lookMove(e) {
    if (this._lookId === null) return;
    for (const t of e.changedTouches) {
      if (t.identifier === this._lookId) {
        this.mouseDX += (t.clientX - this._lookLast.x);
        this.mouseDY += (t.clientY - this._lookLast.y);
        this._lookLast = { x: t.clientX, y: t.clientY };
      }
    }
  }

  _lookEnd(e) {
    if (this._lookId === null) return;
    for (const t of e.changedTouches) {
      if (t.identifier === this._lookId) this._lookId = null;
    }
  }

  getMoveVec() {
    if (!this.enabled) return { x: 0, z: 0 };
    return { x: this.moveX, z: this.moveZ };
  }

  consumeLook() {
    const dx = this.mouseDX, dy = this.mouseDY;
    this.mouseDX = 0; this.mouseDY = 0;
    return { dx, dy };
  }

  consumeWheel() { return 0; }
}
