# Quickstart: Sliminject Dashboard

**Date**: 2026-03-14

---

## Prerequisites

- Node 20+
- A Supabase project (free tier is fine)
- `pnpm` or `npm`

---

## Setup

```bash
cd prototypes/sliminject
npm install
```

Copy the environment template and fill in your Supabase credentials:

```bash
cp .env.example .env
```

`.env` requires:
```
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
```

Run database migrations (requires Supabase CLI):

```bash
supabase db push
```

---

## Development

```bash
npm run dev
```

Opens at `http://localhost:5173`.

---

## Demo Accounts

Seed the database with demo data (fictional patients only):

```bash
npm run seed
```

This creates:
- `dokter@demo.nl` / `demo1234` — Doctor account with 3 demo patients
- `patient@demo.nl` / `demo1234` — Patient account assigned to the demo doctor

---

## Testing

```bash
npm run test
```

---

## Build

```bash
npm run build
```

Output goes to `prototypes/sliminject/dist/`. The main Jekyll site does not depend on this output.
