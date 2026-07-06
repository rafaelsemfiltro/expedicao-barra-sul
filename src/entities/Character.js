import * as THREE from 'three';
import { toonMaterial, PELE, gerarGradientMap } from '../world/toon.js';

// Boneco low-poly estilo Fall Guys / Crossy Road: corpo redondinho, cabeça grande, braços
// e pernas curtinhos com pivô no ombro/quadril pra balançar via rotation.x.
// Animações são procedurais — sem AnimationMixer, sem GLB. Estados: idle, walk, run.
// Interpola entre eles conforme a velocidade recebida em update().

const ALTURA_TOTAL = 1.7;

export class Character {
  constructor({ cor = 0x2f8fc9, nome = 'Player', pele = PELE } = {}) {
    this.nome = nome;
    this.altura = ALTURA_TOTAL;
    this.group = new THREE.Group();
    this.group.name = 'character-' + nome;

    // Materiais principais (guardados para customização depois)
    this.mats = {
      corpo: toonMaterial(cor),
      pele:  toonMaterial(pele),
      pes:   toonMaterial(0x2a2a35),
      neutro:toonMaterial(0xf0f0f0),
      olhos: new THREE.MeshBasicMaterial({ color: 0x1a1a1a })
    };

    this._buildCorpo();
    this._buildCabeca();
    this._buildBracos();
    this._buildPernas();

    // Slots pra customização (chapéu, óculos, roupa, acessório) — CharacterCustomization anexa/remove.
    this.slots = {
      cabelo:     new THREE.Group(),
      chapeu:     new THREE.Group(),
      oculos:     new THREE.Group(),
      roupa:      new THREE.Group(),
      acessorio:  new THREE.Group(),
      itemCidade: new THREE.Group()
    };
    this.cabecaPivot.add(this.slots.cabelo);
    this.cabecaPivot.add(this.slots.chapeu);
    this.cabecaPivot.add(this.slots.oculos);
    this.corpoMesh.add(this.slots.roupa);
    this.corpoMesh.add(this.slots.acessorio);
    this.corpoMesh.add(this.slots.itemCidade);

    // Sombra falsa embaixo
    const sombra = new THREE.Mesh(
      new THREE.CircleGeometry(0.55, 24),
      new THREE.MeshBasicMaterial({ color: 0x000000, transparent: true, opacity: 0.22 })
    );
    sombra.rotation.x = -Math.PI / 2;
    sombra.position.y = 0.02;
    this.group.add(sombra);

    this._t = Math.random() * 10;   // dessincroniza idle dos NPCs
    this._corpoBaseY = this.corpoMesh.position.y;
    this._cabecaBaseY = this.cabecaPivot.position.y;
  }

  get position() { return this.group.position; }
  get rotationY() { return this.group.rotation.y; }
  set rotationY(v) { this.group.rotation.y = v; }

  _buildCorpo() {
    // Corpo é uma cápsula "gorda" — largo, arredondado, curto.
    const geo = new THREE.CapsuleGeometry(0.42, 0.35, 6, 16);
    const mesh = new THREE.Mesh(geo, this.mats.corpo);
    mesh.scale.set(1.15, 1.0, 1.05);
    mesh.position.y = 0.75;
    mesh.castShadow = true;
    this.group.add(mesh);
    this.corpoMesh = mesh;
  }

  _buildCabeca() {
    // Pivot pra poder inclinar a cabeça no run
    this.cabecaPivot = new THREE.Group();
    this.cabecaPivot.position.y = 1.25;
    this.group.add(this.cabecaPivot);

    const cabeca = new THREE.Mesh(
      new THREE.SphereGeometry(0.42, 20, 16),
      this.mats.pele
    );
    cabeca.scale.set(1, 0.95, 1);
    cabeca.castShadow = true;
    this.cabecaPivot.add(cabeca);
    this.cabecaMesh = cabeca;

    // Olhinhos
    const olhoGeo = new THREE.SphereGeometry(0.06, 8, 6);
    const olhoEsq = new THREE.Mesh(olhoGeo, this.mats.olhos);
    const olhoDir = new THREE.Mesh(olhoGeo, this.mats.olhos);
    olhoEsq.position.set(-0.14, 0.06, 0.36);
    olhoDir.position.set( 0.14, 0.06, 0.36);
    this.cabecaPivot.add(olhoEsq);
    this.cabecaPivot.add(olhoDir);

    // Boca — pequena capsula
    const boca = new THREE.Mesh(
      new THREE.CapsuleGeometry(0.02, 0.08, 4, 6),
      this.mats.olhos
    );
    boca.rotation.z = Math.PI / 2;
    boca.position.set(0, -0.1, 0.38);
    this.cabecaPivot.add(boca);
  }

  _buildBracos() {
    this.bracoEsq = this._fazerBraco(+1);
    this.bracoDir = this._fazerBraco(-1);
    this.group.add(this.bracoEsq);
    this.group.add(this.bracoDir);
  }

  _fazerBraco(lado) {
    // Pivot no ombro. Rotação em X balança pra frente/trás.
    const pivot = new THREE.Group();
    pivot.position.set(lado * 0.48, 0.95, 0);

    const braco = new THREE.Mesh(
      new THREE.CapsuleGeometry(0.11, 0.28, 4, 8),
      this.mats.corpo
    );
    braco.position.y = -0.22;
    braco.castShadow = true;
    pivot.add(braco);

    const mao = new THREE.Mesh(
      new THREE.SphereGeometry(0.13, 12, 10),
      this.mats.pele
    );
    mao.position.y = -0.45;
    mao.castShadow = true;
    pivot.add(mao);

    return pivot;
  }

  _buildPernas() {
    this.pernaEsq = this._fazerPerna(+1);
    this.pernaDir = this._fazerPerna(-1);
    this.group.add(this.pernaEsq);
    this.group.add(this.pernaDir);
  }

  _fazerPerna(lado) {
    const pivot = new THREE.Group();
    pivot.position.set(lado * 0.16, 0.50, 0);

    const perna = new THREE.Mesh(
      new THREE.CapsuleGeometry(0.13, 0.22, 4, 8),
      this.mats.corpo
    );
    perna.position.y = -0.20;
    perna.castShadow = true;
    pivot.add(perna);

    // "Sapato" achatado, deslocado pra frente
    const sapato = new THREE.Mesh(
      new THREE.SphereGeometry(0.17, 10, 8),
      this.mats.pes
    );
    sapato.scale.set(1.1, 0.6, 1.4);
    sapato.position.set(0, -0.42, 0.05);
    sapato.castShadow = true;
    pivot.add(sapato);

    return pivot;
  }

  // Estado: passar a velocidade escalar em u/s e o motor decide idle/walk/run.
  update(dt, velocidade = 0) {
    this._t += dt;
    const t = this._t;

    // Interpolação suave: 0 = idle, 1 = walk, 2 = run
    let estado;
    if (velocidade < 0.5)      estado = 0;
    else if (velocidade < 8.5) estado = clamp((velocidade - 0.5) / 8, 0, 1);
    else                       estado = 1 + clamp((velocidade - 8.5) / 6, 0, 1);

    // Frequência e amplitude de acordo com o estado
    const freq  = 2.0 + estado * 4.0;      // idle 2Hz, walk ~4, run ~8
    const amp   = 0.05 + estado * 0.55;    // idle sutil, walk mediano, run amplo
    const bobY  = 0.02 + estado * 0.05;

    const fase = t * freq;
    const balanco = Math.sin(fase);

    // Pernas: alternam
    this.pernaEsq.rotation.x =  balanco * amp;
    this.pernaDir.rotation.x = -balanco * amp;

    // Braços: opostos das pernas + sempre um pouquinho abertos pra fora
    this.bracoEsq.rotation.x = -balanco * amp * 0.9;
    this.bracoDir.rotation.x =  balanco * amp * 0.9;
    this.bracoEsq.rotation.z =  0.18 + Math.abs(balanco) * 0.05;
    this.bracoDir.rotation.z = -0.18 - Math.abs(balanco) * 0.05;

    // Bob do corpo (2× freq por causa dos dois passos por ciclo)
    const bob = Math.abs(Math.sin(fase * 2)) * bobY;
    this.corpoMesh.position.y = this._corpoBaseY + bob;
    this.cabecaPivot.position.y = this._cabecaBaseY + bob * 0.7;

    // Inclinação pra frente no run
    const incl = estado > 1 ? (estado - 1) * 0.22 : 0;
    this.corpoMesh.rotation.x = incl;
    this.cabecaPivot.rotation.x = incl * 0.5;

    // Cabeça olha ao redor no idle
    if (estado < 0.3) {
      this.cabecaPivot.rotation.y = Math.sin(t * 0.6) * 0.18;
    } else {
      this.cabecaPivot.rotation.y = 0;
    }
  }

  // Compatibilidade com Player antigo (não faz mais nada aqui — update() cuida de tudo)
  animarPasso() {}
  pararAnimacao() {}
}

function clamp(v, a, b) { return v < a ? a : (v > b ? b : v); }
