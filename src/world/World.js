import { Terrain } from './Terrain.js';
import { Roads } from './Roads.js';
import { Lighting } from './Lighting.js';
import { Vegetation } from './Vegetation.js';
import { ZONAS } from '../data/zonas.js';

import { build as buildBC }      from './zones/BalnearioCamboriu.js';
import { build as buildBomb }    from './zones/Bombinhas.js';
import { build as buildFloripa } from './zones/Florianopolis.js';
import { build as buildBeto }    from './zones/BetoCarrero.js';
import { build as buildBlu }     from './zones/Blumenau.js';
import { build as buildSerra }   from './zones/SerraRioDoRastro.js';

const BUILDERS = {
  'balneario-camboriu':   buildBC,
  'bombinhas':            buildBomb,
  'florianopolis':        buildFloripa,
  'beto-carrero':         buildBeto,
  'blumenau':             buildBlu,
  'serra-rio-do-rastro':  buildSerra
};

// Monta o mundo inteiro: terreno, luz, estradas e as 6 zonas.
export class World {
  constructor(scene) {
    this.scene = scene;
    this.lighting = new Lighting(scene);
    this.terrain = new Terrain(scene);
    this.roads = new Roads(scene);
    this.vegetation = new Vegetation(scene, { quantidade: 180 });

    this.zonas = [];
    for (const zona of ZONAS) {
      const builder = BUILDERS[zona.id];
      if (!builder) { console.warn('Sem builder para zona', zona.id); continue; }
      const group = builder(scene, zona);
      this.zonas.push({ zona, group });
    }
  }

  update(dt) {
    this.terrain.update(dt);
    this.lighting.update(dt);
  }
}
