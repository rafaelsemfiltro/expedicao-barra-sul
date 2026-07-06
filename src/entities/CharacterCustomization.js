import * as THREE from 'three';
import { toonMaterial } from '../world/toon.js';
import unlocksData from '../data/visual-unlocks.json';

// Aplica um "look" no Character: troca cor do corpo e monta peças 3D nos slots
// (cabelo/chapeu/oculos/roupa/acessorio/itemCidade). As peças são construídas por
// código a partir de tipos definidos em visual-unlocks.json — isso deixa o JSON
// como fonte da verdade e permite adicionar novos itens sem tocar em Character.js.

export class CharacterCustomization {
  constructor(character) {
    this.character = character;
    this.look = { corCorpo: null, cabelo: null, chapeu: null, oculos: null, roupa: null, acessorio: null, itemCidade: null };
  }

  aplicarLook(look) {
    this.look = { ...this.look, ...look };

    if (look.corCorpo != null) {
      const unlock = encontrarUnlock('corCorpo', look.corCorpo);
      if (unlock) {
        const cor = new THREE.Color(unlock.hex);
        this.character.mats.corpo.color.copy(cor);
      }
    }

    for (const slotNome of ['cabelo', 'chapeu', 'oculos', 'roupa', 'acessorio', 'itemCidade']) {
      const slot = this.character.slots[slotNome];
      limparGrupo(slot);
      const id = look[slotNome];
      if (!id) continue;
      const unlock = encontrarUnlock(slotNome, id);
      if (!unlock) continue;
      const peca = criarPeca(slotNome, unlock);
      if (peca) slot.add(peca);
    }
  }

  desbloqueiosAte(nivel) {
    const arr = [];
    for (const n of unlocksData.niveis) {
      if (n.nivel > nivel) break;
      for (const u of n.desbloqueia) arr.push({ ...u, nivel: n.nivel });
    }
    return arr;
  }
}

export function niveis() { return unlocksData.niveis; }

function encontrarUnlock(slot, id) {
  for (const n of unlocksData.niveis) {
    for (const u of n.desbloqueia) {
      if (u.slot === slot && u.id === id) return u;
    }
  }
  return null;
}

function limparGrupo(g) {
  for (let i = g.children.length - 1; i >= 0; i--) {
    const c = g.children[i];
    g.remove(c);
    if (c.geometry) c.geometry.dispose();
    // não descartar materiais toon compartilhados
  }
}

function criarPeca(slot, unlock) {
  const cor = new THREE.Color(unlock.hex || '#888888');
  switch (unlock.tipo || unlock.id) {
    case 'cabelo':          return fazerCabelo(cor);
    case 'bone':            return fazerBone(cor);
    case 'chapeu-praia':    return fazerChapeuPraia(cor);
    case 'chapeu-oktoberfest': return fazerChapeuOktoberfest(cor);
    case 'orelhas-parque':  return fazerOrelhasParque(cor);
    case 'escuros':         return fazerOculosEscuros();
    case 'camiseta':        return fazerCamiseta(cor);
    case 'floral':          return fazerCamisetaFloral();
    case 'regata':          return fazerRegata(cor);
    case 'casaco':          return fazerCasaco(cor);
    case 'camera':          return fazerCamera();
    case 'mochila':         return fazerMochila(cor);
    case 'prancha':         return fazerPrancha();
    case 'snorkel':         return fazerSnorkel(cor);
    default: return null;
  }
}

// === Cabeça ===

function fazerCabelo(cor) {
  const g = new THREE.Group();
  const cabelo = new THREE.Mesh(
    new THREE.SphereGeometry(0.44, 16, 12, 0, Math.PI * 2, 0, Math.PI * 0.5),
    toonMaterial(cor.getHex())
  );
  cabelo.position.y = 0.05;
  cabelo.castShadow = true;
  g.add(cabelo);
  return g;
}

function fazerBone(cor) {
  const g = new THREE.Group();
  const casco = new THREE.Mesh(
    new THREE.SphereGeometry(0.46, 16, 12, 0, Math.PI * 2, 0, Math.PI * 0.5),
    toonMaterial(cor.getHex())
  );
  casco.position.y = 0.06;
  casco.castShadow = true;
  g.add(casco);
  const aba = new THREE.Mesh(
    new THREE.CylinderGeometry(0.4, 0.4, 0.06, 16, 1, false, -Math.PI / 3, (Math.PI * 2) / 3),
    toonMaterial(cor.getHex())
  );
  aba.position.set(0, 0.05, 0.35);
  g.add(aba);
  return g;
}

function fazerChapeuPraia(cor) {
  const g = new THREE.Group();
  const copa = new THREE.Mesh(
    new THREE.CylinderGeometry(0.32, 0.32, 0.24, 16),
    toonMaterial(cor.getHex())
  );
  copa.position.y = 0.28;
  copa.castShadow = true;
  g.add(copa);
  const aba = new THREE.Mesh(
    new THREE.CylinderGeometry(0.7, 0.7, 0.06, 24),
    toonMaterial(cor.getHex())
  );
  aba.position.y = 0.14;
  aba.castShadow = true;
  g.add(aba);
  const fita = new THREE.Mesh(
    new THREE.CylinderGeometry(0.33, 0.33, 0.06, 16),
    toonMaterial(0xc76a55)
  );
  fita.position.y = 0.19;
  g.add(fita);
  return g;
}

function fazerChapeuOktoberfest(cor) {
  const g = new THREE.Group();
  const copa = new THREE.Mesh(
    new THREE.CylinderGeometry(0.32, 0.34, 0.42, 16),
    toonMaterial(cor.getHex())
  );
  copa.position.y = 0.36;
  copa.castShadow = true;
  g.add(copa);
  const aba = new THREE.Mesh(
    new THREE.CylinderGeometry(0.48, 0.48, 0.04, 24),
    toonMaterial(cor.getHex())
  );
  aba.position.y = 0.14;
  g.add(aba);
  const pena = new THREE.Mesh(
    new THREE.ConeGeometry(0.05, 0.35, 6),
    toonMaterial(0xf7e0a0)
  );
  pena.position.set(0.18, 0.65, 0);
  pena.rotation.z = -0.4;
  g.add(pena);
  return g;
}

function fazerOrelhasParque(cor) {
  const g = new THREE.Group();
  const orelhaGeo = new THREE.SphereGeometry(0.14, 12, 10);
  const mat = toonMaterial(cor.getHex());
  const esq = new THREE.Mesh(orelhaGeo, mat);
  esq.position.set(-0.25, 0.4, 0);
  esq.castShadow = true;
  g.add(esq);
  const dir = new THREE.Mesh(orelhaGeo, mat);
  dir.position.set(0.25, 0.4, 0);
  dir.castShadow = true;
  g.add(dir);
  const arco = new THREE.Mesh(
    new THREE.TorusGeometry(0.3, 0.02, 4, 12, Math.PI),
    toonMaterial(0x2a2a35)
  );
  arco.position.y = 0.42;
  arco.rotation.x = Math.PI / 2;
  g.add(arco);
  return g;
}

function fazerOculosEscuros() {
  const g = new THREE.Group();
  const mat = toonMaterial(0x1a1a2a);
  const lenteGeo = new THREE.BoxGeometry(0.16, 0.10, 0.04);
  const esq = new THREE.Mesh(lenteGeo, mat);
  esq.position.set(-0.14, 0.06, 0.40);
  g.add(esq);
  const dir = new THREE.Mesh(lenteGeo, mat);
  dir.position.set(0.14, 0.06, 0.40);
  g.add(dir);
  const ponte = new THREE.Mesh(new THREE.BoxGeometry(0.10, 0.02, 0.02), mat);
  ponte.position.set(0, 0.07, 0.42);
  g.add(ponte);
  return g;
}

// === Corpo (slots roupa/acessorio/itemCidade estão anexados no corpoMesh) ===

// A "peça de roupa" é uma malha que orbita o mesmo corpo. Fica levemente maior
// que o corpo pra sobrepor sem z-fight.
function fazerCamiseta(cor) {
  const g = new THREE.Group();
  const geo = new THREE.CapsuleGeometry(0.44, 0.35, 6, 16);
  const camisa = new THREE.Mesh(geo, toonMaterial(cor.getHex()));
  camisa.scale.set(1.16, 0.65, 1.06);
  camisa.position.y = -0.05;
  camisa.castShadow = true;
  g.add(camisa);
  // Logo pequeno no peito
  const logo = new THREE.Mesh(
    new THREE.CircleGeometry(0.08, 12),
    new THREE.MeshBasicMaterial({ color: 0xffe08a })
  );
  logo.position.set(0.12, 0.02, 0.44);
  g.add(logo);
  return g;
}

function fazerCamisetaFloral() {
  const g = new THREE.Group();
  const geo = new THREE.CapsuleGeometry(0.44, 0.35, 6, 16);
  const camisa = new THREE.Mesh(geo, toonMaterial(0xfff5e0));
  camisa.scale.set(1.16, 0.7, 1.06);
  camisa.position.y = -0.05;
  camisa.castShadow = true;
  g.add(camisa);
  // Flores (pontinhos coloridos)
  const cores = [0xe08c8c, 0xf5c95c, 0xb78cd6, 0x7fbf5f];
  for (let i = 0; i < 10; i++) {
    const flor = new THREE.Mesh(
      new THREE.SphereGeometry(0.05, 6, 4),
      new THREE.MeshBasicMaterial({ color: cores[i % cores.length] })
    );
    const ang = Math.random() * Math.PI * 2;
    const alt = -0.1 + Math.random() * 0.25;
    flor.position.set(Math.cos(ang) * 0.5, alt, Math.sin(ang) * 0.5);
    g.add(flor);
  }
  return g;
}

function fazerRegata(cor) {
  const g = new THREE.Group();
  const geo = new THREE.CapsuleGeometry(0.44, 0.30, 6, 16);
  const regata = new THREE.Mesh(geo, toonMaterial(cor.getHex()));
  regata.scale.set(1.17, 0.55, 1.07);
  regata.position.y = -0.10;
  regata.castShadow = true;
  g.add(regata);
  return g;
}

function fazerCasaco(cor) {
  const g = new THREE.Group();
  const geo = new THREE.CapsuleGeometry(0.46, 0.42, 6, 16);
  const casaco = new THREE.Mesh(geo, toonMaterial(cor.getHex()));
  casaco.scale.set(1.22, 0.85, 1.15);
  casaco.position.y = -0.02;
  casaco.castShadow = true;
  g.add(casaco);
  // Gola
  const gola = new THREE.Mesh(
    new THREE.TorusGeometry(0.28, 0.08, 8, 12),
    toonMaterial(0xf5e0a0)
  );
  gola.position.set(0, 0.32, 0);
  gola.rotation.x = Math.PI / 2;
  g.add(gola);
  return g;
}

function fazerCamera() {
  const g = new THREE.Group();
  const corpo = new THREE.Mesh(
    new THREE.BoxGeometry(0.28, 0.18, 0.14),
    toonMaterial(0x2a2a35)
  );
  corpo.position.set(0, 0.05, 0.5);
  g.add(corpo);
  const lente = new THREE.Mesh(
    new THREE.CylinderGeometry(0.06, 0.06, 0.10, 12),
    toonMaterial(0x1a1a1a)
  );
  lente.rotation.x = Math.PI / 2;
  lente.position.set(0, 0.05, 0.60);
  g.add(lente);
  // Alça
  const alca = new THREE.Mesh(
    new THREE.TorusGeometry(0.35, 0.02, 4, 16, Math.PI),
    toonMaterial(0x4a3a2a)
  );
  alca.position.set(0, 0.35, 0.10);
  alca.rotation.z = Math.PI;
  g.add(alca);
  return g;
}

function fazerMochila(cor) {
  const g = new THREE.Group();
  const corpo = new THREE.Mesh(
    new THREE.BoxGeometry(0.55, 0.55, 0.30),
    toonMaterial(cor.getHex())
  );
  corpo.position.set(0, 0, -0.45);
  corpo.castShadow = true;
  g.add(corpo);
  const bolso = new THREE.Mesh(
    new THREE.BoxGeometry(0.35, 0.20, 0.10),
    toonMaterial(cor.getHex())
  );
  bolso.position.set(0, -0.12, -0.60);
  g.add(bolso);
  return g;
}

function fazerPrancha() {
  const g = new THREE.Group();
  const prancha = new THREE.Mesh(
    new THREE.BoxGeometry(0.35, 1.6, 0.06),
    toonMaterial(0xffffff)
  );
  prancha.position.set(0.6, 0.2, -0.15);
  prancha.rotation.z = 0.35;
  prancha.castShadow = true;
  g.add(prancha);
  // Faixas coloridas
  const faixa = new THREE.Mesh(
    new THREE.BoxGeometry(0.35, 0.15, 0.07),
    toonMaterial(0xf47a9a)
  );
  faixa.position.set(0.6, 0.4, -0.15);
  faixa.rotation.z = 0.35;
  g.add(faixa);
  return g;
}

function fazerSnorkel(cor) {
  const g = new THREE.Group();
  // Nadadeiras nas costas (representação estilizada)
  const nadGeo = new THREE.BoxGeometry(0.20, 0.45, 0.05);
  const mat = toonMaterial(cor.getHex());
  const nadEsq = new THREE.Mesh(nadGeo, mat);
  nadEsq.position.set(-0.25, -0.15, -0.55);
  nadEsq.castShadow = true;
  g.add(nadEsq);
  const nadDir = new THREE.Mesh(nadGeo, mat);
  nadDir.position.set(0.25, -0.15, -0.55);
  nadDir.castShadow = true;
  g.add(nadDir);
  return g;
}
