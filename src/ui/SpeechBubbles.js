import * as THREE from 'three';
import { CSS2DRenderer, CSS2DObject } from 'three/examples/jsm/renderers/CSS2DRenderer.js';

// Balões de fala 3D — HTML posicionado por projeção 3D via CSS2DRenderer.
// Cada NPC (ou o player) tem um CSS2DObject anexado acima da cabeça. Aparece
// quando `mostrar(dono, texto, ttl)` é chamado; some após ttl segundos.

export class SpeechBubbles {
  constructor(container, engine) {
    this.engine = engine;
    this.renderer = new CSS2DRenderer();
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    const dom = this.renderer.domElement;
    dom.style.position = 'absolute';
    dom.style.top = '0';
    dom.style.left = '0';
    dom.style.pointerEvents = 'none';
    dom.style.zIndex = '5';
    container.appendChild(dom);

    // Por dono (Character.group.uuid), guarda { obj, div, ttl, nome }
    this._porDono = new Map();

    window.addEventListener('resize', () => {
      this.renderer.setSize(window.innerWidth, window.innerHeight);
    });
  }

  // dono deve expor .character.group ou .group (aceita ambos)
  _grupoDe(dono) {
    return dono.character?.group || dono.group;
  }

  registrarAncora(dono, nomeExibicao) {
    const grupo = this._grupoDe(dono);
    if (!grupo) return;
    if (this._porDono.has(grupo.uuid)) return;

    const div = document.createElement('div');
    div.className = 'speech-bubble';
    div.textContent = '';
    div.style.display = 'none';

    const label = document.createElement('div');
    label.className = 'speech-name';
    label.textContent = nomeExibicao;
    label.style.display = 'none';

    const wrap = document.createElement('div');
    wrap.className = 'speech-wrap';
    wrap.appendChild(label);
    wrap.appendChild(div);

    const obj = new CSS2DObject(wrap);
    obj.position.set(0, 2.6, 0);   // acima da cabeça
    grupo.add(obj);

    this._porDono.set(grupo.uuid, { obj, div, label, ttl: 0 });
  }

  mostrar(dono, texto, ttl = 4) {
    const grupo = this._grupoDe(dono);
    if (!grupo) return;
    const entry = this._porDono.get(grupo.uuid);
    if (!entry) return;
    entry.div.textContent = texto;
    entry.div.style.display = 'block';
    entry.label.style.display = 'block';
    entry.ttl = ttl;
    // Guarda posição da última fala pra coordenar pausas por região:
    // NPCs num raio de X metros dessa posição vão esperar antes de falar de novo.
    const pos = grupo.position;
    entry.falaX = pos.x;
    entry.falaZ = pos.z;
    entry.silencioAte = performance.now() + ttl * 1000 + 1400;   // 1.4s de pausa após balão
  }

  // True se o balão desse dono ainda está visível
  temFalaAtiva(dono) {
    const grupo = this._grupoDe(dono);
    if (!grupo) return false;
    const entry = this._porDono.get(grupo.uuid);
    return !!(entry && entry.ttl > 0);
  }

  // True se algum balão numa roda ao redor do ponto ainda está em vigência
  // (visível OU em janela de silêncio pós-fala). Cria pausas naturais entre falas.
  emJanelaDeSilencio(x, z, raio = 10) {
    const agora = performance.now();
    for (const entry of this._porDono.values()) {
      if (agora >= (entry.silencioAte || 0)) continue;
      const dx = x - (entry.falaX ?? 0);
      const dz = z - (entry.falaZ ?? 0);
      if (dx * dx + dz * dz <= raio * raio) return true;
    }
    return false;
  }

  update(dt) {
    for (const entry of this._porDono.values()) {
      if (entry.ttl > 0) {
        entry.ttl -= dt;
        if (entry.ttl <= 0) {
          entry.div.style.display = 'none';
          entry.label.style.display = 'none';
        }
      }
    }
    this.renderer.render(this.engine.scene, this.engine.camera);
  }
}
