import * as THREE from 'three';
import { Character } from './Character.js';

// NPC — entidade autônoma controlada pelo NPCBrain. Move em linha reta até
// pontos-alvo (o brain planeja; o NPC executa "vai até o ponto (x,z)").
// Anima idle/walk via Character.update(dt, velocidade).

const VEL_ANDAR = 6.0;             // NPCs andam um pouco mais devagar que o player
const CHEGADA_TOLERANCIA = 1.5;    // considera "chegou" quando fica a X do alvo
const TURN_SMOOTH = 8;

export class NPC {
  constructor(scene, personagem, spawn) {
    this.id = personagem.id;
    this.nome = personagem.nome;
    this.personagem = personagem;

    const cor = new THREE.Color(personagem.avatar?.corBody || '#888888').getHex();
    this.character = new Character({ cor, nome: personagem.id });
    this.character.group.position.set(spawn.x, 0, spawn.z);
    scene.add(this.character.group);

    this._facing = 0;
    this._moveuNesteFrame = false;
    this.brain = null; // atribuído externamente
  }

  get position() { return this.character.position; }

  // Retorna true quando chegou no alvo (ou não pode se mover mais).
  moverPara(alvo, dt) {
    const dx = alvo.x - this.position.x;
    const dz = alvo.z - this.position.z;
    const dist = Math.hypot(dx, dz);
    if (dist < CHEGADA_TOLERANCIA) {
      this._moveuNesteFrame = true;
      this.character.update(dt, 0);
      return true;
    }

    const nx = dx / dist, nz = dz / dist;
    const passo = Math.min(dist, VEL_ANDAR * dt);
    this.character.position.x += nx * passo;
    this.character.position.z += nz * passo;

    const targetFacing = Math.atan2(nx, nz);
    this._facing = lerpAngle(this._facing, targetFacing, 1 - Math.exp(-TURN_SMOOTH * dt));
    this.character.rotationY = this._facing;

    this._moveuNesteFrame = true;
    this.character.update(dt, VEL_ANDAR);
    return false;
  }

  // Vira suavemente pra encarar uma posição (usado no CONVERSAR).
  olharPara(pos) {
    const dx = pos.x - this.position.x;
    const dz = pos.z - this.position.z;
    const alvo = Math.atan2(dx, dz);
    this._facing = lerpAngle(this._facing, alvo, 0.15);
    this.character.rotationY = this._facing;
    this._moveuNesteFrame = true;
    this.character.update(0.016, 0);   // anima idle no lugar
  }

  // Chamado pelo Engine todo frame.
  update(dt) {
    this._moveuNesteFrame = false;
    this.brain?.update(dt);           // brain pode chamar moverPara/olharPara
    if (!this._moveuNesteFrame) {
      this.character.update(dt, 0);   // fallback: idle
    }
  }
}

function lerpAngle(a, b, t) {
  let diff = b - a;
  while (diff > Math.PI)  diff -= Math.PI * 2;
  while (diff < -Math.PI) diff += Math.PI * 2;
  return a + diff * t;
}
