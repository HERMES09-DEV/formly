# Formly — Multi-organization form builder

[![Live Demo](https://img.shields.io/badge/live%20demo-formly--workspace.vercel.app-black?style=for-the-badge&logo=vercel)](https://formly-workspace.vercel.app)
[![GitHub](https://img.shields.io/badge/GitHub-HERMES09--DEV%2Fformly-181717?style=for-the-badge&logo=github)](https://github.com/HERMES09-DEV/formly)
[![GitLab](https://img.shields.io/badge/GitLab-HERMES09--DEV%2Fformly-FC6D26?style=for-the-badge&logo=gitlab&logoColor=white)](https://gitlab.com/HERMES09-DEV/formly)

![Next.js](https://img.shields.io/badge/Next.js-15-black?style=flat-square&logo=nextdotjs)
![TypeScript](https://img.shields.io/badge/TypeScript-5.x-3178c6?style=flat-square&logo=typescript&logoColor=white)
![Tailwind CSS](https://img.shields.io/badge/Tailwind%20CSS-v3-38bdf8?style=flat-square&logo=tailwindcss&logoColor=white)
![Prisma](https://img.shields.io/badge/Prisma-v5-2d3748?style=flat-square&logo=prisma)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-Neon-4169e1?style=flat-square&logo=postgresql&logoColor=white)
![Auth.js](https://img.shields.io/badge/Auth.js-v5-000000?style=flat-square)
![Vercel](https://img.shields.io/badge/Vercel-deployed-000000?style=flat-square&logo=vercel)

A self-hostable, form builder for teams. Build forms with a drag-and-drop editor, share a public link, collect responses, and view analytics — all scoped per organization.

---

## Features

- **Drag-and-drop form builder** — sortable fields with debounced auto-save. No save button needed.
- **Multi-tenant organizations** — owner/member roles, email invites, per-org data isolation.
- **Six field types** — text, email, long text, dropdown, star rating, and file upload.
- **Conditional field logic** — show or hide fields based on previous answers with a plain-English builder.
- **Public shareable forms** — unauthenticated respondents, rate-limited by form + IP via Upstash Redis.
- **Response inbox** — paginated table, per-submission drawer, one-click CSV export.
- **Analytics dashboard** — submission trends (last 30 days) and optional field completion rates via Recharts.
- **Email invite flow** — invite members by email via Resend, token-bound to the invited address.
- **File uploads** — stored on Vercel Blob with size/type validation and unique paths.
- **Dark mode** — full dark/light toggle across dashboard and public forms.
- **Mobile responsive** — dashboard, builder, and public forms tested at 375px.
- **Google + GitHub OAuth** — sign in with either provider.

---

## Screenshots

![Builder](docs/screenshots/builder.png)
![Responses](docs/screenshots/responses.png)
![Public form](docs/screenshots/public-form.png)

---

## Tech stack

| Layer | Choice |
|---|---|
| Framework | Next.js 15 App Router + Server Actions |
| Language | TypeScript 5.x (strict mode) |
| Styling | Tailwind CSS v3 |
| ORM | Prisma v5 |
| Database | Neon — serverless PostgreSQL (AWS ap-southeast-1, Singapore) |
| Auth | Auth.js v5 — GitHub OAuth + Google OAuth |
| Drag-and-drop | dnd-kit |
| Charts | Recharts |
| Icons | Lucide React |
| Toasts | Sonner |
| Email | Resend |
| Rate limiting | Upstash Redis |
| File storage | Vercel Blob |
| Deploy | Vercel (auto-deploy on push to main) |

---

## Running locally

```bash
git clone https://github.com/HERMES09-DEV/formly.git
cd formly
npm install
cp .env.example .env.local
```

Fill in `.env.local` with your credentials (see `.env.example` for all required keys), then:

```bash
# Create the database (Laragon MySQL or point at Neon)
npx prisma migrate dev

# Seed demo data — 1 org, 2 forms, 15 submissions
npx tsx prisma/seed.ts

# Start dev server
npm run dev
```

Open `http://localhost:3000`.

### Required environment variables

| Key | Where to get it |
|---|---|
| `DATABASE_URL` | Neon dashboard → Connection string |
| `NEXTAUTH_SECRET` | `node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"` |
| `NEXTAUTH_URL` | `http://localhost:3000` for local |
| `AUTH_GITHUB_ID` | github.com/settings/developers → OAuth Apps |
| `AUTH_GITHUB_SECRET` | Same as above |
| `AUTH_GOOGLE_ID` | console.cloud.google.com → Credentials |
| `AUTH_GOOGLE_SECRET` | Same as above |
| `RESEND_API_KEY` | resend.com → API Keys |
| `UPSTASH_REDIS_REST_URL` | upstash.com → Redis database |
| `UPSTASH_REDIS_REST_TOKEN` | Same as above |
| `BLOB_READ_WRITE_TOKEN` | Vercel dashboard → Storage → Blob |

---

## Architecture

Formly uses Next.js 15 App Router with Server Components and Server Actions throughout — no separate API layer for authenticated mutations. The multi-tenant boundary is enforced at the Server Action level: every action reads `orgId` from the session, never from the request body.

```
app/
├── (auth)/         — login, onboarding
├── (dashboard)/    — forms, builder, responses, analytics, settings
├── f/[slug]/       — public submit page (no auth)
├── invite/[token]/ — org invite acceptance
└── api/
    ├── auth/       — Auth.js handlers
    └── submit/     — public form submission endpoint (rate limited)
```

See [AGENTS.md](./AGENTS.md) for the full project specification, architecture decisions, data model, and implementation conventions used by AI coding agents on this project.

---

## Changelog

### 1.0.1 — 2026-06-07
- Bound workspace invites to the invited email address.
- Added deterministic active-workspace persistence and workspace switching.
- Preserved historical responses when fields are removed.
- Made field reordering complete-set validated and transactional.
- Added file size and type validation, unique Blob paths, and Blob cleanup.
- Scoped public submission rate limits by form and IP address.
- Added focused regression tests for the v1.0.1 hardening rules.

### 1.0.0 — 2026-06-07
- Initial production release.
- Multi-tenant org system with owner/member roles and email invites.
- Drag-and-drop form builder with six field types and conditional logic.
- Public form submission with Upstash Redis rate limiting.
- Response inbox with CSV export and per-submission drawer.
- Analytics dashboard with Recharts submission trends and field completion rates.
- Google + GitHub OAuth via Auth.js v5.
- Dark mode and mobile-responsive layouts.
- Deployed on Vercel with Neon PostgreSQL, Upstash Redis, Vercel Blob, and Resend.

---

## License

MIT
