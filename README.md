# CollabSpace

[![Live Demo](https://img.shields.io/badge/demo-thecollabspace.vercel.app-indigo?style=for-the-badge)](https://thecollabspace.vercel.app)
[![GitHub](https://img.shields.io/badge/github-manieshgupta%2FCollabspace-181717?style=for-the-badge&logo=github)](https://github.com/manieshgupta/Collabspace)
[![License: MIT](https://img.shields.io/badge/license-MIT-green?style=for-the-badge)](LICENSE)

[![Next.js](https://img.shields.io/badge/Next.js-15.5-black?logo=nextdotjs&logoColor=white)](https://nextjs.org)
[![React](https://img.shields.io/badge/React-19-61DAFB?logo=react&logoColor=black)](https://react.dev)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6?logo=typescript&logoColor=white)](https://www.typescriptlang.org)
[![Convex](https://img.shields.io/badge/Convex-realtime_DB-EE342F)](https://convex.dev)
[![Clerk](https://img.shields.io/badge/Clerk-auth-6C47FF)](https://clerk.com)
[![Liveblocks](https://img.shields.io/badge/Liveblocks-CRDT-000000)](https://liveblocks.io)
[![Vercel](https://img.shields.io/badge/Vercel-deployed-black?logo=vercel)](https://thecollabspace.vercel.app)

Realtime document workspace for teams that write specs, proposals, and product docs together.

---

## Demo

![CollabSpace product preview](./public/blank-document.svg)

---

## Live Demo

**https://thecollabspace.vercel.app**

1. Open the landing page
2. Sign up
3. Create a document from the template gallery
4. Share the URL with a teammate in the same organization to co-edit

---

## Problem & Motivation

Remote teams still bounce between a word processor, a comment thread, and a chat window to finish one document. Edits collide, comments leave the page, and personal drafts leak into the team workspace.

CollabSpace keeps identity, tenancy, live editing, and review in one product: a public marketing site, authenticated workspaces, CRDT-backed co-editing, and room-level access checks.

---

## Key Features

- **Public product site** — unauthenticated landing page; sign-up lands in the workspace
- **Personal and org workspaces** — personal docs stay private; org docs are scoped to the active organization
- **Live multiplayer editing** — concurrent typing converges without last-write-wins
- **Presence** — live cursors and avatar stack show who is in the room
- **Inline review** — comments, threads, mentions, and an inbox on the same page
- **Full editor** — fonts, size, color, highlight, headings, alignment, line height, lists, tasks, tables, links, images, image resize
- **Print-accurate canvas** — page-sized layout with draggable left/right margins
- **Templates** — blank, proposal, cover letter, letter, and resume starters
- **Search and catalog** — paginated list, title search, rename, delete
- **Export** — print/PDF, JSON, HTML, plain text
- **Access control** — only the owner or a matching organization member receives a Liveblocks room token

---

## Tech Stack

| Layer | Stack |
| --- | --- |
| Frontend | Next.js 15 App Router, React 19, TypeScript, Tailwind CSS, TipTap / ProseMirror |
| Auth | Clerk (sessions, JWT template `convex`, organizations) |
| Backend / data | Convex (schema, queries, mutations, search indexes) |
| Collaboration | Liveblocks (CRDT document, presence, threads, inbox) |
| Deployment | Vercel, GitHub auto-deploy on `master` |
| Quality | ESLint (`next lint`), TypeScript (`tsc --noEmit`) |

[![Next.js](https://img.shields.io/badge/-Next.js-000?logo=nextdotjs)](https://nextjs.org)
[![React](https://img.shields.io/badge/-React-20232A?logo=react)](https://react.dev)
[![TypeScript](https://img.shields.io/badge/-TypeScript-3178C6?logo=typescript&logoColor=white)](https://www.typescriptlang.org)
[![Tailwind](https://img.shields.io/badge/-Tailwind-06B6D4?logo=tailwindcss&logoColor=white)](https://tailwindcss.com)
[![Convex](https://img.shields.io/badge/-Convex-EE342F)](https://convex.dev)
[![Clerk](https://img.shields.io/badge/-Clerk-6C47FF)](https://clerk.com)
[![Liveblocks](https://img.shields.io/badge/-Liveblocks-111)](https://liveblocks.io)
[![Vercel](https://img.shields.io/badge/-Vercel-000?logo=vercel)](https://vercel.com)

---

## Architecture

Metadata lives in Convex. The live document lives in Liveblocks. Clerk issues identity. Next.js authorizes the room before any CRDT session starts.

```text
                    ┌─────────────────────────────────────┐
                    │           Next.js 15 (Vercel)       │
                    │  /  public landing                  │
                    │  /sign-in  /sign-up                 │
                    │  /documents          AuthGate       │
                    │  /documents/[id]     TipTap editor  │
                    │  POST /api/liveblocks-auth          │
                    └──────────────┬──────────────────────┘
           ┌───────────────────────┼───────────────────────┐
           ▼                       ▼                       ▼
     ┌──────────┐           ┌──────────┐           ┌────────────┐
     │  Clerk   │  JWT      │  Convex  │  owner/   │ Liveblocks │
     │ identity │  template │  docs +  │  org_id   │ CRDT room  │
     │ + orgs   │  "convex" │  search  │  check    │ presence   │
     └──────────┘           └──────────┘           └────────────┘
```

**Request path for an editor session**

1. Clerk authenticates the user and attaches `org_id` when an organization is active.
2. Convex lists and mutates documents filtered by `ownerId` or `organizationId`.
3. `/api/liveblocks-auth` loads the Convex row for the requested room, allows access only if the caller is the owner or a member of that organization, then issues `session.FULL_ACCESS` for that room only.

---

## Technical Highlights / Challenges Solved

- **Split stores on purpose.** Convex holds title, owner, organization, and search. Liveblocks holds the CRDT body, cursors, threads, and margins. One store would either lose queryable tenancy or lose realtime quality.
- **Room tokens, not UI gates.** `src/app/api/liveblocks-auth/route.ts` rejects missing sessions, missing documents, and cross-tenant access before Liveblocks ever opens a socket.
- **Org-aware queries.** Document list and search use `by_owner_id`, `by_organization_id`, and a title search index with the same filters, so switching Clerk organizations changes the catalog without a second product model.
- **Public vs app shell.** `/` is public. `/documents/*` waits on Convex auth and redirects to `/sign-in`. Marketing traffic never hits the editor bundle as a login wall.
- **Ship path.** Next.js 15.5.25 on Vercel, Clerk Development keys, GitHub `master` auto-deploy. Production Clerk is deferred until a domain we control exists; `*.vercel.app` cannot host Clerk Production DNS.

---

## Installation & Setup

**Prerequisites:** Node.js 18+, npm, free accounts on [Clerk](https://dashboard.clerk.com), [Convex](https://dashboard.convex.dev), and [Liveblocks](https://liveblocks.io).

```bash
git clone https://github.com/manieshgupta/Collabspace.git
cd Collabspace
npm install --legacy-peer-deps
cp .env.example .env.local
```

Fill `.env.local`:

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

**Clerk**

1. Create an app. Copy the publishable and secret keys.
2. Configure → JWT templates → New → Convex. Name it exactly `convex`.
3. Set `convex/auth.config.ts` `domain` to your Clerk Frontend API URL (`https://verb-noun-00.clerk.accounts.dev`).

**Liveblocks**

Create a project. Copy `sk_dev_...` into `LIVEBLOCKS_SECRET_KEY`.

**Convex + Next.js** (two terminals)

```bash
npx convex login
npx convex dev
```

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000). `npx convex dev` writes `CONVEX_DEPLOYMENT` and `NEXT_PUBLIC_CONVEX_URL`.

`--legacy-peer-deps` is required while some packages still peer-depend on React 18.

---

## Usage

```bash
# local app
npm run dev

# Convex functions + schema push (keep running)
npx convex dev

# production build
npm run build
npm run start
```

After sign-up you land on `/documents`. Pick a template or blank doc. The editor URL is `/documents/[documentId]`. Organization switcher in the navbar scopes the catalog to personal vs team docs.

---

## Testing

```bash
npm run lint
npx tsc --noEmit
```

No automated unit/e2e suite yet. Highest-value next tests: Convex tenancy mutations (owner vs org member vs stranger) and the Liveblocks auth route (401 vs room token).

---

## Folder / File Structure

```text
Collabspace/
├── convex/
│   ├── auth.config.ts      Clerk issuer for Convex JWTs
│   ├── documents.ts        queries / mutations / tenancy
│   └── schema.ts           documents table + indexes
├── src/
│   ├── app/
│   │   ├── (home)/page.tsx           landing
│   │   ├── sign-in/  sign-up/        Clerk routes
│   │   ├── documents/page.tsx        catalog
│   │   ├── documents/layout.tsx      AuthGate
│   │   ├── documents/[documentId]/   editor, room, toolbar, ruler
│   │   └── api/liveblocks-auth/      room authorization
│   ├── components/auth-gate.tsx
│   └── middleware.ts
├── liveblocks.config.ts
├── vercel.json
└── .env.example
```

---

## What I Learned

Realtime editing is the visible feature. The hard part is tenancy: who can open the room, how personal and org catalogs stay partitioned, and how the auth token for Convex stays in sync with the Clerk JWT template. Splitting metadata from CRDT state made both of those problems smaller.

I also learned that a public landing page plus a gated app is a product decision, not a CSS decision — routing and AuthGate had to change before the marketing page could exist.

---

## Roadmap / Future Improvements

- Playwright flow: sign up → create doc → second user in another org is denied
- Convex production deploy key on the Vercel build
- Audit fields on documents (`updatedAt`, last editor)
- Rate-limit `/api/liveblocks-auth`
- Custom domain + Clerk Production when DNS is available
- Broader export (Markdown) and share-by-link with expiry

---

## License

MIT. See [LICENSE](LICENSE) if present; otherwise all rights reserved by the author until a LICENSE file is added.

---

## Contact / Links

- **Live demo:** [https://thecollabspace.vercel.app](https://thecollabspace.vercel.app)
- **GitHub:** [https://github.com/manieshgupta/Collabspace](https://github.com/manieshgupta/Collabspace)
- **Portfolio:** [https://manieshgupta.netlify.app/](https://manieshgupta.netlify.app/)
- **LinkedIn:** [https://linkedin.com/in/manieshgupta](https://linkedin.com/in/manieshgupta)
- **Resume:** [PDF](https://drive.google.com/file/d/1jb2a152z-ozK-pt1PfGIaFJNF7jnvdIR/view?usp=sharing)
- **Email:** [manieshgupta333@gmail.com](mailto:manieshgupta333@gmail.com)
