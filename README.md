# IconCoderz Backend

Modern Node.js + TypeScript + PostgreSQL + Prisma v7 backend.

## Prerequisites

- Node.js 18+
- pnpm
- PostgreSQL

## Setup

1. Install dependencies:

```bash
pnpm install
```

2. Configure environment variables:

- Copy `.env.example` to `.env`
- Update `DATABASE_URL` with your PostgreSQL connection string

3. Generate Prisma Client:

```bash
pnpm prisma:generate
```

4. Run migrations:

```bash
pnpm prisma:migrate
```

## Development

```bash
pnpm dev
```

## Build

```bash
pnpm build
```

## Production

```bash
pnpm start
```

## Database Management

- **Prisma Studio**: `pnpm prisma:studio`
- **Generate Client**: `pnpm prisma:generate`
- **Create Migration**: `pnpm prisma:migrate`

## Tech Stack

- **Runtime**: Node.js
- **Language**: TypeScript
- **Framework**: Express v5
- **Database**: PostgreSQL
- **ORM**: Prisma v7
- **Dev Tool**: tsx (for fast TypeScript execution)
