import { Engine } from './core/Engine.js';
import { Input } from './core/Input.js';
import { TouchInput } from './core/TouchInput.js';
import { CameraRig } from './core/CameraRig.js';
import { World } from './world/World.js';
import { Player } from './entities/Player.js';
import { NPC } from './entities/NPC.js';
import { CharacterCustomization } from './entities/CharacterCustomization.js';
import { Minimap } from './ui/Minimap.js';
import { CustomizationPanel } from './ui/CustomizationPanel.js';
import { SpeechBubbles } from './ui/SpeechBubbles.js';
import { SocialGraph } from './ai/SocialGraph.js';
import { MemoryBank } from './ai/MemoryBank.js';
import { DialogueEngine } from './ai/DialogueEngine.js';
import { NPCBrain } from './ai/NPCBrain.js';
import personagens from './data/personagens.json';
import { SPAWN, ZONAS, encontrarZona } from './data/zonas.js';

const container = document.getElementById('game');
const engine = new Engine(container);

const world = new World(engine.scene);
engine.add(world);

const inputDesktop = new Input(engine.renderer.domElement);
const inputTouch = new TouchInput();

const player = new Player(engine.scene, [inputDesktop, inputTouch], null, SPAWN);
const cameraRig = new CameraRig(engine.camera, player.character.group, [inputDesktop, inputTouch]);
player.cameraRig = cameraRig;

engine.add(cameraRig);
engine.add(player);

// Balões de fala 3D
const bubbles = new SpeechBubbles(container, engine);
engine.add(bubbles);
bubbles.registrarAncora(player, 'Você');

// Camada social + memória + diálogo
const social = new SocialGraph(personagens);
const memory = new MemoryBank();
const dialogue = new DialogueEngine({ personagens, socialGraph: social, memoryBank: memory });

// NPCs autônomos (Fase 3). Cada um nasce dentro da própria cidade_base, em
// ângulo distribuído pra não amontoar todos no centro.
const zonaPorId = new Map(ZONAS.map(z => [z.id, z]));
const npcs = [];
const contagemPorZona = new Map();
for (const p of personagens) {
  contagemPorZona.set(p.cidade_base, (contagemPorZona.get(p.cidade_base) || 0) + 1);
}
const indiceNaZona = new Map();
for (const p of personagens) {
  const zona = zonaPorId.get(p.cidade_base) || ZONAS[0];
  const total = contagemPorZona.get(p.cidade_base) || 1;
  const i = indiceNaZona.get(p.cidade_base) || 0;
  indiceNaZona.set(p.cidade_base, i + 1);
  const ang = (i / total) * Math.PI * 2 + Math.random() * 0.3;
  const r = zona.raio * (0.35 + Math.random() * 0.45);
  const spawn = { x: zona.centro.x + Math.cos(ang) * r, z: zona.centro.z + Math.sin(ang) * r };
  const npc = new NPC(engine.scene, p, spawn);
  npcs.push(npc);
  bubbles.registrarAncora(npc, p.nome);
}
// Depois de criar todos, cada um recebe o próprio brain (que enxerga os outros)
for (const npc of npcs) {
  npc.brain = new NPCBrain({
    personagem: npc.personagem,
    npc,
    npcs,
    social,
    memory,
    dialogue,
    bubbles
  });
  engine.add(npc);
}

// Seed do MemoryBank: registra uma "ausência" pra dar assunto na abertura.
// Pega alguém aleatório do elenco pra não fixar drama num nome específico.
const ausenteSeed = personagens[Math.floor(Math.random() * personagens.length)].id;
memory.add('absence', { actor: ausenteSeed });

// Customização visual (painel de teste)
const customization = new CharacterCustomization(player.character);
const customPanel = new CustomizationPanel(customization);

// Minimapa
const minimap = new Minimap(document.getElementById('minimap'), player, npcs);
engine.add(minimap);

// Badge de zona atual
const zoneBadge = document.getElementById('zone-badge');
let zonaAtualId = null;
setInterval(() => {
  const p = player.position;
  const z = encontrarZona(p.x, p.z);
  const id = z ? z.id : null;
  if (id !== zonaAtualId) {
    zonaAtualId = id;
    if (z) {
      zoneBadge.textContent = `${z.nome} · ${z.slogan}`;
      zoneBadge.style.background = 'rgba(0,0,0,0.55)';
    } else {
      zoneBadge.textContent = 'Estrada · Santa Catarina';
      zoneBadge.style.background = 'rgba(0,0,0,0.35)';
    }
  }
}, 250);

requestAnimationFrame(() => {
  const loader = document.getElementById('loader');
  if (loader) {
    loader.classList.add('hidden');
    setTimeout(() => loader.remove(), 500);
  }
});

engine.start();

console.log('[Expedição Barra Sul] Fase 3 iniciada.',
  npcs.length, 'NPCs autônomos:',
  npcs.map(n => n.nome).join(', '));

// Debug (comente pra tirar): expõe estado global no console
window.__game = { engine, player, npcs, bubbles, dialogue, memory, social };
