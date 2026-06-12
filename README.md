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

## Uso de IA

Durante o desenvolvimento do backend, ferramentas de inteligência artificial foram usadas como apoio para acelerar tarefas de implementação, revisão, testes e documentação. As sugestões geradas foram analisadas pelo grupo antes de serem incorporadas ao projeto.

### Modelos utilizados

- **ChatGPT / Codex** - apoio em documentação, revisão de arquitetura, análise de services, repositories, testes e scripts de banco.
- **GitHub Copilot** - apoio pontual na escrita de trechos repetitivos, tipos, testes e estruturas de funções.

### Para que foram usados

- Brainstorming de estrutura dos módulos do backend.
- Apoio na criação de scripts de seed para desenvolvimento local.
- Revisão de regras de negócio em services.
- Apoio na escrita de testes unitários e de integração com Vitest.
- Sugestões de organização para repositories, factories e helpers de teste.
- Debugging de autenticação, sessões e fluxo de token.
- Revisão de migrations, schemas do Drizzle e relacionamentos entre tabelas.
- Apoio na documentação de comandos, execução local e pipeline de CI/CD.

### Exemplos de prompts usados

| Prompt | Uso | Resultado |
| --- | --- | --- |
| `crie uma seed para popular o banco com usuários, bolões, participantes, jogos finalizados, jogos futuros e palpites para testes locais` | Dados de desenvolvimento | A resposta foi ajustada. A IA ajudou a montar a estrutura inicial, mas o grupo adaptou os inserts ao schema real do Drizzle, aos relacionamentos entre tabelas e ao comando `npm run seed:dev`. |
| `melhore a seed de desenvolvimento para limpar as tabelas antes de inserir dados e retornar um usuário padrão para login` | Banco de dados e DX | A resposta foi parcialmente aceita. O grupo manteve a ideia de limpar dados com `TRUNCATE ... CASCADE`, mas revisou manualmente a ordem das tabelas e os dados de acesso. |
| `revise a regra de pontuação dos palpites e sugira testes para placar exato, vencedor correto, um gol correto e erro total` | Regra de negócio e testes | A resposta foi aceita com ajustes. Os cenários ajudaram a validar `calculateScore`, mas os casos finais foram escritos conforme a regra definida pelo grupo. |
| `crie testes unitários para o AuthService cobrindo login com sucesso, senha inválida, usuário inexistente e registro com criação de sessão` | Testes unitários | A resposta foi ajustada. A IA sugeriu os cenários e mocks, mas o grupo adaptou as dependências para `UserService`, `SessionService` e `UnitOfWorkLike`. |
| `organize os repositories do módulo de bolão para separar interface, implementação real e comportamento esperado nos testes` | Arquitetura | A resposta foi parcialmente aceita. A ideia de separar contrato e implementação foi aproveitada, mas a estrutura final seguiu o padrão já usado nos demais módulos. |
| `implemente a rota de ranking usando service e repository, calculando a pontuação dos participantes a partir dos palpites e resultados dos jogos` | Implementação de feature | A resposta foi ajustada. A IA ajudou no desenho da solução, mas a consulta final e o cálculo foram revisados manualmente para respeitar as entidades reais. |
| `adicione validação com Zod nas rotas de criação e atualização de bolão` | Validação de entrada | A resposta foi parcialmente aceita. Os schemas sugeridos foram usados como base, mas mensagens, campos obrigatórios e integração com controllers foram ajustados pelo grupo. |
| `crie testes de integração para autenticação usando banco de teste e factories` | Testes de integração | A resposta foi ajustada. A IA ajudou com o roteiro dos testes, mas o setup com helpers, truncamento de tabelas e factories foi adaptado ao ambiente real. |
| `revise o fluxo de sessão: login cria sessão, logout remove sessão e rotas protegidas validam o token` | Autenticação e debugging | A resposta foi aceita com ajustes. A análise ajudou a conferir o fluxo, mas a implementação final foi validada manualmente nos middlewares e services. |
| `explique o pipeline do Jenkins para o backend e confira se typecheck, testes, coverage, build e deploy estão contemplados` | CI/CD | A resposta foi parcialmente aceita. A IA ajudou a revisar as etapas, mas a configuração final do Jenkinsfile e os relatórios publicados foram definidos pelo grupo. |

### Dinâmica de uso

A IA foi usada tanto individualmente quanto em momentos de discussão em grupo, principalmente para comparar alternativas antes da implementação. No backend, o uso ficou concentrado em seed, testes, revisão de regras de negócio, autenticação, organização de módulos e documentação.

As respostas não foram aplicadas automaticamente. O grupo revisou os trechos sugeridos, executou testes quando necessário e ajustou o código ao padrão do projeto.

### O que não foi feito por IA

- Definição final das regras de negócio do bolão.
- Decisão final sobre entidades, tabelas, migrations e relacionamentos.
- Implementação final dos services, repositories e controllers.
- Validação manual dos fluxos de autenticação, criação de bolões, convites, palpites e ranking.
- Configuração final do ambiente local com Docker e PostgreSQL.
- Revisão final de testes unitários, testes de integração e cobertura.
- Configuração final do pipeline de CI/CD e deploy.
