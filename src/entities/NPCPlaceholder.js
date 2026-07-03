import { Character } from './Character.js';

// Placeholder de NPC — só um Character estático com nome e cor próprios.
// SEM cérebro, sem movimento, sem falas. A IA de verdade (NPCBrain, DialogueEngine,
// MemoryBank) é a Fase 3 do roadmap. Este arquivo serve pra ver posicionamento e
// pra o minimapa ter pontos vermelhos pra desenhar.

export class NPCPlaceholder {
  constructor(scene, { id, nome, cor, pos, facing = 0 }) {
    this.id = id;
    this.nome = nome;
    this.character = new Character({ cor, nome, altura: 1.75 });
    this.character.group.position.set(pos.x, 0, pos.z);
    this.character.rotationY = facing;
    scene.add(this.character.group);
  }

  get position() { return this.character.position; }

  update() { /* estático nesta fase */ }
}

// Os 4 NPCs fictícios do documento (seção 8 da arquitetura), colocados no mundo
// só como marcos visuais. Personalidade/diálogo virá na Fase 3.
export const NPCS_INICIAIS = [
  { id: 'marcelo', nome: 'Marcelo',   cor: 0xd94f4f, cidade: 'balneario-camboriu', offset: { x:  6, z: -3 } },
  { id: 'carla',   nome: 'Carla',     cor: 0xe6a4d0, cidade: 'florianopolis',      offset: { x: -4, z:  5 } },
  { id: 'jefinho', nome: 'Jefinho',   cor: 0x2f8f5b, cidade: 'blumenau',           offset: { x:  3, z:  3 } },
  { id: 'rose',    nome: 'Dona Rose', cor: 0x8a5a9c, cidade: 'beto-carrero',       offset: { x: -5, z: -4 } }
];
