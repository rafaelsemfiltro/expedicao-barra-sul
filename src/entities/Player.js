import * as THREE from 'three';
import { Character } from './Character.js';

// Player: aplica input relativo à câmera; move com velocidade de andar (5 u/s) ou correr (9 u/s).
// Vira suavemente na direção do movimento.

const VEL_ANDAR = 5.0;
const VEL_CORRER = 9.5;
const TURN_SMOOTH = 12;      // quanto maior, mais rápido o giro pra direção do movimento

export class Player {
  constructor(scene, inputs, cameraRig, spawn) {
    this.character = new Character({ cor: 0x2f8fc9, nome: 'jogador', altura: 1.8 });
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
      this.character.pararAnimacao();
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

    // limita ao mundo (evita cair no vazio nesta fase)
    const LIMITE = 340;
    if (this.character.position.x >  LIMITE) this.character.position.x =  LIMITE;
    if (this.character.position.x < -LIMITE) this.character.position.x = -LIMITE;
    if (this.character.position.z >  LIMITE) this.character.position.z =  LIMITE;
    if (this.character.position.z < -LIMITE) this.character.position.z = -LIMITE;

    // Vira suavemente na direção do movimento
    const targetFacing = Math.atan2(nx, nz);
    this._facing = lerpAngle(this._facing, targetFacing, 1 - Math.exp(-TURN_SMOOTH * dt));
    this.character.rotationY = this._facing;

    this.character.animarPasso(dt, vel);
  }
}

// Interpola por caminho angular curto
function lerpAngle(a, b, t) {
  let diff = b - a;
  while (diff > Math.PI)  diff -= Math.PI * 2;
  while (diff < -Math.PI) diff += Math.PI * 2;
  return a + diff * t;
}
