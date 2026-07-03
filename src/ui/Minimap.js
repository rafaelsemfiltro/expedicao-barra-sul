import { ZONAS, ESTRADAS, LIMITE_MUNDO } from '../data/zonas.js';

// Minimapa 2D redondo. Redesenha ~10x por segundo pra economizar. Norte pra cima.
// Player como triângulo azul (aponta na direção que ele está virado). Cidades como
// círculos coloridos com inicial. NPCs como pontos vermelhos com nome curto.

const RAIO_MAPA = 200;      // distância em unidades de mundo que o mapa exibe (raio)
const REDRAW_MS = 100;

export class Minimap {
  constructor(canvas, player, npcs) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
    this.player = player;
    this.npcs = npcs;

    // Retina-friendly: dobra a resolução interna
    const cssSize = canvas.clientWidth || 160;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width = cssSize * dpr;
    canvas.height = cssSize * dpr;
    this.ctx.scale(dpr, dpr);
    this.size = cssSize;
    this.raioPixel = cssSize / 2;

    this._lastDraw = 0;
    this._zonaPorId = new Map(ZONAS.map(z => [z.id, z]));
  }

  update(dt) {
    this._lastDraw += dt * 1000;
    if (this._lastDraw < REDRAW_MS) return;
    this._lastDraw = 0;
    this._draw();
  }

  // Converte coordenada de mundo (x, z) — relativa ao player — em pixel do minimapa.
  _worldToMap(wx, wz) {
    const px = this.player.position.x;
    const pz = this.player.position.z;
    const dx = wx - px;
    const dz = wz - pz;
    const scale = this.raioPixel / RAIO_MAPA;
    return {
      x: this.size / 2 + dx * scale,
      y: this.size / 2 + dz * scale
    };
  }

  _draw() {
    const ctx = this.ctx;
    const s = this.size;
    const cx = s / 2, cy = s / 2;

    ctx.clearRect(0, 0, s, s);

    // Fundo do mar/mundo
    ctx.save();
    ctx.beginPath();
    ctx.arc(cx, cy, this.raioPixel - 1, 0, Math.PI * 2);
    ctx.clip();

    ctx.fillStyle = '#4a90b8';           // mar
    ctx.fillRect(0, 0, s, s);

    // Chão (retângulo do mundo)
    const p1 = this._worldToMap(-LIMITE_MUNDO, -LIMITE_MUNDO);
    const p2 = this._worldToMap( LIMITE_MUNDO,  LIMITE_MUNDO);
    ctx.fillStyle = '#7fb96a';
    ctx.fillRect(p1.x, p1.y, p2.x - p1.x, p2.y - p1.y);

    // Estradas
    ctx.strokeStyle = '#3a3a44';
    ctx.lineWidth = 2;
    for (const [aId, bId] of ESTRADAS) {
      const a = this._zonaPorId.get(aId);
      const b = this._zonaPorId.get(bId);
      if (!a || !b) continue;
      const pa = this._worldToMap(a.centro.x, a.centro.z);
      const pb = this._worldToMap(b.centro.x, b.centro.z);
      ctx.beginPath();
      ctx.moveTo(pa.x, pa.y);
      ctx.lineTo(pb.x, pb.y);
      ctx.stroke();
    }

    // Cidades
    for (const zona of ZONAS) {
      const p = this._worldToMap(zona.centro.x, zona.centro.z);
      const raio = Math.max(4, zona.raio * (this.raioPixel / RAIO_MAPA));
      ctx.beginPath();
      ctx.arc(p.x, p.y, raio, 0, Math.PI * 2);
      ctx.fillStyle = colorHex(zona.cor);
      ctx.fill();
      ctx.strokeStyle = 'rgba(0,0,0,0.4)';
      ctx.lineWidth = 1;
      ctx.stroke();

      // Inicial da cidade
      ctx.fillStyle = '#222';
      ctx.font = 'bold 10px system-ui, sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(zona.nome[0], p.x, p.y);
    }

    // NPCs
    for (const npc of this.npcs) {
      const p = this._worldToMap(npc.position.x, npc.position.z);
      // Pula se muito fora do raio (economia)
      const dx = p.x - cx, dy = p.y - cy;
      if (dx * dx + dy * dy > this.raioPixel * this.raioPixel) continue;
      ctx.beginPath();
      ctx.arc(p.x, p.y, 3.5, 0, Math.PI * 2);
      ctx.fillStyle = '#e63946';
      ctx.fill();
      ctx.strokeStyle = 'white';
      ctx.lineWidth = 1;
      ctx.stroke();
    }

    ctx.restore();

    // Player: triângulo apontando pra facing
    const facing = this.player.character.group.userData.facing ?? this.player.character.rotationY;
    this._drawPlayerArrow(cx, cy, facing);

    // Borda circular
    ctx.beginPath();
    ctx.arc(cx, cy, this.raioPixel - 1, 0, Math.PI * 2);
    ctx.strokeStyle = 'rgba(255,255,255,0.9)';
    ctx.lineWidth = 2;
    ctx.stroke();

    // Etiqueta "N" no topo (norte)
    ctx.fillStyle = 'rgba(255,255,255,0.9)';
    ctx.font = 'bold 10px system-ui, sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'top';
    ctx.fillText('N', cx, 3);
  }

  _drawPlayerArrow(cx, cy, facing) {
    const ctx = this.ctx;
    ctx.save();
    ctx.translate(cx, cy);
    // Convenção do mundo: Norte = -Z (pra cima no mapa). Facing 0 = +Z (sul).
    // Rotação do canvas: 0 = pra direita. Precisamos: facing=0 → seta pra baixo.
    // O ângulo do canvas pra apontar a seta na direção do facing: rot = -facing + π/2 ... vamos direto.
    // Nossa seta base aponta pra cima (norte). Pra girar de acordo com facing:
    // facing=0 (sul, +Z) → seta pra baixo → rotação canvas de π.
    // facing=π (norte, -Z) → seta pra cima → rotação canvas 0.
    // Então canvas rotation = facing + π.
    ctx.rotate(facing + Math.PI);
    ctx.beginPath();
    ctx.moveTo(0, -7);
    ctx.lineTo(5, 5);
    ctx.lineTo(0, 2);
    ctx.lineTo(-5, 5);
    ctx.closePath();
    ctx.fillStyle = '#2f8fc9';
    ctx.fill();
    ctx.strokeStyle = 'white';
    ctx.lineWidth = 1.5;
    ctx.stroke();
    ctx.restore();
  }
}

function colorHex(n) {
  return '#' + n.toString(16).padStart(6, '0');
}
