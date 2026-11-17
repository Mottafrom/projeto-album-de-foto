# AGENTS.md — MEMORIES.

Álbum público: visitantes veem; só o admin autentica, sobe e apaga fotos.

## Stack

- `frontend/` — Vite, React, Tailwind
- `backend/` — Fastify, Zod, sharp, better-auth, `pg`, Supabase Storage, Swagger `/docs`
- Prod: `DATABASE_URL` do `.env` (Supabase)
- Testes/local: Postgres via `docker compose --profile local`

## Backend

```text
Route → Controller → Service → Domain → Repository
              ↑ Zod schemas
```

Código em `backend/src/modules/<feature>/`.  
Testes em `backend/src/test/` e `frontend/src/test/` (fora da app).

## Regras

- `GET /api/photos` público; signup desligado
- Upload ≤5 MB → WebP; metadados no Postgres; arquivos no Storage
- Secrets só no backend

## Comandos

```bash
npm install && npm run dev
npm test
npm run format
docker compose --profile local up -d postgres
npm run test:db -w backend
npm run db:migrate -w backend && npm run seed:admin -w backend
docker compose up --build
```

Swagger: `http://localhost:3001/docs`

## Boundaries

- **Always:** camadas; validar na borda; sem vazar service role
- **Ask first:** schema SQL, deps, bucket, limite de upload
- **Never:** Next.js neste MVP; signup público; Clean/Hexagonal completo; commit `.env`

## Git

- Trabalhar em **branch separada** (nunca commitar direto em `main` sem combinado)
- Commit **só com title** explicativo e enxuto — **nunca** body/descrição longa
- **Nunca** incluir trailer `Co-authored-by:` de qualquer agent nos commits
- **Push só depois do ok explícito** do humano — não publicar no remoto por conta própria

## Docs

`docs/intent/memorias.md` · `docs/SPEC-memorias.md` · `README.md`
