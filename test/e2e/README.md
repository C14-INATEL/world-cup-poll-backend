# E2E Tests (End-to-End)

Testes que validam **fluxos completos** da aplicação, testando endpoints HTTP reais com autenticação e regras de negócio.

## 📁 Estrutura

```
test/e2e/
  ├── helpers/
  │   └── setup-e2e.ts       # Inicializa app + DB para testes
  ├── auth/
  │   └── auth-flow.spec.ts  # Testes de registro, login, logout
  ├── poll/
  │   └── poll-flow.spec.ts  # Testes de criar/listar/deletar polls
  └── voting/
      └── voting-flow.spec.ts # Testes de convite, votação e ranking
```

## 🚀 Como Rodar

```bash
# Apenas E2E tests
npm run test:e2e

# Unit tests
npm run test:unit

# Integration tests (services)
npm run test:integration

# Todos os testes
npm run test:all

# Com cobertura
npm run coverage
```

## ✅ O que é Testado

### Auth Flow
- ✅ Registrar novo usuário
- ✅ Evitar emails duplicados
- ✅ Login com credenciais corretas
- ✅ Falha com senha incorreta
- ✅ Falha com usuário inexistente
- ✅ Logout invalida session

### Poll Flow
- ✅ Criar poll com código único
- ✅ Listar polls do usuário
- ✅ Deletar poll (apenas owner)
- ✅ Impedir acesso não autorizado

### Voting Flow (Jornada Completa)
- ✅ Owner cria poll
- ✅ Owner convida players
- ✅ Players entram na poll
- ✅ Players fazem palpites (guesses)
- ✅ Ver ranking em tempo real
- ✅ Evitar palpites duplicados

## 🔧 Detalhes Técnicos

### Setup

Cada teste E2E:
1. Inicia container PostgreSQL isolado (Testcontainers)
2. Roda migrations automaticamente
3. Cria instância Fastify limpa
4. Limpa banco após cada teste

```typescript
beforeAll(async () => {
  setup = await setupE2E() // Inicia app + DB
})

afterEach(async () => {
  await truncateTables(db) // Limpa entre testes
})
```

### Requisições HTTP

Usa `app.inject()` do Fastify (não precisa de porta):

```typescript
const response = await makeRequest(setup.app, {
  method: 'POST',
  url: '/auth/register',
  payload: { email, password, name },
})

expect(response.statusCode).toBe(201)
expect(response.body.user.email).toBe(email)
```

### Autenticação

JWT token na header:

```typescript
headers: {
  authorization: `Bearer ${sessionToken}`
}
```

## 📝 Exemplo de Teste

```typescript
it('should create a poll successfully', async () => {
  const response = await makeRequest(setup.app, {
    method: 'POST',
    url: '/poll',
    payload: {
      title: 'My Poll',
      code: 'POLL001',
    },
    headers: {
      authorization: `Bearer ${userToken}`,
    },
  })

  expect(response.statusCode).toBe(201)
  expect(response.body.title).toBe('My Poll')
})
```

## 🆕 Adicionando Novos Testes

1. Crie arquivo em `test/e2e/{feature}/`
2. Use `setupE2E()` no `beforeAll`
3. Use `makeRequest()` para chamar endpoints
4. Use `teardownE2E()` no `afterAll`

```typescript
import { setupE2E, makeRequest, teardownE2E } from '../helpers/setup-e2e'

describe('E2E - New Feature', () => {
  let setup: E2ETestSetup

  beforeAll(async () => {
    setup = await setupE2E()
  })

  // seus testes aqui

  afterAll(async () => {
    await teardownE2E(setup)
  })
})
```

## ⏱️ Timeout

- **Timeout padrão**: 120 segundos (suficiente para Docker)
- **Pode ajustar** em `vitest.config.ts` se necessário

## 📊 Próximas Melhorias

- [ ] Adicionar testes de rate limiting
- [ ] Testes de validação de entrada (edge cases)
- [ ] Testes de permissões granulares
- [ ] Testes de performance/carga
- [ ] Testes de resiliência (retry)
