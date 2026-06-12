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
