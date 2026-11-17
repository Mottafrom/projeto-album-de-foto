# MEMORIES.

Galeria pública de lembranças. Só o admin faz login para subir/apagar fotos.

## Stack

- `frontend/` — Vite + React + Tailwind
- `backend/` — Fastify + better-auth + Zod + sharp + Swagger
- Prod: Postgres/Storage via `.env` (Supabase)
- Testes: Postgres no Docker (`--profile local`)

## Dev

1. `.env.example` → `.env` (Supabase + admin)
2. Bucket público `memories` no Storage
3. Rodar:

```bash
npm install
npm run db:migrate -w backend
npm run seed:admin -w backend
npm run dev
```

- Web http://localhost:5173 · API http://localhost:3001 · Docs http://localhost:3001/docs

## Testes e formato

```bash
npm test
npm run format          # Prettier
npm run format:check

docker compose --profile local up -d postgres
cp .env.test.example .env.test
npm run db:migrate -w backend
npm run test:db -w backend
```

## Docker

```bash
# api + web; banco do .env (Supabase)
docker compose up --build

# + Postgres local (LOCAL_DATABASE_URL=postgresql://memories:memories@postgres:5432/memories)
docker compose --profile local up --build
```

Web http://localhost:8080 · API http://localhost:3001

## Arquitetura

Route → Controller → Service → Domain → Repository (+ Zod).  
Detalhes: [AGENTS.md](AGENTS.md) · [docs/SPEC-memorias.md](docs/SPEC-memorias.md)

## Supabase Free

1 GB Storage · upload app 5 MB · projeto pode pausar após ~1 semana inativo
