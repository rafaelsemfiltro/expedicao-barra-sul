import * as THREE from 'three';
import { toonMaterial, PALETA } from './toon.js';

// Chão com variação sutil (dois tons de grama em manchas) + mar + praia.
// Manchas geradas via CanvasTexture — bem baratas.

export class Terrain {
  constructor(scene) {
    this.group = new THREE.Group();
    this.group.name = 'terrain';

    // Grama com textura de manchas
    const gramaMat = toonMaterial(0xffffff);   // cor branca; textura carrega a cor
    gramaMat.map = gerarTexturaGrama();
    gramaMat.map.wrapS = gramaMat.map.wrapT = THREE.RepeatWrapping;
    gramaMat.map.repeat.set(6, 6);

    const chao = new THREE.Mesh(
      new THREE.PlaneGeometry(700, 700, 1, 1),
      gramaMat
    );
    chao.rotation.x = -Math.PI / 2;
    chao.receiveShadow = true;
    this.group.add(chao);

    // Mar
    this.marMat = toonMaterial(PALETA.mar, { transparent: true, opacity: 0.94 });
    const mar = new THREE.Mesh(new THREE.PlaneGeometry(1600, 1600, 1, 1), this.marMat);
    mar.rotation.x = -Math.PI / 2;
    mar.position.set(600, -0.35, 0);
    mar.receiveShadow = true;
    this.group.add(mar);

    // Praia
    const praia = new THREE.Mesh(
      new THREE.PlaneGeometry(60, 500, 1, 1),
      toonMaterial(PALETA.praia)
    );
    praia.rotation.x = -Math.PI / 2;
    praia.position.set(120, 0.02, 20);
    praia.receiveShadow = true;
    this.group.add(praia);

    scene.add(this.group);
  }

  update(dt) {
    // Sem efeito animado nesta versão — toonMaterial fica mais estável estático.
  }
}

// Textura procedural de grama: fundo verde-médio + manchas mais claras e mais escuras.
function gerarTexturaGrama() {
  const c = document.createElement('canvas');
  c.width = 256; c.height = 256;
  const ctx = c.getContext('2d');

  // Base
  ctx.fillStyle = '#8fd06a';
  ctx.fillRect(0, 0, 256, 256);

  // Manchas claras
  ctx.fillStyle = '#b7e88a';
  for (let i = 0; i < 60; i++) {
    ctx.beginPath();
    ctx.arc(Math.random() * 256, Math.random() * 256, 6 + Math.random() * 14, 0, Math.PI * 2);
    ctx.fill();
  }

  // Manchas escuras
  ctx.fillStyle = '#6fa851';
  for (let i = 0; i < 40; i++) {
    ctx.beginPath();
    ctx.arc(Math.random() * 256, Math.random() * 256, 4 + Math.random() * 10, 0, Math.PI * 2);
    ctx.fill();
  }

  const tex = new THREE.CanvasTexture(c);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.anisotropy = 4;
  return tex;
}
