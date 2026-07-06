import * as THREE from 'three';
import { Character } from './Character.js';
import { LIMITE_MUNDO } from '../data/zonas.js';

// Player: aplica input relativo à câmera; move com velocidade de andar (7 u/s) ou correr (13 u/s).
// Vira suavemente na direção do movimento.

const VEL_ANDAR = 7.0;
const VEL_CORRER = 13.0;
const TURN_SMOOTH = 12;      // quanto maior, mais rápido o giro pra direção do movimento

export class Player {
  constructor(scene, inputs, cameraRig, spawn) {
    this.character = new Character({ cor: 0x4fa8d8, nome: 'jogador' });
    this.character.group.position.set(spawn.x, 0, spawn.z);
    scene.add(this.character.group);

    this.inputs = inputs;
    this.cameraRig = cameraRig;

    this._velocidade = 0;
    this._facing = 0; // yaw atual do personagem (rad)
  }

  get position() { return this.character.position; }

  // Soma vetores de movimento de todas as fontes (desktop + touch), com clamp.
  _readMove() {
    let x = 0, z = 0;
    for (const input of this.inputs) {
      const v = input.getMoveVec();
      x += v.x;
      z += v.z;
    }
    const len = Math.hypot(x, z);
    if (len > 1) { x /= len; z /= len; }
    return { x, z, len: Math.min(len, 1) };
  }

  _isRunning() {
    return this.inputs.some(i => i.run);
  }

  update(dt) {
    const mv = this._readMove();
    const running = this._isRunning();

    if (mv.len < 0.05) {
      this._velocidade = 0;
      this.character.group.userData.speed = 0;
      this.character.group.userData.facing = this._facing;
      this.character.update(dt, 0);
      return;
    }

    // Vetor de movimento é relativo à orientação da câmera (yaw)
    const yaw = this.cameraRig.getYaw();
    // Base da câmera no plano XZ: forward = (-sin(yaw), 0, -cos(yaw)); right = (cos(yaw), 0, -sin(yaw))
    const fwdX = -Math.sin(yaw), fwdZ = -Math.cos(yaw);
    const rgtX =  Math.cos(yaw), rgtZ = -Math.sin(yaw);

    // mv.x = strafe (positivo = direita), mv.z = frente/trás (negativo = frente)
    const dirX = rgtX * mv.x + fwdX * (-mv.z);
    const dirZ = rgtZ * mv.x + fwdZ * (-mv.z);
    const dirLen = Math.hypot(dirX, dirZ);
    const nx = dirLen > 0 ? dirX / dirLen : 0;
    const nz = dirLen > 0 ? dirZ / dirLen : 0;

    const velMax = running ? VEL_CORRER : VEL_ANDAR;
    const vel = velMax * mv.len;
    this._velocidade = vel;

    this.character.position.x += nx * vel * dt;
    this.character.position.z += nz * vel * dt;

    if (this.character.position.x >  LIMITE_MUNDO) this.character.position.x =  LIMITE_MUNDO;
    if (this.character.position.x < -LIMITE_MUNDO) this.character.position.x = -LIMITE_MUNDO;
    if (this.character.position.z >  LIMITE_MUNDO) this.character.position.z =  LIMITE_MUNDO;
    if (this.character.position.z < -LIMITE_MUNDO) this.character.position.z = -LIMITE_MUNDO;

    // Vira suavemente na direção do movimento
    const targetFacing = Math.atan2(nx, nz);
    this._facing = lerpAngle(this._facing, targetFacing, 1 - Math.exp(-TURN_SMOOTH * dt));
    this.character.rotationY = this._facing;

    // Expõe velocidade e direção pra CameraRig usar no auto-follow
    this.character.group.userData.speed = vel;
    this.character.group.userData.facing = this._facing;

    this.character.update(dt, vel);
  }
}

// Interpola por caminho angular curto
function lerpAngle(a, b, t) {
  let diff = b - a;
  while (diff > Math.PI)  diff -= Math.PI * 2;
  while (diff < -Math.PI) diff += Math.PI * 2;
  return a + diff * t;
}
