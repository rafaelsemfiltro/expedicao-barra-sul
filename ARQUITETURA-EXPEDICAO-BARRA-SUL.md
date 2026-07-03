# EXPEDIÇÃO BARRA SUL — ARQUITETURA DO PROJETO (Fase 1)

Documento-guia para desenvolvimento no Claude Code. Este arquivo deve viver na raiz do repositório e ser lido no início de cada sessão de desenvolvimento. Ele traduz a visão do PROJETO MESTRE em decisões técnicas concretas.

## 1. Stack e infraestrutura

O jogo é um web game 3D, jogável em desktop e celular pelo navegador, sem instalação.

- **Motor 3D**: Three.js (r160+) com Vite como bundler
- **Linguagem**: JavaScript ES Modules (TypeScript opcional na Fase 3+)
- **Backend**: Supabase (Postgres + Realtime + Auth simples por PIN)
- **Hospedagem**: GitHub Pages (build estático via GitHub Actions)
- **Áudio**: Howler.js (música ambiente + efeitos, com fallback silencioso)
- **Assets 3D**: Modelos low-poly em glTF (.glb), criados/adaptados de packs CC0
- **Fotos**: Acervo próprio do Rafael (BC, drone, viagens) em WebP otimizado

Por que essa stack: roda em qualquer celular da sala de vendas, custo zero de servidor de jogo (Supabase free tier aguenta uma equipe), deploy automático a cada push, e o Rafael já domina Supabase e GitHub Pages.

O que a stack NÃO tenta ser: não é Unity/Unreal. Visual estilo Roblox/Fall Guys em low-poly é totalmente alcançável em Three.js; fidelidade de Animal Crossing (Nintendo, equipe de arte dedicada) não é a meta realista — a meta é "bonito, colorido, leve e agradável", e isso low-poly bem iluminado entrega.

## 2. Estrutura do repositório

Nenhum arquivo gigante. Cada sistema em seu módulo. Dados separados de código.

```
expedicao-barra-sul/
├── ARQUITETURA-EXPEDICAO-BARRA-SUL.md   ← este documento
├── PROJETO-MESTRE.md                     ← a visão original
├── index.html
├── vite.config.js
├── .github/workflows/deploy.yml          ← build + deploy GitHub Pages
│
├── src/
│   ├── main.js                           ← bootstrap: cria Engine e inicia o jogo
│   │
│   ├── core/                             ← infraestrutura do motor
│   │   ├── Engine.js                     ← loop principal, delta time, ciclo update/render
│   │   ├── SceneManager.js               ← troca de cenas (login → mundo → cidade)
│   │   ├── CameraRig.js                  ← câmera 3ª pessoa com colisão e suavização
│   │   ├── Input.js                      ← WASD + mouse (desktop)
│   │   ├── TouchInput.js                 ← joystick virtual + botões (mobile)
│   │   ├── AudioManager.js               ← música por zona, efeitos, volume, mute
│   │   └── AssetLoader.js                ← carregamento com tela de loading e cache
│   │
│   ├── world/                            ← o mundo de Santa Catarina
│   │   ├── World.js                      ← monta o mundo a partir de dados
│   │   ├── Terrain.js                    ← chão, praias, morros, mar animado
│   │   ├── Roads.js                      ← estradas conectando cidades (splines)
│   │   ├── Lighting.js                   ← sol, sombras, ciclo suave de cor
│   │   ├── Skybox.js
│   │   └── zones/                        ← 1 arquivo por cidade (layout, props, spawns)
│   │       ├── BalnearioCamboriu.js
│   │       ├── Bombinhas.js
│   │       ├── Florianopolis.js
│   │       ├── BetoCarrero.js
│   │       ├── Blumenau.js
│   │       └── SerraRioDoRastro.js
│   │
│   ├── entities/
│   │   ├── Character.js                  ← modelo base (corpo, cor, acessório, animações)
│   │   ├── Player.js                     ← personagem controlado (andar, correr, interagir)
│   │   ├── NPC.js                        ← personagem autônomo (recebe ordens do brain)
│   │   └── Animations.js                 ← idle, walk, run, talk, celebrate, facepalm
│   │
│   ├── ai/                               ← o coração do jogo
│   │   ├── NPCBrain.js                   ← máquina de estados por utilidade (seção 5)
│   │   ├── SocialGraph.js                ← amizades, rivalidades, afinidades
│   │   ├── MemoryBank.js                 ← eventos com decaimento temporal (seção 6)
│   │   ├── DialogueEngine.js             ← gerador de conversas local (seção 7)
│   │   ├── grammar/                      ← templates de fala por tema
│   │   │   ├── provocacoes.js
│   │   │   ├── deumole.js
│   │   │   ├── ranking.js
│   │   │   ├── sumidos.js
│   │   │   ├── destinos.js
│   │   │   └── cotidiano.js
│   │   └── VoiceFilter.js                ← aplica bordões e "sotaque" de cada personagem
│   │
│   ├── systems/
│   │   ├── QuizSystem.js                 ← sorteio, sessão, correção, anti-repetição
│   │   ├── XPSystem.js                   ← XP, níveis, progresso por cidade
│   │   ├── CityCompletion.js             ← cidade dourada, selo, fogos
│   │   ├── Achievements.js               ← conquistas e títulos (seção 9)
│   │   ├── DeuMole.js                    ← detecção de mico + publicação no feed
│   │   ├── Ranking.js
│   │   ├── SaveSystem.js                 ← cliente Supabase (seção 4)
│   │   └── Multiplayer.js                ← presença + posições via Supabase Realtime
│   │
│   ├── ui/
│   │   ├── HUD.js                        ← XP, cidade atual, minimapa
│   │   ├── LoginScreen.js                ← escolha de personagem + PIN
│   │   ├── QuizPanel.js                  ← perguntas com foto, feedback, resultado
│   │   ├── AttractionPanel.js            ← foto real, história, dicas de venda
│   │   ├── RankingPanel.js               ← pódio animado, medalhas
│   │   ├── DeuMolePanel.js
│   │   ├── SpeechBubbles.js              ← balões 3D sobre as cabeças
│   │   └── MobileControls.js
│   │
│   ├── fx/
│   │   ├── Particles.js                  ← confete, fogos, poeira de corrida
│   │   └── Feedback.js                   ← acerto, erro, level up
│   │
│   └── data/                             ← TUDO que é conteúdo, zero lógica
│       ├── personagens.json              ← elenco (seção 8)
│       ├── conquistas.json
│       ├── destinos/
│       │   ├── balneario-camboriu.json   ← pontos turísticos, fotos, dicas
│       │   ├── bombinhas.json
│       │   └── ...
│       └── perguntas/
│           ├── balneario-camboriu.json   ← banco grande, categorizado
│           ├── bombinhas.json
│           └── ...
│
└── assets/
    ├── models/                           ← .glb (personagens, prédios, props, FG Big Wheel...)
    ├── photos/                           ← fotos reais em WebP (1280px máx)
    ├── audio/
    │   ├── music/                        ← 1 trilha por cidade (licença CC0/CC-BY)
    │   └── sfx/                          ← passos, acerto, erro, fogos, mar, pássaros
    └── textures/
```

Regra de ouro: adicionar uma cidade nova = criar 1 arquivo em `world/zones/`, 1 em `data/destinos/`, 1 em `data/perguntas/` e registrar no índice. Nenhum código existente é alterado.

## 3. Escalas de mundo

O mapa não é geográfico real (SC inteira seria vazia e chata de atravessar). É um "mundo em miniatura" no espírito de parques temáticos: cada cidade é um bairro compacto com seus marcos reconhecíveis, ligadas por estradas de 30 a 60 segundos de caminhada, com paisagem no caminho (mar, morros, araucárias na serra). Correr corta o tempo pela metade. Fase futura pode adicionar um "busãozinho da firma" para viagem rápida entre cidades já visitadas.

## 4. Modelo de dados (Supabase)

```sql
-- Jogadores/personagens (1 linha por colaborador)
players (
  id text primary key,          -- slug: 'marcelo'
  name text,
  pin_hash text,                 -- PIN de 3-4 dígitos com hash
  avatar jsonb,                  -- cor, acessório, corpo
  xp int default 0,
  last_seen timestamptz
)

-- Progresso por cidade
city_progress (
  player_id text references players,
  city_id text,
  correct int default 0,
  total_seen int default 0,
  completed bool default false,
  primary key (player_id, city_id)
)

-- Perguntas já vistas (anti-repetição do quiz)
question_history (
  player_id text,
  question_id text,
  hit bool,
  ts timestamptz
)

-- Memória do mundo: eventos que alimentam conversas
events (
  id bigint generated always as identity,
  kind text,      -- 'deu_mole' | 'city_completed' | 'rank_change'
                  -- | 'player_said' | 'absence' | 'streak'
  actor text,      -- quem protagonizou
  target text,     -- sobre quem (opcional)
  payload jsonb,    -- detalhes (pergunta errada, cidade, posição...)
  weight real,      -- relevância inicial (decai com o tempo)
  ts timestamptz
)

-- Feed de conversas (o que todo mundo vê)
feed (
  id bigint generated always as identity,
  speaker text,
  listener text,
  text text,
  kind text,       -- 'npc' | 'player' | 'deu_mole' | 'sistema'
  ts timestamptz
)

-- Conquistas desbloqueadas
achievements_unlocked (
  player_id text,
  achievement text,
  ts timestamptz,
  primary key (player_id, achievement)
)
```

Multiplayer em tempo real: canal Supabase Realtime `world` com presença (quem está online) e broadcast de posições a cada 200 ms (throttle). Jogadores offline viram NPCs controlados pelo brain; jogadores online são renderizados pela posição transmitida. Essa é a mágica: o MESMO personagem alterna entre "corpo NPC" e "corpo jogador" sem o mundo perceber.

Simulação: um cliente é eleito "diretor de cena" (o online há mais tempo). Só ele roda o DialogueEngine e publica no feed; todos os outros leem via Realtime. Evita falas duplicadas com N pessoas online.

## 5. NPCBrain — comportamento autônomo

Máquina de estados escolhida por utilidade (utility AI): a cada decisão, o NPC pontua as opções conforme personalidade, hora, proximidade dos outros e eventos recentes, e escolhe a melhor com um pouco de aleatoriedade.

Estados:

- **PASSEAR** — caminhar até um ponto de interesse da cidade atual
- **VIAJAR** — pegar a estrada para outra cidade
- **OBSERVAR** — parar diante de uma paisagem/atração, olhar, comentar
- **FORMAR_RODA** — aproximar-se de 1-3 NPCs próximos e abrir conversa
- **CONVERSAR** — trocar falas (2 a 6 turnos), com gestos
- **CELEBRAR** — após evento positivo próprio (dança, pulo)
- **ZOAR** — ir até o alvo de um deu_mole recente e provocar
- **DESCANSAR** — sentar num banco, tomar um "café"

Pesos por personalidade: o fofoqueiro tem utilidade alta para FORMAR_RODA e ZOAR; a competitiva, para VIAJAR (farmar presença nas cidades) e CELEBRAR; a veterana, para DESCANSAR e OBSERVAR. Amizades (SocialGraph) puxam NPCs amigos para a mesma cidade; rivalidades aumentam a chance de provocação quando se cruzam.

Resultado visível: o mapa nunca para. Sempre tem alguém andando, uma roda formada, alguém atravessando a estrada de Blumenau resmungando.

## 6. MemoryBank — memória com decaimento

Cada evento nasce com um peso e decai por meia-vida configurável:

- **deu_mole** — peso 1.0, meia-vida 3 dias (rende piada a semana toda)
- **city_completed** — peso 0.8, meia-vida 5 dias
- **rank_change (1º)** — peso 0.9, meia-vida 4 dias
- **player_said** — peso 0.7, meia-vida 7 dias (memória evolutiva)
- **absence (sumido)** — peso 0.6, renovado a cada dia ausente

O DialogueEngine sorteia assunto proporcionalmente ao peso atual. Um mico de ontem domina as conversas; o mesmo mico duas semanas depois praticamente sumiu — exatamente como memória de sala de vendas. Eventos player_said (coisas que o jogador digitou controlando o boneco) alimentam o estilo e os assuntos do NPC dele, cumprindo a memória evolutiva sem IA externa.

## 7. DialogueEngine — conversas sem API

Pipeline em 4 passos, tudo local:

1. **CONTEXTO** — quem está na roda, relação entre eles (amigo/rival), cidade atual, hora, ranking
2. **ASSUNTO** — sorteio ponderado no MemoryBank + assuntos favoritos do falante (fallback: cotidiano da cidade onde estão)
3. **TEMPLATE** — gramática combinatória: cada tema tem dezenas de esqueletos com slots [nome], [cidade], [pergunta], [posição], [desculpa], [exagero]...
4. **VOZ** — VoiceFilter aplica o jeito do personagem: bordões, diminutivos, ironia seca, "no meu tempo...", etc.

Anti-repetição: cada template usado entra em cooldown por par de personagens (não repete o mesmo esqueleto para a mesma dupla por N horas) e o histórico recente do feed é consultado antes de publicar.

Exemplo do mesmo assunto (Carla errou preço do bondinho) em três vozes:

> **Jefinho** → "Gente, vocês não sabem: a Carla vende viagem e achou que o bondinho era de graça. DE GRAÇA."
>
> **Marcelo** → "Relaxa Carla, eu fecho 3 contratos enquanto tu descobre o preço do bondinho. Última unidade, aliás."
>
> **Dona Rose** → "No meu tempo a gente decorava tabela no telefone fixo. Essa juventude aí, ó..."

Honestidade de engenharia: esse motor gera milhares de combinações e parece vivo por semanas, mas templates são finitos. Por isso existe uma porta opcional e desligável — `DialogueEngine.refillFromAI()` — que uma vez por semana (ou manualmente) pede a uma IA um lote de 100 novos templates por tema e os adiciona ao banco. Custo próximo de zero, uso offline total no dia a dia, e o banco de humor cresce para sempre. O jogo funciona 100% sem isso.

## 8. personagens.json — formato do elenco

```json
{
  "id": "jefinho",
  "nome": "Jefinho",
  "titulo": "O Fofoqueiro",
  "avatar": { "corpo": "baixo", "cor": "#2F8F5B", "acessorio": "bone" },
  "voz": {
    "bordoes": ["Gente, vocês não sabem...", "Tô sabendo de tudo"],
    "estilo": ["exagera numeros", "sussurra segredos", "pergunta retorica"]
  },
  "personalidade": {
    "competitividade": 0.4, "fofoca": 1.0, "humor": 0.9,
    "paciencia": 0.6, "ego": 0.5
  },
  "social": {
    "amigos": ["rose"], "rivais": ["marcelo"],
    "assuntos_favoritos": ["deu_mole", "sumidos", "vida_alheia"]
  }
}
```

Trocar o elenco fictício pelo real = editar este arquivo. Nada de código.

## 9. Progressão, conquistas e quiz

Quiz por visita: sorteia 5 perguntas do banco da cidade, priorizando as nunca vistas pelo jogador (question_history), misturando categorias (conhecimento, curiosidade, objeção de cliente, argumento de venda, dica prática). Perguntas podem ter foto. Cidade completa = X% do banco acertado; vira dourada, ganha selo, dispara fogos + confete, continua visitável mas sem XP novo.

Conquistas iniciais: Rei/Rainha de Balneário, Especialista em Bombinhas, Mestre do Beto Carrero, Veterano da Serra, Lenda de Santa Catarina (todas as cidades), Colecionador (todas as conquistas de um tipo), Explorador (visitou todos os pontos turísticos), Boca Fechada (zero deu mole numa cidade inteira), Maratonista (jogou 5 dias seguidos).

Deu Mole: erro em pergunta marcada como "nivel": "facil" gera evento de peso alto no MemoryBank e entra no painel. Erros em perguntas difíceis não humilham ninguém — são só XP perdido.

## 10. Roadmap de fases (para o Claude Code)

- **FASE 1 — Arquitetura** — este documento ✅
- **FASE 2 — Mundo 3D + movimentação** — terreno de SC, 6 zonas em blockout (formas simples), estradas, câmera 3ª pessoa, WASD + joystick mobile, um personagem placeholder andando/correndo
- **FASE 3 — NPCs autônomos** — Character definitivo low-poly, NPCBrain, SocialGraph, MemoryBank, DialogueEngine com 4 personagens fictícios, balões 3D
- **FASE 4 — Quiz + destinos** — AttractionPanel com fotos reais, bancos de perguntas (mín. 30 por cidade), QuizSystem, XP, Supabase completo, multiplayer Realtime, login PIN
- **FASE 5 — Ranking + conquistas** — pódio animado, medalhas, títulos, Deu Mole integrado às conversas
- **FASE 6 — Polimento** — música por cidade, sons, partículas, fogos, cidade dourada, otimização mobile, troca do elenco fictício pelo real

Cada fase termina com o jogo rodando e testável no GitHub Pages. Nunca acumular duas fases sem deploy.

## 11. Riscos e decisões conscientes

Assets 3D são o maior custo de tempo: usar packs low-poly CC0 (Kenney, Quaternius) como base e customizar cores/composição economiza semanas sem parecer genérico, porque a composição das cidades é única. Fotos: usar exclusivamente acervo próprio elimina risco de licença. Áudio: apenas fontes CC0/CC-BY com crédito. Performance mobile: orçamento de 100k triângulos em cena, sombras apenas do sol, LOD nas cidades distantes. PIN de 3 dígitos é segurança de brincadeira (adequado ao contexto: o pior ataque possível é um colega zoar pelo outro — o que, convenhamos, vira conteúdo pro jogo).
