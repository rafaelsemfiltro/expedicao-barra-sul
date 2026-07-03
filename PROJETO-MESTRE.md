# PROJETO MESTRE — Expedição Barra Sul

Visão original do jogo, escrita por Rafael. Este documento é a fonte da verdade sobre a experiência que o jogo deve entregar — a arquitetura técnica (ver `ARQUITETURA-EXPEDICAO-BARRA-SUL.md`) existe para realizar exatamente isto.

## A ideia original

Um jogo interativo inspirado em mapas/jogos exploráveis (tipo "explorar uma ilha com as 7 Maravilhas"). Cada personagem representa um vendedor da sala de vendas de viagens do Rafael. O jogador explora lugares, responde questões turísticas, ganha pontuação, sobe num ranking e vai liberando novos mapas.

Progressão geográfica: começa em Santa Catarina (região local), depois libera o restante do Brasil, depois América Latina, até completar o mapa mundi.

Deve ser bem interativo: um bonequinho anda pelo mapa, o jogador clica para entrar numa atração turística e responder perguntas.

Os personagens (bonequinhos) devem se comportar como inteligências artificiais de verdade, com personalidade própria, e continuar conversando entre si mesmo quando o jogador não está resolvendo questões — ou seja, o mundo continua "vivo" enquanto o jogador só observa. Eles só se deslocam fisicamente para pontos turísticos quando o jogador está online e clica para ir.

## Nome do jogo

**Expedição Barra Sul.**

## Conversas visíveis e personalidade dos NPCs

A conversa entre as inteligências artificiais (os personagens) deve ficar visível para qualquer pessoa que acessar o jogo. Cada personagem precisa ter personalidade própria e reconhecível — isso é proposital: ver seu próprio personagem sendo "chato demais", "reclamando demais" ou "fofoqueiro demais" gera uma brincadeira natural entre os colegas de sala de vendas que acompanham.

## Login e controle de personagem

- Cada colaborador só tem acesso ao próprio jogador/personagem.
- Login simples: nome + senha de 3 dígitos (PIN).
- Ao entrar, o jogador já cai no seu próprio personagem.
- Se o jogador não fizer nada, ele fica apenas observando: seu personagem continua interagindo sozinho com os outros personagens.
- Só quando o jogador clica em "acessar personagem" é que ele assume o controle e pode:
  - andar até os locais turísticos e responder o quiz;
  - clicar em outro personagem para conversar com ele, digitando o que quer dizer.
- Quando o jogador solta o controle (não está mais controlando), o personagem continua evoluindo e conversando com os outros de forma autônoma, com base em tudo que já aconteceu.

## Memória evolutiva

Tudo que o jogador digita controlando o próprio personagem — inclusive as conversas manuais com outros personagens — fica gravado e molda o jeito do personagem. Quando o jogador não está online controlando, o personagem continua conversando automaticamente com os outros usando esse histórico acumulado (se o jogador vive zoando um colega nas conversas manuais, o personagem continua zoando esse colega no automático).

## Painel de destaque (ranking de brincadeira)

Além do ranking de pontos, existe um painel de humor com destaques do tipo "quem mais viajou" e "quem ainda está parado na Barra Sul até hoje". Importante: nada de nome que soe humilhante ou que possa pegar mal entre colegas de trabalho — o tom é de brincadeira leve, nunca de constrangimento real. Nome escolhido para essa seção: **Deu Mole** (nomes descartados: "Mural da Vergonha", "Rádio Corredor", "Boca de Ouro" — não agradaram).

## Personalidade sazonal / fofoca com consequência

- Errar uma pergunta do quiz vira "assunto" entre os personagens — eles comentam e zoam de forma engraçada, sem humilhar.
- Personagem que fica dias sem jogar começa a ser comentado pelos outros, que especulam se ele "bateu meta e sumiu" ou está "de gancho".
- Os personagens devem especular essas coisas de forma engraçada e fofoqueira, não literal.

## Perguntas do quiz

As perguntas devem misturar conhecimento turístico geral com o que um agente de viagem realmente precisa saber: custo médio de passagem/passeio, como chegar ao destino, pontos e passeios mais famosos, alta temporada, câmbio, documentação, "pegadinhas" de vendedor. Nada de perguntas genéricas de cultura geral apenas — o quiz deve treinar o vendedor de verdade.

## Multiplayer e simultaneidade

Se duas ou três pessoas estiverem no jogo ao mesmo tempo, todas devem ver exatamente a mesma conversa e os mesmos eventos acontecendo entre os personagens (mundo compartilhado, não instâncias separadas por jogador).

## Escala e demo

Número de personagens: o suficiente para cobrir todos os vendedores reais da sala de vendas (mais de 8 — a v1 fictícia é só um teste). Para validar o conceito antes de usar os nomes reais da equipe, a primeira versão é uma demo com 4 vendedores fictícios, cada um com personalidade e "mania"/bordão próprios, para testar o ritmo das conversas, a dificuldade das perguntas e o visual antes de trocar pelo elenco real da sala.

## Resumo das decisões fechadas nesta conversa

- Nome do jogo: Expedição Barra Sul
- Login: nome + PIN de 3 dígitos, um personagem por colaborador
- Conversas dos NPCs: sempre visíveis a todos, com personalidade própria
- Painel de humor: "Deu Mole" (não "Mural da Vergonha" nem "Rádio Corredor")
- Memória evolutiva: o que o jogador digita vira parte permanente do jeito de ser do personagem
- Demo inicial: 4 vendedores fictícios (Marcelo "o Fechador", Carla "a Competitiva", Jefinho "o Fofoqueiro", Dona Rose "a Veterana"), para validar antes de trocar pelo time real
