import { Engine } from './core/Engine.js';
import { Input } from './core/Input.js';
import { TouchInput } from './core/TouchInput.js';
import { CameraRig } from './core/CameraRig.js';
import { World } from './world/World.js';
import { Player } from './entities/Player.js';
import { NPCPlaceholder, NPCS_INICIAIS } from './entities/NPCPlaceholder.js';
import { Minimap } from './ui/Minimap.js';
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

// NPCs placeholder (Fase 2 — sem IA). Postos perto da placa da cidade a que pertencem.
const zonaPorId = new Map(ZONAS.map(z => [z.id, z]));
const npcs = [];
for (const cfg of NPCS_INICIAIS) {
  const zona = zonaPorId.get(cfg.cidade);
  if (!zona) continue;
  const pos = {
    x: zona.centro.x + cfg.offset.x,
    z: zona.centro.z + cfg.offset.z
  };
  const npc = new NPCPlaceholder(engine.scene, {
    id: cfg.id, nome: cfg.nome, cor: cfg.cor, pos, facing: Math.random() * Math.PI * 2
  });
  npcs.push(npc);
  engine.add(npc);
}

// Minimapa
const minimap = new Minimap(document.getElementById('minimap'), player, npcs);
engine.add(minimap);

// UI: badge de zona atual
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

console.log('[Expedição Barra Sul] Fase 2 iniciada. NPCs placeholder:',
  npcs.map(n => n.nome).join(', '));
