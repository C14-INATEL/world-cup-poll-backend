# World Cup Poll Backend

Backend de um sistema de bolão para a Copa do Mundo, construído com Fastify, Drizzle ORM e PostgreSQL.

## Como rodar o projeto

### Pré-requisitos

- Node.js instalado
- Docker e Docker Compose instalados

### Passo a passo

1. Clone o repositório e instale as dependências:

```
npm install
```

2. Crie um arquivo `.env` na raiz do projeto com as seguintes variáveis:

```
DATABASE_URL=postgresql://postgres:example@localhost:5432/database
PORT=3000
FRONTEND_URL=http://localhost:5173
FOOTBALL_API_KEY=your_api_key_here
```

Ou copie o arquivo `.env.example` para `.env` e edite as variáveis conforme necessário:

```
cp .env.example .env
```

3. Suba o banco de dados com Docker:

```
docker compose up -d db
```

4. Execute as migrations para criar as tabelas no banco:

```
npx drizzle-kit migrate
```

5. Inicie o servidor em modo de desenvolvimento:

```
npm run dev
```

### Scripts disponíveis

| Script | Descrição |
| --- | --- |
| `npm run dev` | Inicia o servidor em modo de desenvolvimento |
| `npm run build` | Compila o projeto TypeScript para JavaScript |
| `npm start` | Inicia o servidor a partir do build compilado |
| `npm run format` | Formata o código com Biome |
| `npm run format:check` | Verifica a formatação sem alterar arquivos |
| `npm run generate-migration` | Gera uma nova migration (com `--name`) |
| `npm run seed:games` | Executa seed/job para atualizar jogos via API |

---

## Estrutura de pastas

```
src/
  config/
    env.ts
  core/
    errors/
    middlewares/
    types/
    utils/
  infrastructure/
    db/
      schemas/
      index.ts
      unit-of-work.ts
    jobs/
  modules/
    auth/
    game/
    guess/
    invite/
    participant/
    poll/
    session/
    user/
  app.ts
  server.ts
  logger.ts
scripts/
  seed-games.ts
test/
  factories/
  mocks/
  unit/
drizzle/              # Arquivos de migration SQL gerados pelo Drizzle Kit
```

A arquitetura segue um padrão feature-first com camadas por módulo:

**Routes -> Controllers -> Services -> Repositories -> Banco de dados**

As responsabilidades compartilhadas de domínio técnico ficam distribuídas entre `src/core` (middlewares, errors, types e utils) e `src/infrastructure` (db e jobs), enquanto cada domínio de negócio fica em `src/modules/<feature>`.

O bootstrap da aplicação está separado em:

- `src/app.ts`: montagem do Fastify (plugins, hooks, rotas, cron)
- `src/server.ts`: ponto de entrada da aplicação (listen e tratamento de erros globais)
- `src/config/env.ts`: leitura e validação de variáveis de ambiente

---

## Injeção de dependência e testes

### Por que usar injeção de dependência?

O projeto utiliza injeção de dependência manual, onde cada classe recebe suas dependências pelo construtor em vez de instanciá-las internamente. Por exemplo, o `AuthService` não cria seus próprios repositórios. Em vez disso, ele recebe o `UserService` e o `SessionService` como parâmetros no construtor:

```ts
export class AuthService {
  constructor(
    private userService: UserService,
    private sessionService: SessionService,
  ) {}
}
```

A montagem dessas dependências acontece nas funções factory dentro de cada módulo, por exemplo `src/modules/auth/services/make-auth.service.ts`:

```ts
export function makeAuthService() {
  const userService = makeUserService()
  const sessionService = makeSessionService()
  return new AuthService(userService, sessionService)
}
```

### Como isso ajuda nos testes

Quando as dependências são injetadas pelo construtor, podemos substituir qualquer uma delas por uma implementação falsa (mock) durante os testes. Isso permite testar cada camada de forma isolada, sem depender do banco de dados real ou de serviços externos.

Os repositórios possuem interfaces co-localizadas dentro dos módulos (por exemplo `src/modules/user/repositories/user.interface.ts`). Na hora de testar, basta criar um objeto que implemente a mesma interface e passá-lo no construtor:

```ts
const mockUserRepository = {
  create: async (data) => ({ id: 'uuid', ...data }),
  findByEmail: async (email) => null,
  findByEmailAndPassword: async () => null,
}

const userService = new UserService(mockUserRepository)
```

Dessa forma:

- Os testes unitários rodam rápido porque não acessam o banco de dados.
- Cada teste controla exatamente o que as dependências retornam, facilitando a cobertura de cenários de sucesso e erro.
- Se a implementação do repositório mudar (por exemplo, trocar o Drizzle por outro ORM), os testes dos services continuam funcionando sem alteração.

---

## Geração e execução de migrations

O projeto usa o Drizzle Kit para gerar e executar migrations a partir dos schemas definidos em `src/infrastructure/db/schemas/`.

### Gerar uma nova migration

Quando você alterar algum schema (adicionar tabela, coluna, etc.), execute:

```
npx drizzle-kit generate
```

Isso compara o estado atual dos schemas com o último snapshot e gera um novo arquivo `.sql` dentro da pasta `drizzle/`.

Você também pode dar um nome customizado para a migration:

```
npx drizzle-kit generate --name=nome-da-migration
```

Ou via script com nome customizado:

```
npm run generate-migration -- --name=nome-da-migration
```

### Aplicar as migrations no banco

Para executar todas as migrations pendentes no banco de dados:

```
npx drizzle-kit migrate
```

### Configuração

A configuração do Drizzle Kit está no arquivo `drizzle.config.ts` na raiz do projeto. Ele aponta para os schemas em `./src/infrastructure/db/schemas` e gera as migrations na pasta `./drizzle`.

---

## Estrutura do banco de dados

O banco de dados PostgreSQL possui 7 tabelas. Todas utilizam UUID como chave primária com geração automática.

### Tabela `user`

Armazena os usuários do sistema.

### Tabela `user_sessions`

Armazena as sessões de autenticação dos usuários. Cada sessão tem um token único e uma data de expiração.

### Tabela `poll`

Representa um bolão criado por um usuário.

### Tabela `participant`

Associa um usuário a um bolão. Um usuário pode participar de vários bolões.

### Tabela `invite`

Armazena convites de participação em bolões com status (`pending`, `accepted`, `declined`) e data de expiração.

### Tabela `game`

Representa uma partida entre duas seleções.

### Tabela `guess`

Armazena os palpites dos participantes para cada partida.

## Regras de unicidade importantes

- `participant`: combinação única entre `userId` e `pollId`
- `guess`: combinação única entre `participantId` e `gameId`
- `poll`: `code` único
- `user`: `email` único

### Relacionamentos

```
user 1---N user_sessions    (um usuário pode ter várias sessões)
user 1---N poll             (um usuário pode criar vários bolões)
user 1---N participant      (um usuário pode participar de vários bolões)
poll 1---N participant      (um bolão pode ter vários participantes)
poll 1---N invite           (um bolão pode ter vários convites)
user 1---N invite           (um usuário pode receber e enviar convites)
game 1---N guess            (uma partida pode ter vários palpites)
participant 1---N guess     (um participante pode ter vários palpites)
```
