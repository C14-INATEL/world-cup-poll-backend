# World Cup Poll Backend

Backend de um sistema de bolão da Copa do Mundo, construído com Node.js, TypeScript, Fastify, Drizzle ORM e PostgreSQL.

## Instalação

Instale as dependências do projeto:

```bash
npm install
```

Copie o arquivo de variáveis de ambiente:

```bash
cp .env.example .env
```

Preencha o `.env` com os dados da aplicação, do banco PostgreSQL e a chave da API de futebol.

Suba o banco local com Docker:

```bash
docker compose up -d db
```

Execute as migrations do banco:

```bash
npx drizzle-kit migrate
```

## Execução

Para rodar a API em desenvolvimento:

```bash
npm run dev
```

A API ficará disponível em `http://localhost:3333`, ou na porta configurada em `PORT`.

Para executar a stack completa com Docker Compose:

```bash
docker compose up -d
```

Esse comando sobe os serviços definidos no `docker-compose.yml`, incluindo aplicação, banco de dados e proxy.

Para gerar o build de produção:

```bash
npm run build
```

Para iniciar a aplicação a partir do build:

```bash
npm run start
```

## Uso

Verifique se a API está ativa:

```bash
curl http://localhost:3333/health
```

Crie um usuário:

```bash
curl -X POST http://localhost:3333/auth/register \
  -H "Content-Type: application/json" \
  -d '{"name":"João","email":"joao@example.com","password":"123456"}'
```

Faça login:

```bash
curl -X POST http://localhost:3333/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"joao@example.com","password":"123456"}'
```

Após o login, use o token retornado no cabeçalho das requisições protegidas:

```bash
curl http://localhost:3333/me \
  -H "Authorization: Bearer SEU_TOKEN"
```

As demais operações da API seguem o mesmo padrão: envie os dados em JSON quando necessário e informe o token de autenticação nas rotas protegidas.

## Funcionalidades

- Cadastro, login, logout e autenticação de usuários.
- Gerenciamento de perfil do usuário.
- Criação, edição, exclusão, busca e entrada em bolões.
- Convites para participação em bolões.
- Listagem de jogos da Copa do Mundo.
- Registro e atualização de palpites por jogo.
- Cálculo e consulta de ranking dos participantes.
- Atualização de jogos por job e script de seed.


# Histórias de Usuário 

## US-01 — Registro de Usuário

**Prioridade:** Alta | **Status:** Entregue

**História:**
> Como **visitante**, eu quero **criar uma conta com nome, e-mail e senha** para que **eu possa acessar o sistema e participar de bolões**.

### Critérios de Aceitação

**Scenario 1: Registro bem-sucedido**
```gherkin
Given  que nenhuma conta existe com o e-mail informado
When   o usuário submete nome, e-mail válido e senha
Then   a conta é criada
And    o sistema retorna os dados do perfil do novo usuário
```

**Scenario 2: E-mail já cadastrado**
```gherkin
Given  que já existe uma conta com o e-mail informado
When   o usuário tenta se registrar com o mesmo e-mail
Then   o sistema retorna erro de conflito (UniqueConstraintError)
And    nenhum novo registro é criado
```

**Scenario 3: Dados inválidos**
```gherkin
Given  que o usuário submete um e-mail sem formato válido
When   a requisição chega ao servidor
Then   o sistema retorna erro de validação (400 Bad Request)
And    nenhum registro é criado no banco de dados
```

### Rastreabilidade
- **Módulo:** `src/modules/auth/services/auth.service.ts`
- **Branch:** `feat/auth`
- **Teste:** `test/integration/auth/auth.spec.ts` → `it('should register successfully')`

---

## US-02 — Login e Sessão

**Prioridade:** Alta | **Status:** Entregue

**História:**
> Como **usuário cadastrado**, eu quero **fazer login com e-mail e senha** para que **eu receba uma sessão autenticada e possa acessar os recursos protegidos da aplicação**.

### Critérios de Aceitação

**Scenario 1: Login bem-sucedido**
```gherkin
Given  que existe um usuário com e-mail "john@email.com" e senha "123456"
When   o usuário envia essas credenciais para POST /auth/login
Then   o servidor retorna os dados do usuário
And    retorna uma sessão válida associada ao usuário
```

**Scenario 2: Senha incorreta**
```gherkin
Given  que o usuário existe no sistema
When   submete uma senha incorreta
Then   o servidor retorna UnauthorizedError (401)
And    nenhuma sessão é criada
```

**Scenario 3: Acesso a rota protegida sem sessão**
```gherkin
Given  que o usuário não está autenticado (sem token de sessão)
When   tenta acessar qualquer rota que exige autenticação
Then   o servidor retorna 401 Unauthorized
```

### Rastreabilidade
- **Módulo:** `src/modules/auth/services/auth.service.ts`
- **Branch:** `feat/auth`
- **Teste:** `test/integration/auth/auth.spec.ts` → `it('should login successfully')`

---

## US-03 — Criar e Gerenciar Bolão

**Prioridade:** Alta | **Status:** Entregue

**História:**
> Como **usuário autenticado**, eu quero **criar um bolão com título e código único** para que **eu possa convidar amigos e competir em grupo nos palpites da Copa**.

### Critérios de Aceitação

**Scenario 1: Criação bem-sucedida**
```gherkin
Given  que o usuário está autenticado
When   cria um bolão informando título e código únicos
Then   o bolão é criado com sucesso
And    o usuário criador é automaticamente adicionado como participante e dono
```

**Scenario 2: Código duplicado**
```gherkin
Given  que já existe um bolão com o código "COPA2026"
When   outro usuário tenta criar um bolão com o mesmo código
Then   o sistema retorna BadRequestError "Já existe um bolão com este código"
```

**Scenario 3: Editar título do bolão**
```gherkin
Given  que o usuário é dono do bolão
When   aciona a edição enviando um novo título
Then   o bolão é atualizado com o novo título
```

**Scenario 4: Excluir bolão sem palpites**
```gherkin
Given  que o dono possui um bolão sem nenhum palpite registrado
When   aciona a exclusão do bolão
Then   o bolão é removido com sucesso
```

**Scenario 5: Excluir bolão com palpites**
```gherkin
Given  que o bolão já possui palpites de participantes
When   o dono tenta excluí-lo
Then   o sistema retorna BadRequestError "Não é possível excluir bolão com palpites"
```

**Scenario 6: Não-dono tenta editar ou excluir**
```gherkin
Given  que o usuário é participante mas não é dono do bolão
When   tenta editar o título ou excluir o bolão
Then   o sistema retorna UnauthorizedError "Apenas o dono pode editar/excluir o bolão"
```

### Rastreabilidade
- **Módulo:** `src/modules/poll/services/poll.service.ts`
- **Branch:** `feat/poll`
- **Teste:** `test/unit/poll.service.spec.ts`

---

## US-04 — Entrar em Bolão por Código

**Prioridade:** Alta | **Status:** Entregue

**História:**
> Como **usuário autenticado**, eu quero **entrar em um bolão existente usando um código** para que **eu possa competir com pessoas que me convidaram**.

### Critérios de Aceitação

**Scenario 1: Entrada bem-sucedida**
```gherkin
Given  que existe um bolão com código "COPA2026"
And    o usuário ainda não é participante desse bolão
When   submete o código para POST /polls/join
Then   o usuário é adicionado como participante
And    os dados do bolão são retornados
```

**Scenario 2: Bolão não encontrado**
```gherkin
Given  que o código "INEXISTENTE" não corresponde a nenhum bolão
When   o usuário tenta entrar com esse código
Then   o sistema retorna NotFoundError "Bolão não encontrado"
```

**Scenario 3: Usuário já participa do bolão**
```gherkin
Given  que o usuário já é participante do bolão "COPA2026"
When   tenta entrar novamente com o mesmo código
Then   o sistema retorna BadRequestError "Você já participa deste grupo"
```

### Rastreabilidade
- **Módulo:** `src/modules/poll/services/poll.service.ts`
- **Branch:** `feat/poll`
- **Teste:** `test/unit/poll.service.spec.ts` → `describe('joinByCode')`

---

## US-05 — Fazer Palpite em Jogo

**Prioridade:** Alta | **Status:** Entregue

**História:**
> Como **participante de um bolão**, eu quero **registrar meu palpite de placar para um jogo** para que **eu possa acumular pontos se meu palpite estiver correto após o resultado**.

### Critérios de Aceitação

**Scenario 1: Palpite registrado com sucesso**
```gherkin
Given  que o usuário é participante do bolão
And    o jogo selecionado ainda não aconteceu
When   submete um palpite de 2x1 para o jogo
Then   o palpite é registrado e associado ao participante no bolão
```

**Scenario 2: Palpite após início do jogo**
```gherkin
Given  que a data do jogo já passou
When   o usuário tenta registrar um novo palpite para esse jogo
Then   o sistema retorna BadRequestError "Palpites fechados"
```

**Scenario 3: Editar palpite após início do jogo**
```gherkin
Given  que o usuário já possui um palpite registrado
And    a data do jogo já passou
When   tenta editar o palpite existente
Then   o sistema retorna BadRequestError "Palpites fechados"
```

**Scenario 4: Usuário não é participante do bolão**
```gherkin
Given  que o usuário não faz parte do bolão
When   tenta fazer um palpite nesse bolão
Then   o sistema retorna BadRequestError "Deve ser um participante válido"
```

**Scenario 5: Tentativa de alterar palpite de outro participante**
```gherkin
Given  que o palpite pertence a outro participante
When   o usuário tenta editá-lo
Then   o sistema retorna UnauthorizedError "Você não pode alterar este palpite"
```

### Rastreabilidade
- **Módulo:** `src/modules/guess/services/guess.service.ts`
- **Branch:** `feat/guess`
- **Teste:** `test/unit/guess.service.spec.ts` → `describe('create')` e `describe('update')`

---

## US-06 — Sistema de Pontuação

**Prioridade:** Alta | **Status:** Entregue

**História:**
> Como **participante de um bolão**, eu quero **ser pontuado automaticamente com base na precisão do meu palpite** para que **o ranking reflita corretamente quem acertou mais**.

### Critérios de Aceitação

**Scenario 1: Placar exato (5 pontos)**
```gherkin
Given  que o jogo terminou 2x1
And    o participante chutou exatamente 2x1
When   o sistema calcula a pontuação
Then   o participante recebe 5 pontos
```

**Scenario 2: Vencedor correto, placar errado (3 pontos)**
```gherkin
Given  que o jogo terminou 3x1
And    o participante chutou 2x0 (acertou quem venceu, errou o placar)
When   o sistema calcula a pontuação
Then   o participante recebe 3 pontos
```

**Scenario 3: Apenas um gol correto (1 ponto)**
```gherkin
Given  que o jogo terminou 2x1
And    o participante chutou 2x3 (acertou só os gols do primeiro time)
When   o sistema calcula a pontuação
Then   o participante recebe 1 ponto
```

**Scenario 4: Palpite totalmente errado (0 pontos)**
```gherkin
Given  que o jogo terminou 2x1
And    o participante chutou 0x3
When   o sistema calcula a pontuação
Then   o participante recebe 0 pontos
```

### Rastreabilidade
- **Módulo:** `src/core/utils/score.ts`
- **Branch:** `feat/guess` (cálculo embutido no fluxo de palpites)
- **Teste:** `test/unit/score.spec.ts`

---

## US-07 — Visualizar Ranking do Bolão

**Prioridade:** Média | **Status:** Entregue

**História:**
> Como **participante de um bolão**, eu quero **visualizar o ranking dos participantes ordenado por pontuação** para que **eu saiba minha posição em relação aos outros membros do grupo**.

### Critérios de Aceitação

**Scenario 1: Ranking exibido com sucesso**
```gherkin
Given  que o bolão tem participantes com palpites já pontuados
When   o usuário acessa o ranking do bolão
Then   a lista de participantes é retornada em ordem decrescente de pontos
And    cada entrada exibe o nome do participante e o total de pontos acumulados
```

**Scenario 2: Ranking de bolão sem palpites pontuados**
```gherkin
Given  que o bolão existe mas nenhum jogo foi finalizado ainda
When   o usuário acessa o ranking
Then   a lista é retornada com todos os participantes e pontuação zero
```

**Scenario 3: Usuário não participante tenta ver o ranking**
```gherkin
Given  que o usuário não faz parte do bolão
When   tenta acessar o ranking
Then   o sistema retorna UnauthorizedError
```

### Rastreabilidade
- **Módulo:** `src/modules/ranking/services/ranking.service.ts`
- **Branch:** `feat/ranking`
- **Teste:** `test/unit/ranking.service.spec.ts`
