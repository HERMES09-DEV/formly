# AGENTS.md — Formly

This file is read by Codex (and any AI agent) before touching this codebase.
Follow every rule here. Do not deviate without explicit instruction.

---

## Project identity

**Formly** is a multi-tenant SaaS form builder built with Next.js 15 App Router,
TypeScript, Tailwind CSS v3, Prisma v5, PostgreSQL, and Auth.js v5.

Live URL: (add after deploy)
Repo: (https://github.com/HERMES09-DEV/formly.git)
Repo GitLab: (https://gitlab.com:HERMES09-DEV/formly.git)

---

## Stack — exact versions

| Layer | Choice |
|---|---|
| Framework | Next.js 15 (App Router only — no Pages Router) |
| Language | TypeScript 5.x — strict mode on |
| Styling | Tailwind CSS v3 — no inline styles except dynamic values |
| ORM | Prisma v5 + PostgreSQL |
| Auth | Auth.js v5 (`next-auth@beta`) |
| Validation | Zod — all user input, all Server Actions |
| Drag-and-drop | `@dnd-kit/core` + `@dnd-kit/sortable` |
| Charts | Recharts |
| Email | Resend (`resend` npm package) |
| Rate limiting | Upstash Redis (`@upstash/ratelimit` + `@upstash/redis`) |
| File storage | Vercel Blob (`@vercel/blob`) |
| Deploy | Vercel |

---

## Absolute rules — never break these

1. **No raw SQL.** All DB access goes through Prisma. No `$queryRaw` unless explicitly approved.
2. **No client-side orgId trust.** Every Server Action and API route must read `orgId` from the
   session, never from request body or query params.
3. **Auth check first.** Every Server Action starts with:
   ```ts
   const session = await auth();
   if (!session?.user) throw new Error("Unauthorized");
   ```
4. **Zod before Prisma.** Validate all inputs with a Zod schema before any DB call.
5. **No `any`.** TypeScript `any` is banned. Use `unknown` + type guards or proper types.
6. **Server Actions only for mutations.** No API routes for form CRUD, field CRUD, or
   submission writes. API routes are only for: `/api/submit/[formId]` (public POST) and
   `/api/auth/[...nextauth]`.
7. **Tenant isolation.** Every query that touches `Form`, `Field`, `Submission`, or `FieldAnswer`
   must include a `where: { orgId: session.user.orgId }` guard or equivalent join check.
8. **No `useEffect` for data fetching.** Use Server Components + `async/await` or
   `use server` actions. `useEffect` is only acceptable for DOM-side effects (focus, scroll, etc).

---

## File and folder structure

```
formly/
├── app/
│   ├── (auth)/
│   │   ├── login/page.tsx
│   │   └── onboarding/page.tsx
│   ├── (dashboard)/
│   │   ├── layout.tsx              ← sidebar + org switcher shell
│   │   ├── dashboard/page.tsx
│   │   ├── forms/
│   │   │   ├── page.tsx            ← form list
│   │   │   └── [formId]/
│   │   │       ├── page.tsx        ← builder
│   │   │       ├── responses/page.tsx
│   │   │       └── analytics/page.tsx
│   │   └── settings/
│   │       ├── page.tsx
│   │       └── members/page.tsx
│   ├── f/
│   │   └── [slug]/page.tsx         ← public submit page (no auth)
│   ├── invite/
│   │   └── [token]/page.tsx
│   ├── api/
│   │   ├── auth/[...nextauth]/route.ts
│   │   └── submit/[formId]/route.ts
│   └── layout.tsx
├── components/
│   ├── builder/
│   │   ├── FieldList.tsx           ← dnd-kit sortable list
│   │   ├── FieldItem.tsx
│   │   └── FieldEditor.tsx         ← right sidebar
│   ├── forms/
│   ├── responses/
│   ├── analytics/
│   └── ui/                         ← shared: Button, Input, Badge, Modal, etc.
├── lib/
│   ├── auth.ts                     ← Auth.js config
│   ├── prisma.ts                   ← singleton client
│   ├── validations/                ← all Zod schemas here
│   │   ├── form.ts
│   │   ├── field.ts
│   │   └── submission.ts
│   └── utils.ts
├── actions/
│   ├── form.ts                     ← createForm, updateForm, deleteForm, publishForm
│   ├── field.ts                    ← createField, updateField, deleteField, reorderFields
│   ├── submission.ts               ← (none — submit goes through API route)
│   ├── org.ts                      ← createOrg, inviteMember, removeMember
│   └── invite.ts                   ← acceptInvite
├── prisma/
│   ├── schema.prisma
│   └── seed.ts
├── middleware.ts
└── types/
    └── index.ts
```

---

## Prisma schema (authoritative)

```prisma
model Org {
  id        String      @id @default(cuid())
  name      String
  slug      String      @unique
  createdAt DateTime    @default(now())
  members   OrgMember[]
  forms     Form[]
  invites   Invite[]
  activeUsers User[]    @relation("ActiveOrg")
}

model OrgMember {
  id     String   @id @default(cuid())
  org    Org      @relation(fields: [orgId], references: [id], onDelete: Cascade)
  orgId  String
  user   User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  userId String
  role   Role     @default(MEMBER)

  @@unique([orgId, userId])
}

enum Role {
  OWNER
  MEMBER
}

model User {
  id          String      @id @default(cuid())
  email       String      @unique
  name        String?
  image       String?
  activeOrg   Org?        @relation("ActiveOrg", fields: [activeOrgId], references: [id], onDelete: SetNull)
  activeOrgId String?
  orgs        OrgMember[]
  accounts    Account[]
  sessions    Session[]

  @@index([activeOrgId])
}

model Form {
  id          String       @id @default(cuid())
  org         Org          @relation(fields: [orgId], references: [id], onDelete: Cascade)
  orgId       String
  title       String       @default("Untitled form")
  slug        String       @unique
  published   Boolean      @default(false)
  successMsg  String?
  createdAt   DateTime     @default(now())
  updatedAt   DateTime     @updatedAt
  fields      Field[]
  submissions Submission[]
}

model Field {
  id        String      @id @default(cuid())
  form      Form        @relation(fields: [formId], references: [id], onDelete: Cascade)
  formId    String
  type      FieldType
  label     String
  placeholder String?
  required  Boolean     @default(false)
  order     Int
  options   Json?       // for dropdown: string[]
  condition Json?       // { triggerFieldId: string, triggerValue: string }
  archivedAt DateTime?
  answers   FieldAnswer[]

  @@index([formId, archivedAt, order])
}

enum FieldType {
  TEXT
  EMAIL
  LONG_TEXT
  DROPDOWN
  RATING
  FILE
}

model Submission {
  id        String        @id @default(cuid())
  form      Form          @relation(fields: [formId], references: [id], onDelete: Cascade)
  formId    String
  createdAt DateTime      @default(now())
  answers   FieldAnswer[]
}

model FieldAnswer {
  id           String     @id @default(cuid())
  submission   Submission @relation(fields: [submissionId], references: [id], onDelete: Cascade)
  submissionId String
  field        Field      @relation(fields: [fieldId], references: [id], onDelete: Cascade)
  fieldId      String
  value        String
}

model Invite {
  id        String   @id @default(cuid())
  org       Org      @relation(fields: [orgId], references: [id], onDelete: Cascade)
  orgId     String
  email     String
  token     String   @unique @default(cuid())
  expiresAt DateTime
  accepted  Boolean  @default(false)
}

// Auth.js required models
model Account {
  id                String  @id @default(cuid())
  userId            String
  type              String
  provider          String
  providerAccountId String
  refresh_token     String? @db.Text
  access_token      String? @db.Text
  expires_at        Int?
  token_type        String?
  scope             String?
  id_token          String? @db.Text
  session_state     String?
  user              User    @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@unique([provider, providerAccountId])
}

model Session {
  id           String   @id @default(cuid())
  sessionToken String   @unique
  userId       String
  expires      DateTime
  user         User     @relation(fields: [userId], references: [id], onDelete: Cascade)
}

model VerificationToken {
  identifier String
  token      String   @unique
  expires    DateTime

  @@unique([identifier, token])
}
```

---

## Auth.js session shape

Extend the session to carry `orgId`. In `lib/auth.ts`:

```ts
// session.user.orgId is always the currently active org for that user
// Set it during the `session` callback by querying the first OrgMember row
```

In `middleware.ts`:
- Protect all `/dashboard/...` routes — redirect to `/login` if no session
- Protect all `/api/*` routes except `/api/auth/...` and `/api/submit/...`
- `/f/[slug]` and `/invite/[token]` are public

---

## Server Action pattern

Every action in `actions/` follows this exact pattern:

```ts
"use server";

import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { z } from "zod";
import { revalidatePath } from "next/cache";

const CreateFormSchema = z.object({
  title: z.string().min(1).max(100),
});

export async function createForm(input: z.infer<typeof CreateFormSchema>) {
  const session = await auth();
  if (!session?.user?.orgId) throw new Error("Unauthorized");

  const data = CreateFormSchema.parse(input);

  const form = await prisma.form.create({
    data: {
      orgId: session.user.orgId,
      title: data.title,
      slug: generateSlug(), // cuid-based, see lib/utils.ts
    },
  });

  revalidatePath("/dashboard/forms");
  return form;
}
```

---

## Component conventions

- All components are functional, named exports (no default exports except `page.tsx` and `layout.tsx`)
- Props interfaces are defined inline above the component with `interface XxxProps { ... }`
- Server Components by default — add `"use client"` only when needed (event handlers, hooks, dnd-kit)
- `ui/` components accept a `className` prop and forward it via `cn()` (tailwind-merge + clsx)
- No component fetches data with `fetch()` — data comes from props passed by Server Component parents

---

## Naming conventions

| Thing | Convention | Example |
|---|---|---|
| Files | kebab-case | `field-editor.tsx` |
| Components | PascalCase | `FieldEditor` |
| Server Actions | camelCase verb+noun | `createField`, `reorderFields` |
| Zod schemas | PascalCase + Schema suffix | `CreateFieldSchema` |
| DB query helpers | camelCase | `getFormWithFields` |
| CSS classes | Tailwind only | no custom CSS files |

---

## Environment variables

```
# .env.local
DATABASE_URL="postgresql://USER:PASSWORD@HOST/DATABASE?sslmode=require"
NEXTAUTH_SECRET="generate with: openssl rand -base64 32"
NEXTAUTH_URL="http://localhost:3000"
AUTH_GITHUB_ID=""
AUTH_GITHUB_SECRET=""
RESEND_API_KEY=""
UPSTASH_REDIS_REST_URL=""
UPSTASH_REDIS_REST_TOKEN=""
BLOB_READ_WRITE_TOKEN=""
```

Never commit `.env.local`. The `.env.example` in the repo lists all keys with empty values.

---

## What Codex / AI agents should NOT do

- Do not install additional UI libraries (no shadcn, no Radix, no Chakra) — build `ui/` components from scratch with Tailwind
- Do not add a `pages/` directory — App Router only
- Do not use `getServerSideProps` or `getStaticProps` — these are Pages Router APIs
- Do not add Redux, Zustand, Jotai, or any global state library — Server Components + `useState` is sufficient
- Do not generate placeholder/lorem content in production code paths
- Do not add `console.log` in committed code — use proper error boundaries and `try/catch`
- Do not create API routes for things that should be Server Actions

---

## Definition of done for each feature

A feature is only done when:
1. TypeScript compiles with zero errors (`tsc --noEmit`)
2. The happy path works end-to-end (can demo it)
3. The error path is handled (invalid input shows a message, not a crash)
4. Mobile layout is not broken (check at 375px width)
