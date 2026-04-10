# World Cup Poll Backend

Backend de um sistema de bolão da Copa do Mundo, construído com Fastify, Drizzle ORM e PostgreSQL.

## Tecnologias

- Node.js
- TypeScript
- Fastify
- Drizzle ORM + Drizzle Kit
- PostgreSQL
- Vitest

## Requisitos

- Node.js 22+
- npm
- Docker e Docker Compose (para subir o banco local)

## Configuração de ambiente

1. Copie o arquivo de exemplo:

```bash
cp .env.example .env
```

2. Preencha as variáveis do `.env`:

```env
# App
PORT=3333
FRONTEND_URL=http://localhost:5173
FOOTBALL_API_KEY=your_football_api_key
JWT_SECRET=your_jwt_secret

# Database
POSTGRES_HOST=localhost
POSTGRES_USER=postgres
POSTGRES_PASSWORD=example
POSTGRES_DB=database
POSTGRES_PORT=5432

# URL usada pela aplicação e pelo Drizzle
DATABASE_URL=postgres://${POSTGRES_USER}:${POSTGRES_PASSWORD}@${POSTGRES_HOST}:${POSTGRES_PORT}/${POSTGRES_DB}
```

> Observação: `JWT_SECRET` é obrigatória para autenticação e não está no `.env.example` atual.

## Como rodar localmente (desenvolvimento)

1. Instale as dependências:

```bash
npm install
```

2. Suba o banco de dados:

```bash
docker compose up -d db
```

3. Execute as migrations:

```bash
npx drizzle-kit migrate
```

4. Inicie a aplicação em modo desenvolvimento:

```bash
npm run dev
```

A API fica disponível em `http://localhost:3333` (ou na porta configurada em `PORT`).

## Como rodar com Docker Compose (stack completa)

Com as variáveis de ambiente preenchidas no `.env`, rode:

```bash
docker compose up -d
```

Serviços definidos:

- `app`: aplicação Node.js
- `db`: PostgreSQL
- `nginx`: proxy reverso

## Scripts

| Script | Descrição |
| --- | --- |
| `npm run dev` | Sobe a API em modo desenvolvimento com watch |
| `npm run build` | Gera build de produção em `dist` |
| `npm run start` | Executa a API a partir do build |
| `npm run migrate:prod` | Executa migrações usando build de produção |
| `npm run seed:games` | Busca/atualiza jogos via script |
| `npm run test` | Executa testes com Vitest |
| `npm run coverage` | Executa testes com cobertura |
| `npm run format` | Aplica formatação e lint com Biome |
| `npm run format:check` | Verifica formatação/lint sem alterar arquivos |
| `npm run generate-migration -- --name=<nome>` | Gera migration SQL com nome customizado |

## Rotas principais

### Públicas

- `GET /` health check básico (`Hello World`)
- `POST /auth/register`
- `POST /auth/login`
- `POST /auth/logout`

### Protegidas (JWT)

- `GET /me`
- `POST /poll/create`
- `GET /poll/:code`
- `GET /polls/user`
- `POST /poll/invite`
- `GET /me/invites`
- `PATCH /invite/:id`
- `GET /games`
- `POST /polls/:pollId/guess/create`
- `PUT /polls/:pollId/guess/:guessId/update`
- `GET /guess/participant/:participantId`
- `GET /guess/game/:gameId`
- `GET /polls/:pollId/ranking`

## Arquitetura

O projeto segue padrão feature-first com camadas por módulo:

**Routes -> Controllers -> Services -> Repositories -> Banco de dados**

Pastas principais:

- `src/core`: middlewares, erros e utilitários compartilhados
- `src/infrastructure`: integrações técnicas (db, jobs, unit of work)
- `src/modules`: módulos de domínio (auth, poll, game, guess, invite, ranking, etc.)

Bootstrap da aplicação:

- `src/app.ts`: plugins, middlewares, rotas e agendamento de job
- `src/server.ts`: inicialização do servidor HTTP
- `src/config/env.ts`: validação das variáveis de ambiente com Zod

## Migrations

Gerar migration a partir dos schemas:

```bash
npx drizzle-kit generate
```

Gerar migration com nome:

```bash
npm run generate-migration -- --name=nome-da-migration
```

Aplicar migrações pendentes:

```bash
npx drizzle-kit migrate
```

## Testes

Executar testes unitários:

```bash
npm run test
```

Executar cobertura:

```bash
npm run coverage
```
