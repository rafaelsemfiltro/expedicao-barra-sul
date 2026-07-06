import { Character } from './Character.js';

// Placeholder de NPC — só um Character estático com nome e cor próprios.
// SEM cérebro, sem movimento, sem falas. A IA de verdade (NPCBrain, DialogueEngine,
// MemoryBank) é a Fase 3 do roadmap. Este arquivo serve pra ver posicionamento e
// pra o minimapa ter pontos vermelhos pra desenhar.

export class NPCPlaceholder {
  constructor(scene, { id, nome, cor, pos, facing = 0 }) {
    this.id = id;
    this.nome = nome;
    this.character = new Character({ cor, nome });
    this.character.group.position.set(pos.x, 0, pos.z);
    this.character.rotationY = facing;
    scene.add(this.character.group);
  }

  get position() { return this.character.position; }

  // Só a animação idle roda (velocidade 0). A IA de verdade é Fase 3.
  update(dt) { this.character.update(dt, 0); }
}

// Os 4 NPCs fictícios do documento (seção 8 da arquitetura), colocados no mundo
// só como marcos visuais. Personalidade/diálogo virá na Fase 3.
export const NPCS_INICIAIS = [
  { id: 'marcelo', nome: 'Marcelo',   cor: 0xe08c8c, cidade: 'balneario-camboriu', offset: { x:  6, z: -3 } },
  { id: 'carla',   nome: 'Carla',     cor: 0xf0b6d4, cidade: 'florianopolis',      offset: { x: -4, z:  5 } },
  { id: 'jefinho', nome: 'Jefinho',   cor: 0x8bc98a, cidade: 'blumenau',           offset: { x:  3, z:  3 } },
  { id: 'rose',    nome: 'Dona Rose', cor: 0xb69ad3, cidade: 'beto-carrero',       offset: { x: -5, z: -4 } }
];
