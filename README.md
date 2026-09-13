# CollabSpace

A realtime collaborative document editor: Google Docs-class authoring, presence, comments, organization workspaces, and a print-accurate canvas.

**Live demo:** [https://collabspace-red.vercel.app](https://collabspace-red.vercel.app)

Sign up on the landing page, then open `/documents` to create and co-edit files.

---

## Why this exists

Most “Google Docs clone” demos stop at a rich-text editor. Production document products fail or succeed on harder problems:

- Who is allowed to open a room?
- How do personal docs stay isolated from team docs?
- How do concurrent edits converge without last-write-wins?
- How do comments, presence, and notifications stay in the same session as the document?
- How do you ship this as a public SaaS surface (marketing site + auth + app) instead of a login wall?

CollabSpace is a full product slice of that system: public landing page, Clerk identity + organizations, Convex as the system of record for document metadata, Liveblocks CRDTs for the shared editor, and Vercel for the Next.js edge.

This codebase started from a public Next.js 15 / Convex / Clerk / Liveblocks tutorial and was then productionized: public vs authenticated routing, dedicated sign-in/sign-up pages, an organization-aware authorization path, a recruiter-facing product surface, and a live Vercel deployment on Clerk Development.

---

## Product surface

| Area | What ships |
| --- | --- |
| Marketing | 3D-style SaaS landing page; unauthenticated `/`; CTAs to `/sign-up` |
| Identity | Clerk email/social auth, session JWT, organization switcher |
| Workspaces | Personal documents vs organization-scoped documents |
| Catalog | Template gallery, paginated table, title search, rename, delete |
| Editor | TipTap: fonts, size, color, highlight, alignment, headings, line height, lists, tasks, tables, links, images, image resize |
| Layout | Page-sized canvas, dragable left/right margins, print stylesheet |
| Collaboration | Live cursors, avatar stack, CRDT sync, offline-capable rooms |
| Review | Inline threads, mentions, inbox notifications |
| Export | Print / PDF, JSON, HTML, plain text |
| Access control | Owner or same-organization member only; Liveblocks rooms authorized server-side |

---

## Architecture

```text
Browser
  |  Next.js 15 App Router (Vercel)
  |-- /                 public landing
  |-- /sign-in /sign-up Clerk hosted components
  |-- /documents        AuthGate + Convex queries
  |-- /documents/[id]   TipTap + Liveblocks Room
  |-- POST /api/liveblocks-auth
        |
        +--> Clerk session (identity, org_id)
        +--> Convex document row (ownerId, organizationId)
        +--> Liveblocks session.FULL_ACCESS for that room only
        |
Convex  --> documents table, search indexes, mutations
Liveblocks --> CRDT document, presence, threads, inbox
```

### System of record vs system of collaboration

These are intentionally separate:

- **Convex** owns durable product data: title, owner, organization, initial template HTML, search.
- **Liveblocks** owns the live document: CRDT state, cursors, comments, margin storage, notifications.

That split is how real collaborative products are built. Mixing both into one database either loses realtime quality or loses queryable tenancy.

### Authorization model

Every privileged path checks identity **and** tenancy.

1. Clerk authenticates the user and optionally attaches `org_id`.
2. Convex mutations/queries require `ctx.auth.getUserIdentity()`.
3. List queries are partitioned:
   - If the user is in an organization: `by_organization_id`
   - Else: `by_owner_id`
   - Search uses a search index with the same filters
4. Update/delete: owner **or** matching organization member.
5. Liveblocks auth endpoint (`src/app/api/liveblocks-auth/route.ts`):
   - Rejects missing Clerk session
   - Loads the Convex document for the requested room id
   - Allows access only if `ownerId === user.id` or `organizationId === sessionClaims.org_id`
   - Issues a room-scoped token (`session.allow(room, session.FULL_ACCESS)`)

Unauthenticated visitors never see the editor. `/` is public. `/documents/*` is wrapped in `AuthGate`, which waits for Convex auth and redirects to `/sign-in`.

### Auth token bridge

Convex validates Clerk JWTs using `convex/auth.config.ts`:

- `domain` = Clerk Frontend API URL
- `applicationID` = `convex` (must match the Clerk JWT template name)

`ConvexProviderWithClerk` fetches that template token and sends it on Convex requests. If the template name, issuer domain, or Convex auth config drift, `useConvexAuth()` stays `isAuthenticated: false` even after a successful Clerk login. That is the first thing to debug.

---

## Tech stack

| Layer | Choice | Why |
| --- | --- | --- |
| UI | Next.js 15.5 App Router, React 19 RC | Server components where useful, client islands for editor/auth |
| Styling | Tailwind CSS, Radix/shadcn | Accessible primitives without a design-system rewrite |
| Editor | TipTap + ProseMirror | Extensible document model; Liveblocks has a first-party TipTap plugin |
| Auth | Clerk | Hosted auth, organizations, JWT templates |
| Data | Convex | Typed queries/mutations, indexes, auth integration, no separate ORM |
| Collaboration | Liveblocks | CRDTs, presence, threads, inbox |
| Hosting | Vercel | Next.js native; Clerk Development keys used for this demo |

---

## Repository map

```text
src/app/(home)/page.tsx              Public landing page
src/app/sign-in, src/app/sign-up     Clerk path routing
src/app/documents/page.tsx           Document catalog
src/app/documents/layout.tsx         AuthGate
src/app/documents/[documentId]/      Editor, toolbar, ruler, room, comments
src/app/api/liveblocks-auth/route.ts Room authorization
src/components/auth-gate.tsx         Convex auth loading + redirect
src/middleware.ts                    clerkMiddleware
convex/schema.ts                     documents table + indexes
convex/documents.ts                  queries/mutations + tenancy
convex/auth.config.ts                Clerk issuer for Convex
liveblocks.config.ts                 Presence / storage typing
```

---

## Local setup

### Prerequisites

- Node.js 18+
- npm (use `--legacy-peer-deps` because React 19 is still RC for some peer ranges)
- Free accounts: [Clerk](https://dashboard.clerk.com), [Convex](https://dashboard.convex.dev), [Liveblocks](https://liveblocks.io)

### 1. Install

```bash
git clone https://github.com/manieshgupta/collabspace.git
cd collabspace
npm install --legacy-peer-deps
cp .env.example .env.local
```

### 2. Clerk

1. Create an application (Email + Google is enough).
2. Copy **Publishable key** and **Secret key** into `.env.local`.
3. **Configure → JWT templates → New → Convex**. Name the template exactly `convex`.
4. Copy the Frontend API URL (`https://verb-noun-00.clerk.accounts.dev`).
5. Put that URL in `convex/auth.config.ts` as `providers[0].domain`.
6. Optional: **Configure → Paths**
   - Sign-in: `/sign-in`
   - Sign-up: `/sign-up`
   - After sign-in / sign-up: `/documents`

Development instances do not require a custom domain.

### 3. Liveblocks

Create a project, copy the secret key (`sk_dev_...`) into `LIVEBLOCKS_SECRET_KEY`.

### 4. Convex

```bash
npx convex login
npx convex dev
```

`npx convex dev` writes `CONVEX_DEPLOYMENT` and `NEXT_PUBLIC_CONVEX_URL` into `.env.local` and pushes `convex/` (schema, functions, auth config).

Keep that process running while you develop.

### 5. Next.js

In a second terminal:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

---

## Environment variables

`.env.example` is the contract. Never commit `.env.local`.

```bash
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=
CLERK_SECRET_KEY=
NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in
NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up
NEXT_PUBLIC_CLERK_SIGN_IN_FALLBACK_REDIRECT_URL=/documents
NEXT_PUBLIC_CLERK_SIGN_UP_FALLBACK_REDIRECT_URL=/documents

LIVEBLOCKS_SECRET_KEY=

CONVEX_DEPLOYMENT=
NEXT_PUBLIC_CONVEX_URL=
```

`CONVEX_DEPLOYMENT` and `NEXT_PUBLIC_CONVEX_URL` are generated by `npx convex dev`.

---

## Scripts

```bash
npm run dev
npm run build
npm run start
npm run lint
npx convex dev
npx tsc --noEmit
```

Install note: `npm install --legacy-peer-deps` is required until every dependency declares React 19.

---

## Deploy (Clerk Development)

This demo is deployed on **Clerk Development** keys. That is valid for a portfolio: Clerk Production requires a domain you control (Vercel `*.vercel.app` cannot be a Clerk production domain).

### Vercel

1. Install command: `npm install --legacy-peer-deps`
2. Build command: `next build` (or `npx convex deploy --cmd 'npm run build'` if you use a Convex production deployment)
3. Set the same env vars as `.env.example` (use `pk_test_` / `sk_test_` / `sk_dev_`)
4. After the first URL exists, add it in Clerk Development under allowed origins if the dashboard asks

Production URL for this repo: [https://collabspace-red.vercel.app](https://collabspace-red.vercel.app)

### Convex auth after clone

If you fork this repo, replace `convex/auth.config.ts` `domain` with **your** Clerk Frontend API URL, then run `npx convex dev` or `npx convex deploy`. Stale issuer domains are the most common “signed in to Clerk, empty app” bug.

---

## Operational notes

**Honest limitations (what a senior reviewer will ask)**

- Clerk Development keys are used on the public demo. Do not treat this as a compliance-ready production tenant.
- `getById` does not re-check membership before returning a document to the page; the Liveblocks auth route and mutations do. Tightening the query is a clean follow-up.
- Document body lives in Liveblocks, not Convex. Backup/export of CRDT history is a Liveblocks concern.
- React 19 is still an RC in `package.json`; Next.js was bumped to 15.5.25 to clear Vercel’s vulnerable-version gate.
- There is no custom test suite yet. Highest-value tests would be Convex tenancy mutations and the Liveblocks auth route.

**What I would do next**

- Move `getById` behind the same owner/org check
- Add Playwright for sign-up → create doc → second user denied
- Convex production deploy key on Vercel build
- Clerk Production only after a real domain + Google OAuth client
- Rate-limit the Liveblocks auth route
- Persist audit fields (`updatedAt`, last editor) on Convex

---

## Resume talking points

- Split **metadata** (Convex) from **collaborative state** (Liveblocks CRDTs) instead of forcing one store to do both.
- Authorization is enforced on the **room token**, not only in the UI.
- Organizations are a first-class tenancy key, not a cosmetic Clerk widget.
- Public marketing route is separated from the authenticated app shell.
- Deployment is real: Vercel + Clerk Development + live Convex backend.

If you only have 30 seconds in an interview: open the demo, sign in, create a document, and walk through `src/app/api/liveblocks-auth/route.ts` and `convex/documents.ts`.
