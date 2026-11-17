# Spec: MEMORIES.

## Objective

Álbum web com galeria pública e gestão só do admin (Supabase Postgres + Storage).

## Commands

```bash
npm install && npm run dev
npm test
npm run test:db -w backend   # com Postgres do compose --profile local
npm run db:migrate -w backend && npm run seed:admin -w backend
```

## Structure

- App: `backend/src/modules/`, `frontend/src/{pages,components,api}`
- Testes: `backend/src/test/`, `frontend/src/test/`
- Camadas: Route → Controller → Service → Domain → Repository (+ Zod)

## Style

TypeScript estrito; código em inglês; docs em português; domínio com classes simples (POO, sem DDD).

## Testing

- Unitários: `npm test` (domain, service mockado, front)
- DB: `npm run test:db -w backend` (repository + Postgres Docker; Storage mockado)

## Boundaries

- **Always:** validar na borda; WebP no upload; secrets só no backend
- **Ask first:** schema SQL, deps novas, política do bucket
- **Never:** commit de `.env`; signup público; blob no Postgres

## Data

**photos:** `id` uuid, `title`, `storage_path`, `public_url`, `taken_on` date, `created_at`  
**auth:** tabelas better-auth; signup off; admin via seed  
**storage:** bucket `memories` (leitura pública; escrita via service role)

## API

| Method | Path              | Auth   | Behavior                        |
| ------ | ----------------- | ------ | ------------------------------- |
| \*     | `/api/auth/*`     | —      | better-auth                     |
| GET    | `/api/photos`     | public | lista por `taken_on` desc       |
| POST   | `/api/photos`     | admin  | ≤5 MB → WebP → Storage + insert |
| DELETE | `/api/photos/:id` | admin  | remove Storage + row            |

## Acceptance

1. Visitante vê fotos sem login
2. Signup público falha; login do admin seed ok
3. Upload ≤5 MB vira `.webp` e aparece na home
4. > 5 MB / tipo inválido rejeitado
5. Delete remove da galeria e do Storage
6. Visitante recebe 401/403 em POST/DELETE
