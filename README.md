## Superhero List (MVVM) + Comparação com Radar

Este projeto agora inclui uma página que lista heróis da Superhero API pública:

- Base URL: https://akabab.github.io/superhero-api/api
- Rota principal: `/` (lista de heróis)
- Arquitetura: MVVM usando Pinia como ViewModel, serviço HTTP tipado e modelos TypeScript (sem `any`).

Estrutura relevante:

- `src/models/superhero.ts` — Interfaces completas tipadas para as respostas da API
- `src/services/superheroApi.ts` — Serviço HTTP tipado (usando Axios) para `/all.json` e `/id/:id.json`
- `src/lib/http.ts` — Cliente Axios configurado com baseURL, headers e timeout
- `src/stores/heroes.ts` — Store Pinia (ViewModel) com estado `items`, `loading`, `error` e ação `fetchAll`
- `src/views/HeroesListView.vue` — View que consome o ViewModel e exibe grid de heróis
- `src/views/HeroDetailView.vue` — View de detalhes, carregada sob demanda, que busca dados por ID
- `src/router/index.ts` — Rotas `/` (lista), `/heroes/:id` (detalhe) e `/compare` (comparação)

Estados tratados: carregamento, erro com retry e vazio. Imagens são carregadas de forma preguiçosa (lazy) e os tipos cobrem todo o contrato da API.

### Paginação e UI

- Paginação no cliente (Pinia): `page`, `pageSize`, `totalPages`, `pagedItems`, com ações `setPage`, `nextPage`, `prevPage`, `setPageSize`.
- Controles de paginação na tela (primeiro/anterior/próximo/último) e seletor de itens por página (12/24/48/96).
- Cards estilizados com hover, badge do publisher, e chip de alinhamento (good/bad/neutral).

### Estilo com Tailwind

- A UI foi migrada para Tailwind CSS utilizando CDN para zero-config.
- Não é necessário instalar dependências extras: basta rodar `npm run dev`.
- Caso queira usar Tailwind localmente com build, substitua o CDN por setup tradicional; para o escopo deste projeto, o CDN atende bem.

### Busca

- Implementada busca por nome diretamente na lista de heróis.
- Campo de pesquisa no cabeçalho: digite para filtrar em tempo real (case-insensitive).
- A paginação passa a considerar somente os itens filtrados (mostra contagem de resultados e total de páginas após o filtro).
- Botão de limpar (×) aparece quando há texto no campo de busca.

### Tela de detalhes do herói

- Ao clicar em um card na lista, você é levado à rota `/heroes/:id`.
- A tela de detalhes carrega os dados do herói pelo endpoint `id/{id}.json` e exibe:
  - Imagem grande, nome, publisher e alinhamento;
  - Powerstats (intelligence, strength, speed, durability, power, combat);
  - Aparência, Biografia, Trabalho e Conexões.
- Há um botão "Voltar" para retornar à lista.

### Comparação lado a lado (`/compare`)

- Nova rota: `/compare?ids=1,2` (2 até 4 IDs) — compartilhe o link para discutir “quem venceria”.
- Picker com busca e autocomplete (debounce 250ms), Enter adiciona o primeiro resultado; atalho Ctrl+K foca o campo.
- Chips/badges dos selecionados com botão remover, limite 4, sem duplicados.
- Cartões lado a lado com imagem, nome, publisher, alignment e lista compacta de stats.
- Gráfico de radar (Chart.js + vue-chartjs) compara `intelligence`, `strength`, `speed`, `durability`, `power`, `combat` (0–100):
  - Legenda clicável; responsivo; escala 0–100; tema escuro.
  - Valores `null`/`NaN` tratados como 0, tooltip marca “(sem dado)”; segmento tracejado para pontos sem dado.
- Reordenação simples via botões/setas (esquerda/direita) nos cards; Delete/Backspace remove (acessível por teclado).
- Sincronização com URL: alterações de seleção atualizam `?ids=...` e, ao entrar na rota, os `ids` são parseados para preencher a seleção. IDs inválidos são ignorados e um aviso discreto é mostrado.

Arquivos principais desta feature:

- `src/views/CompareView.vue` — integra picker, cards, gráfico e tabela.
- `src/components/ComparePicker.vue` — busca + autocomplete + chips dos selecionados.
- `src/components/HeroCompareCard.vue` — cartão compacto de perfil + mini lista de stats e controles de ordem.
- `src/components/RadarPowerstatsChart.vue` — wrapper Chart.js (radar) configurado para tema escuro.
- `src/stores/compare.ts` — store Pinia para `selectedIds` e ações `add/remove/set/move`.
- `src/stores/heroes.ts` — agora mantém o cache completo (`Hero[]`) e expõe `byId`/`getByIds` para composição.

Exemplos de URLs:

- `/compare?ids=1,2` — compara os IDs 1 e 2.
- `/compare?ids=620,332,346,489` — compara 4 heróis.

Atalho “Comparar” na lista:

- Cada card da lista (`/`) possui um botão “Comparar” que navega para `/compare?ids=<id>`, acumulando com os já presentes (até 4).

### Dependências de gráficos

- `chart.js@^4` e `vue-chartjs@^5` foram adicionados. Rode `npm install` caso ainda não tenha instalado essas dependências.

### Requisitos de ambiente

- Node.js: ^20.19.0 ou >=22.12.0

Se ao rodar `npm run dev` você ver um erro como `SyntaxError: Unexpected token '.'` vindo do Vite, é sinal de Node antigo. Atualize seu Node (ex.: `nvm install 22 && nvm use 22`) e rode novamente. O comando `npm run dev` agora verifica a versão do Node e interrompe com uma mensagem clara caso esteja desatualizado.

### HTTP Client

- As requisições agora usam Axios. O cliente fica em `src/lib/http.ts` e respeita a variável `VITE_BASE_URL` quando definida (senão usa a URL pública padrão da API).
- Cancelamento é suportado via `AbortSignal` (Axios >=1.4).