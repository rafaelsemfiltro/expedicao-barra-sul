import * as THREE from 'three';

// Câmera de 3ª pessoa: orbita em torno do alvo (Player) em yaw/pitch controlados pelo input.
// Suaviza a posição com um "damping" simples pra sensação gostosa.

const LOOK_SPEED = 0.0025;         // rad por px de mouse
const TOUCH_LOOK_SPEED = 0.0060;   // toque é mais lento em pixels — compensa
const PITCH_MIN = -0.35;
const PITCH_MAX = 1.20;
const DIST_MIN = 3.5;
const DIST_MAX = 14;
const ZOOM_SPEED = 0.01;

export class CameraRig {
  constructor(camera, target, inputs) {
    this.camera = camera;
    this.target = target;
    this.inputs = inputs;  // array de fontes de input (desktop + touch)

    this.yaw = 0;
    this.pitch = 0.55;
    this.distance = 8.5;

    this._desiredPos = new THREE.Vector3();
    this._offset = new THREE.Vector3();
    this._lookAt = new THREE.Vector3();
  }

  // Yaw da câmera é o que orienta o movimento do player.
  getYaw() { return this.yaw; }

  update(dt) {
    // Consome look de todas as fontes
    let dx = 0, dy = 0, wheel = 0;
    for (const input of this.inputs) {
      const look = input.consumeLook();
      const speed = input === this.inputs[0] ? LOOK_SPEED : TOUCH_LOOK_SPEED;
      dx += look.dx * speed;
      dy += look.dy * speed;
      wheel += input.consumeWheel();
    }
    this.yaw   -= dx;
    this.pitch += dy;
    if (this.pitch < PITCH_MIN) this.pitch = PITCH_MIN;
    if (this.pitch > PITCH_MAX) this.pitch = PITCH_MAX;

    this.distance += wheel * ZOOM_SPEED;
    if (this.distance < DIST_MIN) this.distance = DIST_MIN;
    if (this.distance > DIST_MAX) this.distance = DIST_MAX;

    // Posição desejada: atrás do alvo (yaw), acima (pitch), a distance dele
    const cx = Math.sin(this.yaw) * Math.cos(this.pitch);
    const cy = Math.sin(this.pitch);
    const cz = Math.cos(this.yaw) * Math.cos(this.pitch);
    this._offset.set(cx, cy, cz).multiplyScalar(this.distance);

    // Alvo real: um pouco acima do centro do player (cabeça)
    this._lookAt.copy(this.target.position);
    this._lookAt.y += 1.4;

    this._desiredPos.copy(this._lookAt).add(this._offset);

    // Suavização
    const lerp = 1 - Math.pow(0.001, dt);
    this.camera.position.lerp(this._desiredPos, lerp);
    this.camera.lookAt(this._lookAt);
  }
}
