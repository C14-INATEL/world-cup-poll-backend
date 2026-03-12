# World Cup Poll Backend

Backend de um sistema de bolao para a Copa do Mundo, construido com Fastify, Drizzle ORM e PostgreSQL.

## Como rodar o projeto

### Pre-requisitos

- Node.js instalado
- Docker e Docker Compose instalados

### Passo a passo

1. Clone o repositorio e instale as dependencias:

```
npm install
```

2. Crie um arquivo `.env` na raiz do projeto com as seguintes variaveis:

```
DATABASE_URL=postgresql://postgres:example@localhost:5432/database
PORT=3000
```

3. Suba o banco de dados com Docker:

```
docker compose up -d
```

4. Execute as migrations para criar as tabelas no banco:

```
npx drizzle-kit migrate
```

5. Inicie o servidor em modo de desenvolvimento:

```
npm run dev
```

O servidor estara disponivel em `http://localhost:3000`.

### Scripts disponiveis

| Script             | Descricao                                  |
| ------------------ | ------------------------------------------ |
| `npm run dev`      | Inicia o servidor em modo de desenvolvimento |
| `npm run build`    | Compila o projeto TypeScript para JavaScript |
| `npm start`        | Inicia o servidor a partir do build compilado |
| `npm run format`   | Formata o codigo com Biome                   |
| `npm run format:check` | Verifica a formatacao sem alterar arquivos |

---

## Estrutura de pastas

```
src/
  controllers/       # Camada que recebe as requisicoes HTTP, valida os dados de entrada e chama os services
  db/
    schemas/         # Definicao das tabelas do banco de dados usando Drizzle ORM
    index.ts         # Instancia da conexao com o banco de dados
  errors/            # Classes de erro customizadas (BadRequest, Unauthorized, NotFound, etc.) e error handler global
  hooks/             # Hooks do Fastify (ex: formatador padrao de resposta)
  middlewares/       # Middlewares de autenticacao e outros
  repositories/
    interfaces/      # Interfaces que definem o contrato dos repositorios
    *.ts             # Implementacoes concretas que acessam o banco de dados via Drizzle
  routes/            # Definicao das rotas da aplicacao
  services/
    factories/       # Funcoes factory que montam os services com suas dependencias
    *.service.ts     # Camada de regras de negocio
  types/             # Definicoes de tipos e extensoes de tipos (ex: fastify.d.ts)
  utils/             # Utilitarios gerais (env, password hashing, build do servidor)
  logger.ts          # Configuracao do logger Winston
  index.ts           # Ponto de entrada da aplicacao
drizzle/             # Arquivos de migration SQL gerados pelo Drizzle Kit
```

A arquitetura segue o padrao de camadas: **Routes -> Controllers -> Services -> Repositories -> Banco de dados**. Cada camada tem uma responsabilidade clara e se comunica apenas com a camada imediatamente abaixo.

---

## Injecao de dependencia e testes

### Por que usar injecao de dependencia?

O projeto utiliza injecao de dependencia manual, onde cada classe recebe suas dependencias pelo construtor em vez de instancia-las internamente. Por exemplo, o `AuthService` nao cria seus proprios repositorios. Em vez disso, ele recebe o `UserService` e o `SessionService` como parametros no construtor:

```ts
export class AuthService {
  constructor(
    private userService: UserService,
    private sessionService: SessionService,
  ) {}
}
```

A montagem dessas dependencias acontece nas funcoes factory dentro de `src/services/factories/`. Cada factory e responsavel por instanciar o repositorio correto e injeta-lo no service correspondente:

```ts
export function makeAuthService() {
  const userService = makeUserService()
  const sessionService = makeSessionService()
  return new AuthService(userService, sessionService)
}
```

### Como isso ajuda nos testes

Quando as dependencias sao injetadas pelo construtor, podemos substituir qualquer uma delas por uma implementacao falsa (mock) durante os testes. Isso permite testar cada camada de forma isolada, sem depender do banco de dados real ou de servicos externos.

Os repositorios possuem interfaces definidas em `src/repositories/interfaces/`. Na hora de testar, basta criar um objeto que implemente a mesma interface e passa-lo no construtor:

```ts
const mockUserRepository = {
  create: async (data) => ({ id: 'uuid', ...data }),
  findByEmail: async (email) => null,
  findByEmailAndPassword: async () => null,
}

const userService = new UserService(mockUserRepository)
```

Dessa forma:

- Os testes unitarios rodam rapido porque nao acessam o banco de dados.
- Cada teste controla exatamente o que as dependencias retornam, facilitando a cobertura de cenarios de sucesso e erro.
- Se a implementacao do repositorio mudar (por exemplo, trocar o Drizzle por outro ORM), os testes dos services continuam funcionando sem alteracao.

---

## Geracao e execucao de migrations

O projeto usa o Drizzle Kit para gerar e executar migrations a partir dos schemas definidos em `src/db/schemas/`.

### Gerar uma nova migration

Quando voce alterar algum schema (adicionar tabela, coluna, etc.), execute:

```
npx drizzle-kit generate
```

Isso compara o estado atual dos schemas com o ultimo snapshot e gera um novo arquivo `.sql` dentro da pasta `drizzle/`.

Voce tambem pode dar um nome customizado para a migration:

```
npx drizzle-kit generate --name=nome-da-migration
```

### Aplicar as migrations no banco

Para executar todas as migrations pendentes no banco de dados:

```
npx drizzle-kit migrate
```

### Configuracao

A configuracao do Drizzle Kit esta no arquivo `drizzle.config.ts` na raiz do projeto. Ele aponta para os schemas em `./src/db/schemas` e gera as migrations na pasta `./drizzle`.

---

## Estrutura do banco de dados

O banco de dados PostgreSQL possui 6 tabelas. Todas utilizam UUID como chave primaria com geracao automatica.

### Tabela `user`

Armazena os usuarios do sistema.

### Tabela `user_sessions`

Armazena as sessoes de autenticacao dos usuarios. Cada sessao tem um token unico e uma data de expiracao.

### Tabela `poll`

Representa um bolao criado por um usuario.

### Tabela `participant`

Associa um usuario a um bolao. Um usuario pode participar de varios boloes.

### Tabela `game`

Representa uma partida entre duas selecoes.

### Tabela `guess`

Armazena os palpites dos participantes para cada partida.

### Relacionamentos

```
user 1---N user_sessions    (um usuario pode ter varias sessoes)
user 1---N poll             (um usuario pode criar varios boloes)
user 1---N participant      (um usuario pode participar de varios boloes)
poll 1---N participant      (um bolao pode ter varios participantes)
game 1---N guess            (uma partida pode ter varios palpites)
```
