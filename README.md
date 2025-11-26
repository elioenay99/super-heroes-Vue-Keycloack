## Superhero List (MVVM)

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
- `src/router/index.ts` — Rota `/` apontando para a lista

Estados tratados: carregamento, erro com retry e vazio. Imagens são carregadas de forma preguiçosa (lazy) e os tipos cobrem todo o contrato da API.

### Paginação e UI

- Paginação no cliente (Pinia): `page`, `pageSize`, `totalPages`, `pagedItems`, com ações `setPage`, `nextPage`, `prevPage`, `setPageSize`.
- Controles de paginação na tela (primeiro/anterior/próximo/último) e seletor de itens por página (12/24/48/96).
- Cards estilizados com hover, badge do publisher, e chip de alinhamento (good/bad/neutral).

### Estilo com Tailwind

- A UI foi migrada para Tailwind CSS utilizando CDN para zero-config.
- Não é necessário instalar dependências extras: basta rodar `npm run dev`.
- Caso queira usar Tailwind localmente com build, substitua o CDN por setup tradicional; para o escopo deste projeto, o CDN atende bem.

### Requisitos de ambiente

- Node.js: ^20.19.0 ou >=22.12.0

Se ao rodar `npm run dev` você ver um erro como `SyntaxError: Unexpected token '.'` vindo do Vite, é sinal de Node antigo. Atualize seu Node (ex.: `nvm install 22 && nvm use 22`) e rode novamente. O comando `npm run dev` agora verifica a versão do Node e interrompe com uma mensagem clara caso esteja desatualizado.

### HTTP Client

- As requisições agora usam Axios. O cliente fica em `src/lib/http.ts` e respeita a variável `VITE_BASE_URL` quando definida (senão usa a URL pública padrão da API).
- Cancelamento é suportado via `AbortSignal` (Axios >=1.4).