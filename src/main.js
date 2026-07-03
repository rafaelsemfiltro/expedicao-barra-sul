import { Engine } from './core/Engine.js';
import { Input } from './core/Input.js';
import { TouchInput } from './core/TouchInput.js';
import { CameraRig } from './core/CameraRig.js';
import { World } from './world/World.js';
import { Player } from './entities/Player.js';
import { SPAWN, encontrarZona } from './data/zonas.js';

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

// UI: badge de zona atual (atualiza a cada 250ms — não precisa a cada frame)
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

// Esconde loader
requestAnimationFrame(() => {
  const loader = document.getElementById('loader');
  if (loader) {
    loader.classList.add('hidden');
    setTimeout(() => loader.remove(), 500);
  }
});

engine.start();

// Diagnóstico
console.log('[Expedição Barra Sul] Fase 2 iniciada. Zonas:',
  Array.from(engine.scene.children).filter(c => c.name?.startsWith('zona-')).map(c => c.name));
