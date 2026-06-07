# Formly — A clean multi-tenant form builder.

[![Live demo](https://img.shields.io/badge/live%20demo-YOUR_VERCEL_URL-black?style=for-the-badge)](YOUR_VERCEL_URL)

![Next.js](https://img.shields.io/badge/Next.js-15-black?style=flat-square&logo=nextdotjs)
![TypeScript](https://img.shields.io/badge/TypeScript-5.x-3178c6?style=flat-square&logo=typescript&logoColor=white)
![Tailwind CSS](https://img.shields.io/badge/Tailwind%20CSS-v3-38bdf8?style=flat-square&logo=tailwindcss&logoColor=white)
![Prisma](https://img.shields.io/badge/Prisma-v5-2d3748?style=flat-square&logo=prisma)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-16-4169e1?style=flat-square&logo=postgresql&logoColor=white)
![Auth.js](https://img.shields.io/badge/Auth.js-v5-000000?style=flat-square)
![Vercel](https://img.shields.io/badge/Vercel-ready-000000?style=flat-square&logo=vercel)

## Features

- Drag-and-drop form builder with sortable fields and auto-saving field edits.
- Multi-tenant organizations with owner/member access controls.
- Public shareable form links for unauthenticated respondents.
- Response inbox with drawer details and CSV export.
- Form analytics with submission trends and optional field completion rates.
- Dark mode and responsive layouts for dashboard and public forms.

## Screenshots

![Builder screenshot placeholder](docs/screenshots/builder.png)

![Responses screenshot placeholder](docs/screenshots/responses.png)

![Public form screenshot placeholder](docs/screenshots/public-form.png)

## Running locally

```bash
git clone https://github.com/HERMES09-DEV/formly.git
cd formly
npm install
cp .env.example .env.local
```

Fill in `.env.local`, then prepare the database and demo data:

```bash
npx prisma migrate dev
npm run seed
npm run dev
```

Open `http://localhost:3000`.

## Architecture

Formly is built with Next.js 15 App Router, TypeScript, Tailwind CSS v3, Prisma v5, PostgreSQL, Auth.js v5, Recharts, Resend, Upstash Redis, and Vercel Blob.

See [AGENTS.md](./AGENTS.md) for the full project specification, architecture rules, data model, and implementation conventions.
