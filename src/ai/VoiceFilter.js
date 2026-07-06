// Aplica o "jeito" de cada personagem no texto final:
// - Bordão na frente
// - Estilo (nostalgia, ironia, exagero...) modifica a frase

import { ZONAS } from '../data/zonas.js';

const NUMEROS_PEQUENOS = ['dois', 'três', 'quatro', 'cinco', 'seis'];
const NUMEROS_GRANDES = ['dezoito', 'vinte e cinco', 'trinta', 'quarenta', 'cinquenta'];
const EXAGEROS = ['surtando', 'assombrado', 'fora de si', 'perdido', 'pirado', 'em outra dimensão'];

export class VoiceFilter {
  constructor(personagem) {
    this.p = personagem;
  }

  // Substitui slots e aplica estilo. `contexto` traz nomes e cidades.
  aplicar(texto, contexto = {}) {
    let saida = texto;

    // Slots universais
    saida = saida.replaceAll('[nome]',    contexto.nome    ?? this.p.nome);
    saida = saida.replaceAll('[alvo]',    contexto.alvo    ?? 'ele');
    saida = saida.replaceAll('[ausente]', contexto.ausente ?? 'fulano');
    saida = saida.replaceAll('[cidade]',  contexto.cidade  ?? 'Santa Catarina');
    saida = saida.replaceAll('[outra_cidade]', contexto.outra_cidade ?? cidadeAleatoria(contexto.cidade));
    saida = saida.replaceAll('[cidade_boba]',  cidadeAleatoria(contexto.cidade));
    saida = saida.replaceAll('[numero_pequeno]', pick(NUMEROS_PEQUENOS));
    saida = saida.replaceAll('[numero_grande]',  pick(NUMEROS_GRANDES));
    saida = saida.replaceAll('[exagero]',        pick(EXAGEROS));

    // Bordão do falante — só se estilo não brigar
    if (this.p.voz?.bordoes?.length && Math.random() < 0.55) {
      const b = pick(this.p.voz.bordoes);
      saida = juntarBordao(b, saida);
    }

    // Estilo — modificações leves. Idempotente se aplicado 2x.
    const estilos = this.p.voz?.estilo || [];
    for (const e of estilos) {
      if (e === 'nostalgia' && Math.random() < 0.4) {
        saida += ' No meu tempo era diferente.';
      }
      if (e === 'exagero' && Math.random() < 0.3) {
        saida = saida.replace(/\.$/, ` de verdade.`);
      }
      if (e === 'sussurro' && Math.random() < 0.2) {
        saida = `Pssst, ${saida.toLowerCase()}`;
      }
      if (e === 'auto_promocao' && Math.random() < 0.3) {
        saida += ' Que nem eu.';
      }
      if (e === 'ironia_seca' && Math.random() < 0.25) {
        saida += ' Que graça, hein.';
      }
    }

    return saida.trim();
  }
}

function juntarBordao(bordao, texto) {
  // Se o bordão termina em vírgula ou "..." é uma abertura; senão vira frase separada.
  if (/[,…]$/.test(bordao) || bordao.endsWith('...')) {
    // Primeira letra em minúsculo pra emendar
    return bordao + ' ' + texto.charAt(0).toLowerCase() + texto.slice(1);
  }
  return bordao + ' ' + texto;
}

function pick(arr) { return arr[Math.floor(Math.random() * arr.length)]; }

function cidadeAleatoria(evitar) {
  const opcoes = ZONAS.filter(z => z.nome !== evitar);
  return pick(opcoes).nome;
}
