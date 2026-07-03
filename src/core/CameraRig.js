import * as THREE from 'three';

// Câmera de 3ª pessoa: orbita em torno do alvo (Player) em yaw/pitch controlados pelo input.
// Auto-follow: se o mouse fica parado > FOLLOW_DELAY e o player anda, a câmera lerpa
// pra trás do player. Assim segurar A/D faz a "visão ir junto" — sensação pedida pelo Rafael.

const LOOK_SPEED = 0.0025;
const TOUCH_LOOK_SPEED = 0.0060;
const PITCH_MIN = 0.10;      // impede câmera de cair no chão
const PITCH_MAX = 1.20;
const DIST_MIN = 3.5;
const DIST_MAX = 14;
const ZOOM_SPEED = 0.01;

const FOLLOW_DELAY = 0.6;    // s de mouse ocioso antes de auto-seguir
const FOLLOW_STRENGTH = 1.8; // quanto maior, mais rápido a câmera cola atrás
const MIN_CAM_Y = 0.9;       // altura mínima da câmera sobre o chão

export class CameraRig {
  constructor(camera, target, inputs) {
    this.camera = camera;
    this.target = target;
    this.inputs = inputs;

    this.yaw = 0;
    this.pitch = 0.55;
    this.distance = 8.5;

    this._desiredPos = new THREE.Vector3();
    this._offset = new THREE.Vector3();
    this._lookAt = new THREE.Vector3();
    this._mouseIdleTime = 0;
  }

  getYaw() { return this.yaw; }

  update(dt) {
    // Consome look de todas as fontes (desktop tem LOOK_SPEED menor que touch)
    let dx = 0, dy = 0, wheel = 0;
    for (let i = 0; i < this.inputs.length; i++) {
      const input = this.inputs[i];
      const look = input.consumeLook();
      const speed = i === 0 ? LOOK_SPEED : TOUCH_LOOK_SPEED;
      dx += look.dx * speed;
      dy += look.dy * speed;
      wheel += input.consumeWheel();
    }

    const hasMouseMove = Math.abs(dx) > 0.0001 || Math.abs(dy) > 0.0001;
    if (hasMouseMove) this._mouseIdleTime = 0;
    else              this._mouseIdleTime += dt;

    this.yaw   -= dx;
    this.pitch += dy;
    if (this.pitch < PITCH_MIN) this.pitch = PITCH_MIN;
    if (this.pitch > PITCH_MAX) this.pitch = PITCH_MAX;

    this.distance += wheel * ZOOM_SPEED;
    if (this.distance < DIST_MIN) this.distance = DIST_MIN;
    if (this.distance > DIST_MAX) this.distance = DIST_MAX;

    // Auto-follow: player andando + mouse ocioso → yaw lerpa pra ficar atrás do player.
    // Convenção deste rig: offset = (sin(yaw), _, cos(yaw))·d. Pra ficar atrás de um
    // player com facing F (que anda em (sin(F), cos(F))), o offset precisa ser oposto:
    // yaw = F + π.
    const speed = this.target.userData.speed || 0;
    const facing = this.target.userData.facing ?? 0;
    if (speed > 0.5 && this._mouseIdleTime > FOLLOW_DELAY) {
      const targetYaw = facing + Math.PI;
      const t = 1 - Math.exp(-FOLLOW_STRENGTH * dt);
      this.yaw = lerpAngle(this.yaw, targetYaw, t);
    }

    // Posição desejada: atrás do alvo (yaw), acima (pitch), a distance dele
    const cx = Math.sin(this.yaw) * Math.cos(this.pitch);
    const cy = Math.sin(this.pitch);
    const cz = Math.cos(this.yaw) * Math.cos(this.pitch);
    this._offset.set(cx, cy, cz).multiplyScalar(this.distance);

    this._lookAt.copy(this.target.position);
    this._lookAt.y += 1.4;

    this._desiredPos.copy(this._lookAt).add(this._offset);
    // Salvaguarda: nunca deixa a câmera passar do chão
    if (this._desiredPos.y < MIN_CAM_Y) this._desiredPos.y = MIN_CAM_Y;

    const lerp = 1 - Math.pow(0.001, dt);
    this.camera.position.lerp(this._desiredPos, lerp);
    if (this.camera.position.y < MIN_CAM_Y) this.camera.position.y = MIN_CAM_Y;
    this.camera.lookAt(this._lookAt);
  }
}

function lerpAngle(a, b, t) {
  let diff = b - a;
  while (diff > Math.PI)  diff -= Math.PI * 2;
  while (diff < -Math.PI) diff += Math.PI * 2;
  return a + diff * t;
}
