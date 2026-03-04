# Story 1.2: Autenticacao Backend (JWT + Argon2)

Status: done

## Story

As a usuario,
I want fazer login com email e senha e receber tokens de acesso,
so that minhas rotas estejam protegidas e minha sessao persista entre visitas.

## Acceptance Criteria

1. **AC1:** POST `/api/auth/register` cria usuario com senha hashada em Argon2 e retorna access token + refresh token
2. **AC2:** POST `/api/auth/login` com email e senha validos retorna access token JWT (expiracao 15min) no body e refresh token (expiracao 7 dias) em cookie httpOnly
3. **AC3:** POST `/api/auth/refresh` com refresh token valido (cookie) retorna novo access token e novo refresh token
4. **AC4:** POST `/api/auth/logout` limpa o cookie de refresh token
5. **AC5:** Qualquer request para rotas protegidas sem token ou com token invalido retorna 401 Unauthorized
6. **AC6:** JWT Auth Guard esta configurado como guard global no NestJS (exceto rotas publicas decoradas com @Public)
7. **AC7:** ValidationPipe global esta ativo com class-validator, retornando erros no formato `{ statusCode, message, error }`
8. **AC8:** Exception filter global retorna erros no formato padrao `{ statusCode, message, error }` — nunca stack trace em producao
9. **AC9:** CORS esta configurado para aceitar apenas a origem do frontend via env `CORS_ORIGIN`
10. **AC10:** `/api/docs` serve documentacao Swagger/OpenAPI com os endpoints de auth documentados
11. **AC11:** Existe um seed script (`prisma/seed.ts`) que cria o usuario admin com senha hashada em Argon2

## Tasks / Subtasks

- [x] Task 1: Instalar dependencias de auth e infra (AC: 2, 7, 8, 10)
  - [x] 1.1: Instalar dependencias de producao: `@nestjs/passport passport passport-jwt @nestjs/jwt argon2 @nestjs/swagger class-validator class-transformer cookie-parser`
  - [x] 1.2: Instalar dependencias de dev: `@types/passport-jwt @types/cookie-parser`
  - [x] 1.3: Verificar instalacao sem erros e compatibilidade com NestJS v11

- [x] Task 2: Configurar infraestrutura global no main.ts (AC: 7, 8, 9, 10)
  - [x] 2.1: Configurar `ValidationPipe` global com `whitelist: true`, `forbidNonWhitelisted: true`, `transform: true`
  - [x] 2.2: Configurar `cookie-parser` middleware
  - [x] 2.3: Configurar CORS com `origin: process.env.CORS_ORIGIN`, `credentials: true`
  - [x] 2.4: Configurar Swagger com `DocumentBuilder` (titulo, descricao, versao, bearer auth) e servir em `/api/docs`
  - [x] 2.5: Criar `HttpExceptionFilter` global em `src/common/filters/http-exception.filter.ts` que retorna `{ statusCode, message, error }` — sem stack trace
  - [x] 2.6: Registrar exception filter global via `app.useGlobalFilters()`

- [x] Task 3: Criar modulo Auth com DTOs e estrategias JWT (AC: 2, 3, 5, 6)
  - [x] 3.1: Criar `src/modules/auth/dto/login.dto.ts` com `@IsEmail()` e `@IsString() @MinLength(8)` para password
  - [x] 3.2: Criar `src/modules/auth/dto/register.dto.ts` com `@IsEmail()` e `@IsString() @MinLength(8)` para password
  - [x] 3.3: Criar `src/modules/auth/dto/token-response.dto.ts` com `accessToken: string`
  - [x] 3.4: Criar `src/modules/auth/strategies/jwt.strategy.ts` — extrai token do header Authorization: Bearer, valida com JWT_SECRET, injeta user no request
  - [x] 3.5: Criar `src/modules/auth/strategies/jwt-refresh.strategy.ts` — extrai refresh token do cookie httpOnly, valida com JWT_REFRESH_SECRET
  - [x] 3.6: Criar decorator `@Public()` em `src/common/decorators/public.decorator.ts` usando `SetMetadata`
  - [x] 3.7: Criar `JwtAuthGuard` em `src/modules/auth/guards/jwt-auth.guard.ts` que respeita `@Public()` decorator via Reflector
  - [x] 3.8: Criar `src/modules/auth/auth.service.ts` com metodos: `register(dto)`, `login(dto)`, `refresh(userId)`, `hashPassword(password)`, `verifyPassword(hash, password)`, `generateTokens(userId, email)`
  - [x] 3.9: Criar `src/modules/auth/auth.controller.ts` com endpoints: POST `/auth/register`, POST `/auth/login`, POST `/auth/refresh`, POST `/auth/logout`
  - [x] 3.10: Criar `src/modules/auth/auth.module.ts` registrando JwtModule, PassportModule, strategies, service, controller
  - [x] 3.11: Registrar AuthModule no AppModule e configurar JwtAuthGuard como APP_GUARD global

- [x] Task 4: Escrever testes unitarios do AuthService (AC: 1, 2, 3, 4, 5)
  - [x] 4.1: Testar `register` — cria usuario com senha hashada (Argon2), retorna tokens
  - [x] 4.2: Testar `register` — rejeita email duplicado com ConflictException
  - [x] 4.3: Testar `login` — email e senha validos retorna access token + set refresh cookie
  - [x] 4.4: Testar `login` — email inexistente retorna UnauthorizedException
  - [x] 4.5: Testar `login` — senha incorreta retorna UnauthorizedException
  - [x] 4.6: Testar `refresh` — refresh token valido retorna novos tokens
  - [x] 4.7: Testar `generateTokens` — retorna accessToken string valida

- [x] Task 5: Escrever testes unitarios do AuthController (AC: 2, 3, 4, 10)
  - [x] 5.1: Testar POST `/auth/login` — retorna 200 com `{ accessToken }` e seta cookie `refreshToken`
  - [x] 5.2: Testar POST `/auth/register` — retorna 201 com `{ accessToken }` e seta cookie `refreshToken`
  - [x] 5.3: Testar POST `/auth/refresh` — retorna 200 com novo `{ accessToken }` e seta novo cookie
  - [x] 5.4: Testar POST `/auth/logout` — retorna 200 e limpa cookie `refreshToken`

- [x] Task 6: Escrever testes do HttpExceptionFilter e ValidationPipe (AC: 7, 8)
  - [x] 6.1: Testar HttpExceptionFilter retorna formato `{ statusCode, message, error }` para HttpException
  - [x] 6.2: Testar HttpExceptionFilter retorna 500 Internal Server Error para excecoes nao-HTTP
  - [x] 6.3: Testar ValidationPipe rejeita campos invalidos com mensagens descritivas

- [x] Task 7: Criar seed script com usuario admin (AC: 11)
  - [x] 7.1: Criar `prisma/seed.ts` que cria usuario admin com email e senha hashada em Argon2
  - [x] 7.2: Configurar seed command no `prisma.config.ts` (ja configurado como `tsx prisma/seed.ts`)
  - [x] 7.3: Executar `npx prisma db seed` e verificar usuario criado no banco

- [x] Task 8: Verificacao final e integracao (AC: 1-11)
  - [x] 8.1: Executar todos os testes — 15 passed, 0 failed
  - [x] 8.2: Verificar build TypeScript sem erros
  - [x] 8.3: Verificar Swagger acessivel em `/api/docs` com endpoints auth documentados
  - [x] 8.4: `.env.example` do backend ja continha todas as variaveis necessarias

## Dev Notes

### Stack e Versoes Confirmadas

- **@nestjs/passport:** 11.0.5 (compativel NestJS v11)
- **@nestjs/jwt:** 11.0.2 (jsonwebtoken v9, suporte a KeyObject)
- **passport:** 0.7.0 (req.logout requer callback)
- **passport-jwt:** 4.0.1 (jsonwebtoken v9)
- **argon2:** 0.44.0 (Node >= 18, nativo via node-addon-api)
- **@nestjs/swagger:** 11.2.6 (OpenAPI 3.1, compativel Express v5)
- **class-validator:** 0.14.3 (usar package standalone, NAO @nestjs/class-validator)
- **class-transformer:** 0.5.1 (usar package standalone)
- **cookie-parser:** 1.4.7 (compativel Express v5)

### Decisoes Tecnicas da Arquitetura

1. **JWT Dual Token Strategy:** Access token (15min) no body + Refresh token (7 dias) em cookie httpOnly
2. **Hashing:** Argon2 (vencedor Password Hashing Competition, resistente GPU)
3. **CORS:** Apenas origem do frontend via env `CORS_ORIGIN`, `credentials: true`
4. **Guard Global:** JwtAuthGuard como APP_GUARD, rotas publicas via `@Public()` decorator com SetMetadata + Reflector
5. **Formato de Erros:** `{ statusCode, message, error }` — exception filter global, sem stack trace em producao
6. **ValidationPipe:** whitelist + forbidNonWhitelisted + transform — class-validator standalone
7. **Swagger:** @nestjs/swagger com DocumentBuilder, bearer auth, endpoint `/api/docs`
8. **Seed:** `prisma/seed.ts` via `tsx`, comando ja configurado em `prisma.config.ts`

### Padroes de Naming (da Arquitetura)

- Arquivos: kebab-case (`auth.service.ts`, `jwt.strategy.ts`, `login.dto.ts`)
- Classes: PascalCase (`AuthService`, `JwtStrategy`, `LoginDto`)
- Endpoints: kebab-case (`/auth/login`, `/auth/refresh`)
- Constantes: UPPER_SNAKE_CASE (`JWT_EXPIRATION`)

### Dependencia da Story 1.1

- PrismaService e PrismaModule ja existem e estao funcionais
- Model User ja existe com id UUID, email unique, passwordHash, createdAt, updatedAt
- Health endpoint em `/api/health` ja funciona com global prefix `/api`
- Docker Compose dev com PostgreSQL ja configurado

### NestJS v11 — Notas Importantes

- Express v5 e default — wildcards em rotas usam `{*splat}` em vez de `*`
- ConfigService: valores internos tem precedencia sobre process.env (invertido vs v10)
- Lifecycle hooks OnModuleDestroy e OnApplicationShutdown executam em ordem reversa

### Project Structure Notes

- `src/modules/auth/` — module, controller, service, dto/, strategies/, guards/
- `src/common/filters/http-exception.filter.ts` — exception filter global
- `src/common/decorators/public.decorator.ts` — @Public() decorator
- `prisma/seed.ts` — seed script

### References

- [Source: architecture.md#Autenticacao e Seguranca]
- [Source: architecture.md#API e Comunicacao]
- [Source: architecture.md#Padroes de Implementacao]
- [Source: architecture.md#Padroes de Estrutura]
- [Source: epics.md#Story 1.2]
- [Source: NestJS Auth Docs](https://docs.nestjs.com/security/authentication)
- [Source: @nestjs/swagger](https://docs.nestjs.com/openapi/introduction)

## Dev Agent Record

### Agent Model Used

Claude Opus 4.6 (claude-opus-4-6)

### Debug Log References

- Jest `.js` extension resolution: ts-jest nao resolve imports com extensao `.js` (usado por nodenext). Fix: `moduleNameMapper: {"^(\\.{1,2}/.*)\\.js$": "$1"}` no jest config.
- Port 3000 conflict: Docker backend container ocupava a porta durante testes manuais. Fix: parar container antes de rodar `nest start` local.
- JWT secret fallback: Strategies e AuthService usavam `|| "dev-jwt-secret"` como fallback inseguro. Fix: validacao com throw se env vars nao definidas.

### Completion Notes List

- Task 1: Dependencias instaladas — @nestjs/passport 11.0.5, @nestjs/jwt 11.0.2, argon2 0.44.0, @nestjs/swagger 11.2.6, class-validator 0.14.3, class-transformer 0.5.1, cookie-parser 1.4.7
- Task 2: main.ts configurado com ValidationPipe, cookie-parser, CORS, Swagger, HttpExceptionFilter
- Task 3: AuthModule completo — DTOs, JWT/Refresh strategies, @Public decorator, JwtAuthGuard (APP_GUARD), AuthService, AuthController com 4 endpoints
- Task 4: 8 testes unitarios AuthService — register, login, refresh (+ user deleted), generateTokens + edge cases
- Task 5: 4 testes unitarios AuthController — login, register, refresh, logout
- Task 6: 3 testes HttpExceptionFilter + 4 testes LoginDto validation
- Task 7: Seed script criado e executado — admin@financas.local com Argon2 hash
- Task 8: 15 testes passando (4 suites), build OK, Swagger HTTP 200, validation 400, auth 401

### File List

- `backend/package.json` (modified — auth dependencies, jest moduleNameMapper)
- `backend/package-lock.json` (modified — auto-generated)
- `backend/src/main.ts` (modified — ValidationPipe, cookie-parser, CORS, Swagger, HttpExceptionFilter)
- `backend/src/app.module.ts` (modified — AuthModule import, APP_GUARD JwtAuthGuard)
- `backend/src/common/filters/http-exception.filter.ts` (new)
- `backend/src/common/filters/http-exception.filter.spec.ts` (new)
- `backend/src/common/decorators/public.decorator.ts` (new)
- `backend/src/modules/auth/auth.module.ts` (new)
- `backend/src/modules/auth/auth.controller.ts` (new)
- `backend/src/modules/auth/auth.controller.spec.ts` (new)
- `backend/src/modules/auth/auth.service.ts` (new)
- `backend/src/modules/auth/auth.service.spec.ts` (new)
- `backend/src/modules/auth/dto/login.dto.ts` (new)
- `backend/src/modules/auth/dto/login.dto.spec.ts` (new — added during code review, 4 class-validator tests)
- `backend/src/modules/auth/dto/register.dto.ts` (new)
- `backend/src/modules/auth/dto/token-response.dto.ts` (new)
- `backend/src/modules/auth/strategies/jwt.strategy.ts` (new)
- `backend/src/modules/auth/strategies/jwt-refresh.strategy.ts` (new)
- `backend/src/modules/auth/guards/jwt-auth.guard.ts` (new)
- `backend/src/modules/auth/guards/jwt-refresh.guard.ts` (new)
- `backend/src/modules/health/health.controller.ts` (modified — added @Public decorator)
- `backend/prisma/seed.ts` (new)

### Change Log

- 2026-02-25: Story 1.2 implemented — JWT dual token auth (access 15min + refresh 7d httpOnly cookie), Argon2 hashing, ValidationPipe global, HttpExceptionFilter, Swagger /api/docs, @Public decorator, JwtAuthGuard as APP_GUARD, seed script with admin user, 15 tests passing
- 2026-02-25: Code review fixes — H1: removed insecure JWT secret fallbacks (throw if env vars missing), H2: fixed inconsistent import extension in main.ts, M1: added login.dto.spec.ts with 4 validation tests, M2: added user existence check in refresh(). 20 tests passing (5 suites)
