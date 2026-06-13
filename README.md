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

---

## Metodologia de desenvolvimento

O grupo adotou uma metodologia *híbrida, baseada em práticas do Scrum*.

Foram utilizados ciclos curtos de desenvolvimento, definição de prioridades e acompanhamento das atividades. A organização das tarefas foi feita principalmente pelo *WhatsApp*, onde o grupo distribuía as responsabilidades e informava o andamento do projeto.

Essa abordagem foi escolhida por ser simples e flexível, permitindo alterar prioridades e corrigir problemas durante o desenvolvimento.

## Papéis do grupo

* *João Vitor:* responsável pela organização das tarefas, definição das prioridades e desenvolvimento.
* *Vinicius:* responsável pelo desenvolvimento das funcionalidades e correção de erros.
* *José:* responsável pelo desenvolvimento das funcionalidades e correção de erros.
* *Eduardo:* responsável pelos testes, validação das funcionalidades e apoio no desenvolvimento.

Apesar dessa divisão, todos os integrantes colaboraram em diferentes partes do projeto.

## Cadência e ferramentas

O trabalho foi dividido em ciclos. O grupo definia as tarefas prioritárias e distribuía as atividades entre os integrantes.

Durante a semana, eram realizadas reuniões curtas ou trocas de mensagens para acompanhar o andamento, identificar dificuldades e reorganizar as tarefas quando necessário.

As principais ferramentas utilizadas foram:

* *GitHub*, para versionamento do código, branches, commits e issues;
* *WhatsApp*, para comunicação, distribuição e acompanhamento das tarefas.

## Definição de pronto

Uma tarefa era considerada pronta quando:

* a funcionalidade estava implementada;
* os testes haviam sido realizados;
* os critérios definidos haviam sido atendidos;
* o código estava integrado ao projeto;
* a conclusão havia sido comunicada ao grupo.

## Métricas

O grupo acompanhou métricas simples, como:

* quantidade de issues concluídas por ciclo;
* quantidade de tarefas pendentes;
* comparação entre tarefas planejadas e entregues.

Essas informações ajudaram o grupo a identificar atrasos e melhorar a organização dos ciclos seguintes.

---

## Uso de IA

Durante o desenvolvimento do projeto, ferramentas de inteligencia artificial foram usadas como apoio para acelerar tarefas de implementacao, revisao e documentacao. As sugestoes geradas foram avaliadas pelo grupo antes de serem incorporadas ao codigo.

### Modelos utilizados

- **ChatGPT / Codex** - apoio em documentacao, organizacao do README, revisao de estrutura do frontend, analise de codigo e sugestoes de melhoria.
- **GitHub Copilot** - apoio pontual na escrita de trechos repetitivos de codigo, autocompletar testes e acelerar implementacoes em componentes e hooks.

### Para que foram usados

- Geracao e melhoria de documentacao do frontend.
- Brainstorming de estrutura para README, secoes tecnicas e checklist de execucao.
- Revisao de rotas, scripts, variaveis de ambiente e arquitetura do projeto.
- Sugestoes de refatoracao em componentes, hooks e organizacao por camadas.
- Apoio na criacao e ajuste de testes automatizados com Vitest e Testing Library.
- Debugging de inconsistencias entre documentacao e codigo, como rotas e estrategia de autenticacao.
- Conferencia de endpoints centralizados em `shared/constants/endpoints.ts`.
- Apoio para validar uso de `PrivateRoute`, `PublicRoute` e lazy loading no `AppRouter`.
- Revisao da estrategia de token no Axios, incluindo envio do header `Authorization`.
- Apoio na escrita de mocks e providers para testes de componentes autenticados.
- Revisao do fluxo de build e deploy com Docker e Jenkins.

### Exemplos de prompts usados

| Prompt | Uso | Resultado |
| --- | --- | --- |
| `analise as rotas do AppRouter e confira se o README lista todas as telas autenticadas` | Revisao tecnica | A resposta foi aceita com ajustes. Foram conferidas as rotas `/home`, `/guess`, `/groups/:pollCode` e `/profile`, e o texto foi ajustado para explicar `PrivateRoute` e `PublicRoute`. |
| `explique como o interceptor do Axios trata token, erro 401 e formato { error, data }` | Debugging e documentacao | A resposta foi aceita com ajustes. A explicacao foi usada na secao de integracao com a API, depois de conferir o arquivo `src/shared/api/api.ts`. |
| `crie uma seed para popular o banco com usuarios, boloes, participantes, jogos e palpites para testes locais` | Dados de desenvolvimento | A resposta foi ajustada. A IA ajudou a montar a ideia da seed, mas o grupo adaptou os dados ao schema real do backend, aos relacionamentos entre tabelas e ao fluxo de testes local. |
| `construa a base da tela de usuario com formulario de edicao de nome e email usando os componentes compartilhados` | Implementacao de UI | A resposta foi parcialmente aceita. A estrutura inicial da tela foi aproveitada, mas estilos, estados de loading, validacao e integracao com a mutation foram ajustados manualmente. |
| `implemente o hook de atualizacao de perfil usando React Query mutation e invalide os dados do usuario logado` | React Query | A resposta foi ajustada. A ideia da mutation foi aproveitada, mas as chaves de cache e o endpoint seguiram os arquivos reais de `entities/user` e `features/user`. |
| `corrija o redirecionamento de usuario autenticado e nao autenticado usando PrivateRoute e PublicRoute` | Roteamento e autenticacao | A resposta foi parcialmente aceita. A IA ajudou a revisar o fluxo, mas a decisao final de redirecionar para `/home` ou `/login` foi validada no codigo. |
| `crie testes para o modal de criacao de bolao usando Vitest e Testing Library` | Testes | A resposta foi ajustada. A IA ajudou com o esqueleto dos testes, mas seletores, mocks e expectativas foram revisados manualmente para bater com os componentes reais. |
| `revise este hook de mutation e sugira invalidacoes de queries apos criar, editar ou excluir um bolao` | React Query | A resposta foi ajustada. A IA sugeriu invalidacoes, mas as chaves finais seguiram os arquivos `api/query-keys.ts` ja existentes. |
| `adicione validacao com Zod no formulario de login e mostre mensagens de erro por campo` | Formularios e validacao | A resposta foi ajustada. A IA sugeriu o schema e o uso de `zodResolver`, mas o grupo adequou as mensagens e o comportamento visual ao padrao das telas. |
| `sugira uma organizacao baseada em Feature-Sliced Design para este frontend React` | Arquitetura e brainstorming | A resposta foi parcialmente aceita. A ideia de camadas foi usada como referencia, mas o grupo simplificou a estrutura para evitar complexidade desnecessaria. |

### Dinamica de uso

A IA foi usada principalmente de forma individual pelos integrantes durante tarefas especificas e tambem em momentos de pair programming, quando o grupo queria comparar alternativas antes de implementar. No frontend, o uso ficou concentrado em documentacao, apoio a testes, revisao de componentes e validacao da estrutura de pastas.

As respostas nao foram aplicadas automaticamente. O grupo revisou os trechos sugeridos, testou quando necessario e adaptou nomes, rotas, endpoints e regras de negocio ao padrao ja existente no projeto.

### O que nao foi feito por IA

- Definicao das regras de negocio principais do bolao.
- Modelagem das entidades do dominio, como usuario, bolao, jogo, palpite, convite e ranking.
- Decisoes finais de arquitetura entre frontend e backend.
- Validacao manual dos fluxos de login, cadastro, criacao de bolao, convites, palpites e ranking.
- Ajustes finos de layout, responsividade e experiencia de uso.
- Revisao final do codigo antes da entrega.
- Configuracao e execucao final do ambiente local, Docker e pipeline de CI/CD.

---

## Padroes de desenvolvimento

- Use TypeScript em todo codigo de aplicacao.
- Centralize rotas em `shared/constants/routes.ts`.
- Centralize endpoints em `shared/constants/endpoints.ts`.
- Use React Query para dados vindos da API.
- Use mutations para acoes de escrita.
- Evite chamadas HTTP diretamente em componentes.
- Prefira componentes reutilizaveis de `shared/ui`.
- Mantenha paginas focadas em composicao.
- Crie ou atualize testes ao alterar comportamento relevante.
- Use nomes de arquivos em `kebab-case`.