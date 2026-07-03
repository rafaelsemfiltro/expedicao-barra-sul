import * as THREE from 'three';

// Placeholder low-poly do personagem: cápsula colorida + "cabeça" esfera + acessório opcional (boné).
// Este é o corpo base que o Player controla e que os NPCs vão usar na Fase 3.
export class Character {
  constructor({ cor = 0x2f8fc9, altura = 1.8, nome = 'Player' } = {}) {
    this.nome = nome;
    this.altura = altura;
    this.group = new THREE.Group();
    this.group.name = 'character-' + nome;

    // Corpo (cápsula)
    const raio = 0.4;
    const alturaCorpo = Math.max(altura - raio * 2, 0.5);
    const corpo = new THREE.Mesh(
      new THREE.CapsuleGeometry(raio, alturaCorpo, 6, 12),
      new THREE.MeshStandardMaterial({ color: cor, roughness: 0.5 })
    );
    corpo.position.y = altura / 2;
    corpo.castShadow = true;
    this.group.add(corpo);

    // Cabeça (esfera)
    const cabeca = new THREE.Mesh(
      new THREE.SphereGeometry(0.32, 16, 12),
      new THREE.MeshStandardMaterial({ color: 0xf5c68e, roughness: 0.6 })
    );
    cabeca.position.y = altura + 0.1;
    cabeca.castShadow = true;
    this.group.add(cabeca);
    this.cabeca = cabeca;

    // Marcador de "frente" (nariz), pra dar identidade visual à orientação
    const nariz = new THREE.Mesh(
      new THREE.ConeGeometry(0.06, 0.15, 6),
      new THREE.MeshStandardMaterial({ color: 0xd08050 })
    );
    nariz.rotation.x = -Math.PI / 2;
    nariz.position.set(0, altura + 0.1, 0.32);
    this.group.add(nariz);

    // Sombra falsa embaixo (círculo escuro) — reforça a percepção de solo
    const sombra = new THREE.Mesh(
      new THREE.CircleGeometry(0.5, 16),
      new THREE.MeshBasicMaterial({ color: 0x000000, transparent: true, opacity: 0.25 })
    );
    sombra.rotation.x = -Math.PI / 2;
    sombra.position.y = 0.02;
    this.group.add(sombra);

    this._bobTime = 0;
    this._bobOffsetY = corpo.position.y;
    this.corpo = corpo;
  }

  get position() { return this.group.position; }
  get rotationY() { return this.group.rotation.y; }
  set rotationY(v) { this.group.rotation.y = v; }

  // Chamada pelo Player quando está andando/correndo, pra dar um "bob"
  animarPasso(dt, velocidade) {
    this._bobTime += dt * velocidade * 3;
    const bob = Math.sin(this._bobTime) * 0.06;
    this.corpo.position.y = this._bobOffsetY + bob;
  }

  pararAnimacao() {
    this._bobTime = 0;
    this.corpo.position.y = this._bobOffsetY;
  }
}
