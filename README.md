<div align="center">

# Superhero Compare — Vue 3 + Vite + Pinia + Keycloak

Aplicação Vue para listar heróis da Superhero API, visualizar detalhes e comparar até 4 heróis em um gráfico de radar. A aplicação exige autenticação via Keycloak (SSO) e roda por padrão na porta 9100.

</div>

## Sumário

- Visão geral
- Principais recursos
- Stack e requisitos
- Começando (instalação e execução)
- Variáveis de ambiente (.env)
- Configuração do Keycloak
- Scripts disponíveis
- Estrutura do projeto
- Rotas e uso
- Build e deploy
- Testes, lint e format
- Solução de problemas (FAQ)
- Créditos e licença

## Visão geral

Este projeto é um SPA em Vue 3 que consome a Superhero API pública para listar heróis, exibir uma página de detalhes e comparar atributos (powerstats) entre heróis usando um gráfico de radar. A autenticação é feita com Keycloak (keycloak-js), e todas as rotas exigem que o usuário esteja autenticado.

- Base da API: https://akabab.github.io/superhero-api/api
- Porta de desenvolvimento: 9100 (Vite)
- Autenticação: Keycloak (fluxo OIDC com PKCE, check-sso, refresh automático)

## Principais recursos

- Lista de heróis com paginação no cliente, busca e UI em Tailwind (via CDN)
- Página de detalhes com informações completas do herói
- Comparação lado a lado de até 4 heróis com gráfico de radar (Chart.js + vue-chartjs)
- Sincronização de seleção com a URL (`/compare?ids=...`)
- Tratamento de estados (carregando, erro com retry, vazio) e imagens com lazy loading
- Tipos TypeScript completos para a API, sem `any`

### Detalhes funcionais

- Paginação: `page`, `pageSize`, `totalPages`, `pagedItems` + ações `setPage`, `nextPage`, `prevPage`, `setPageSize`
- Busca por nome (case-insensitive) com botão de limpar
- Cartões com hover, badge de publisher e chip de alinhamento (good/bad/neutral)
- Gráfico de radar com escala 0–100, tema escuro, tooltip ajustada e valores faltantes tratados como 0
- Comparação reordenável (setas) e removível (teclado: Delete/Backspace)

## Stack e requisitos

- Vue 3, Vite 7, TypeScript
- Pinia, Vue Router, @vueuse/head e @vueuse/router
- Tailwind via CDN (zero-config)
- Axios (HTTP), Chart.js 4, vue-chartjs 5
- Keycloak JS

Requisitos de ambiente:

- Node.js: ^20.19.0 ou >=22.12.0
- npm 9+ (ou compatível com a versão do Node)

Se ao rodar `npm run dev` você ver `SyntaxError: Unexpected token '.'` (do Vite), seu Node está desatualizado. Atualize (ex.: `nvm install 22 && nvm use 22`). O script `npm run dev` interrompe com uma mensagem clara quando detecta Node antigo.

## Começando

1. Clone o repositório
2. Instale as dependências:
   - `npm install`
3. Configure as variáveis de ambiente (veja a seção .env)
4. Inicie em modo desenvolvimento:
   - `npm run dev`
   - Acesse http://localhost:9100

Porta de desenvolvimento: definida em `vite.config.ts` como 9100 (`server.port: 9100` e `preview.port: 9100`) com `strictPort: true`.

## Variáveis de ambiente (.env)

Crie um arquivo `.env` na raiz (ou ajuste o existente) com as seguintes variáveis:

```
VITE_BASE_URL=https://akabab.github.io/superhero-api/api/
VITE_KEYCLOAK_REALM=<seu-realm>
VITE_KEYCLOAK_AUTH_URL=<sua-url-do-keycloak>        # ex.: https://auth.seudominio.com.br
VITE_KEYCLOAK_REDIRECT_URI=http://localhost:9100    # deve existir no cliente do Keycloak
VITE_KEYCLOAK_CLIENT_ID=<seu-client-id>
```

Observações:

- `VITE_BASE_URL` altera a base do cliente Axios (`src/lib/http.ts`). Se não definida, usa a URL pública da API.
- `VITE_KEYCLOAK_REDIRECT_URI` deve estar cadastrada em seu cliente no Keycloak e precisa incluir a página `silent-check-sso.html` (já presente em `public/`).
- Não commitar segredos. O Client ID não é segredo, mas mantenha boas práticas com .env.

## Configuração do Keycloak

No Keycloak, crie/configure um cliente para a aplicação web:

- Tipo de acesso: Público
- Habilitar PKCE (S256)
- Redirect URIs válidas (ambiente local):
  - `http://localhost:9100`
  - `http://localhost:9100/*`
- Web Origins:
  - `http://localhost:9100`
- Silent SSO:
  - Certifique-se de que `http://localhost:9100/silent-check-sso.html` está permitido

O app usa:

- `keycloak.init({ onLoad: 'check-sso', pkceMethod: 'S256', redirectUri, silentCheckSsoRedirectUri })`
- Guarda de rota global exigindo autenticação (ver `src/router/index.ts`)
- Refresh automático do token a cada 30s quando autenticado

Se você vir redirecionamentos em loop após o login, confirme que:

- A `redirectUri` do .env coincide exatamente com as URIs permitidas no cliente
- O hostname está correto (sem porta errada) e que não há subcaminho faltando (deploy com subpath exige atenção ao `BASE_URL` do Vite)

## Scripts disponíveis

- `npm run dev` — verifica versão do Node e inicia o Vite em modo dev
- `npm run build` — type-check + build
- `npm run preview` — pré-visualiza o build estático na porta 9100
- `npm run type-check` — checagem de tipos (vue-tsc)
- `npm run lint` — ESLint com fix e cache
- `npm run format` — Prettier (diretório `src/`)
- `npm run test` — executa testes (Vitest)
- `npm run test:watch` — executa testes em modo watch

## Estrutura do projeto

Arquivos e pastas principais:

- `index.html` — HTML raiz com import do Tailwind via CDN e montagem da SPA
- `src/main.ts` — bootstrap da aplicação (Pinia, Head, Router e init do Keycloak)
- `src/router/index.ts` — rotas `/`, `/heroes/:id`, `/compare` com guarda de autenticação
- `src/lib/keycloak.ts` — configuração/integração com Keycloak (login/logout/check-sso/refresh)
- `src/lib/http.ts` — cliente Axios configurável via `VITE_BASE_URL`
- `src/models/superhero.ts` — tipos completos da API
- `src/services/superheroApi.ts` — acesso tipado aos endpoints `/all.json` e `/id/:id.json`
- `src/stores/heroes.ts` — cache e estado de heróis (itens, loading, error) + helpers `byId`/`getByIds`
- `src/views/HeroesListView.vue` — grid de heróis com paginação e busca
- `src/views/HeroDetailView.vue` — detalhes do herói (imagem, stats, biografia, etc.)
- `src/views/CompareView.vue` — comparação lado a lado + gráfico de radar
- `src/components/ComparePicker.vue` — busca/autocomplete + chips de seleção
- `src/components/HeroCompareCard.vue` — cartão compacto de perfil + stats
- `src/components/RadarPowerstatsChart.vue` — gráfico de radar (Chart.js)
- `public/silent-check-sso.html` — suporte ao SSO silencioso do Keycloak

## Rotas e uso

- `/` — lista de heróis (com busca e paginação)
- `/heroes/:id` — detalhes do herói selecionado
- `/compare?ids=1,2` — compara heróis pelos IDs (aceita 2 a 4 IDs)

Na lista, há um atalho “Comparar” em cada card que navega para `/compare?ids=<id>` e acumula os IDs já escolhidos (até 4).

## Build e deploy

Build de produção:

```
npm run build
```

Pré-visualização do build:

```
npm run preview
```

Deploy estático (exemplos):

- GitHub Pages ou subcaminho: ajuste o `base` do Vite (ou `import.meta.env.BASE_URL`) se publicar em `/seu-repo/`. O router usa `createWebHistory(import.meta.env.BASE_URL)`.
- Vercel/Netlify: apenas faça deploy da pasta `dist`. Garanta que a URL pública final esteja cadastrada como Redirect URI/Web Origin no Keycloak.

## Testes, lint e format

- Testes: `npm run test` (Vitest) e `npm run test:watch`
- Lint: `npm run lint`
- Format: `npm run format`

## Solução de problemas (FAQ)

- Erro de Node/Vite com `Unexpected token '.'`:
  - Atualize o Node para >=20.19 ou >=22.12 e rode `npm run dev` novamente.
- Loop após login no Keycloak ou tela em branco:
  - Verifique as Redirect URIs e Web Origins no cliente do Keycloak (inclua `silent-check-sso.html`).
  - Confirme `VITE_KEYCLOAK_REDIRECT_URI` em `.env` e o host/porta corretos.
- Gráfico/estilos não aparecem:
  - Confirme `chart.js` e `vue-chartjs` instalados e import do Tailwind via CDN em `index.html`.
- Página `/compare` não carrega entrada de IDs:
  - Use `ids` separados por vírgula (`/compare?ids=1,2,3,4`). IDs inválidos são ignorados.

## Créditos e licença

- Dados fornecidos pela Superhero API: https://akabab.github.io/superhero-api/
- Este projeto utiliza bibliotecas open-source (Vue, Vite, Pinia, Axios, Chart.js, etc.).

Licença: defina a licença que preferir (ex.: MIT). Caso deseje contribuir, abra uma Issue ou Pull Request.