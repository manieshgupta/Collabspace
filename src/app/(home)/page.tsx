"use client";

import Link from "next/link";
import Image from "next/image";
import { SignedIn, SignedOut } from "@clerk/nextjs";
import {
  ArrowRight,
  Bell,
  Building2,
  CheckCircle2,
  FileJson,
  FileText,
  Highlighter,
  Image as ImageIcon,
  Layers,
  MessageSquare,
  MousePointer2,
  Printer,
  Ruler,
  Search,
  ShieldCheck,
  Table,
  Type,
  Users,
  Workflow,
  Zap,
} from "lucide-react";

const features = [
  {
    icon: Users,
    title: "Live multiplayer editing",
    body: "CRDT-backed collaboration with Liveblocks so every keystroke, selection, and cursor stays in sync.",
  },
  {
    icon: MousePointer2,
    title: "Presence & live cursors",
    body: "See who is in the room, follow colored cursors, and keep awareness without extra chat tools.",
  },
  {
    icon: MessageSquare,
    title: "Inline comments & threads",
    body: "Highlight text, leave threads, mention teammates, and resolve feedback without leaving the page.",
  },
  {
    icon: Bell,
    title: "Inbox notifications",
    body: "Catch mentions and thread updates from a Liveblocks inbox so collaboration never goes missing.",
  },
  {
    icon: Type,
    title: "Google Docs-class editor",
    body: "TipTap rich text with fonts, sizes, colors, highlights, alignment, headings, and line height.",
  },
  {
    icon: Table,
    title: "Tables, tasks & lists",
    body: "Insert tables, ordered lists, bullets, and interactive checklists for specs and project plans.",
  },
  {
    icon: ImageIcon,
    title: "Images & links",
    body: "Upload or embed images, resize them in place, and attach hyperlinks with a polished toolbar.",
  },
  {
    icon: Ruler,
    title: "Page ruler & margins",
    body: "Drag left and right margins on a print-accurate canvas so layout matches exported pages.",
  },
  {
    icon: Search,
    title: "Full-text document search",
    body: "Convex search indexes find documents by title across personal and organization workspaces.",
  },
  {
    icon: Building2,
    title: "Organization workspaces",
    body: "Clerk organizations isolate team docs while personal workspaces stay private to each user.",
  },
  {
    icon: Printer,
    title: "Export anywhere",
    body: "Print, PDF, JSON, HTML, and plain text export so drafts leave CollabSpace without lock-in.",
  },
  {
    icon: Layers,
    title: "Template gallery",
    body: "Start from blank, proposals, cover letters, letters, and resume templates in one click.",
  },
];

const stack = [
  { name: "Next.js 15", role: "App Router UI" },
  { name: "React 19", role: "Concurrent UI" },
  { name: "Convex", role: "Realtime database" },
  { name: "Clerk", role: "Auth & orgs" },
  { name: "Liveblocks", role: "Presence & CRDTs" },
  { name: "TipTap", role: "Rich text editor" },
];

const steps = [
  {
    step: "01",
    title: "Create a workspace",
    body: "Sign up with Clerk, then start in a personal space or switch into an organization.",
  },
  {
    step: "02",
    title: "Open a live document",
    body: "Pick a template or blank page. Convex stores metadata; Liveblocks hosts the shared room.",
  },
  {
    step: "03",
    title: "Write together",
    body: "Edit, comment, mention, and export. Presence avatars and cursors keep everyone aligned.",
  },
];

const PrimaryCta = ({ className = "" }: { className?: string }) => (
  <>
    <SignedOut>
      <Link
        href="/sign-up"
        className={`inline-flex items-center justify-center gap-2 rounded-full bg-indigo-500 px-6 py-3 text-sm font-semibold text-white shadow-[0_0_40px_rgba(99,102,241,0.45)] transition hover:bg-indigo-400 ${className}`}
      >
        Sign up free
        <ArrowRight className="size-4" />
      </Link>
    </SignedOut>
    <SignedIn>
      <Link
        href="/documents"
        className={`inline-flex items-center justify-center gap-2 rounded-full bg-indigo-500 px-6 py-3 text-sm font-semibold text-white shadow-[0_0_40px_rgba(99,102,241,0.45)] transition hover:bg-indigo-400 ${className}`}
      >
        Open workspace
        <ArrowRight className="size-4" />
      </Link>
    </SignedIn>
  </>
);

const Home = () => {
  return (
    <div className="min-h-screen bg-[#070B18] text-slate-100 overflow-x-hidden">
      <div className="pointer-events-none fixed inset-0 landing-grid" />
      <div className="pointer-events-none fixed -top-32 left-1/2 h-[520px] w-[520px] -translate-x-1/2 rounded-full bg-indigo-500/20 blur-[120px] landing-pulse" />
      <div className="pointer-events-none fixed top-40 right-[-120px] h-[360px] w-[360px] rounded-full bg-cyan-400/10 blur-[100px]" />

      <header className="relative z-20 mx-auto flex max-w-6xl items-center justify-between px-6 py-5">
        <Link href="/" className="flex items-center gap-3">
          <Image src="/logo.svg" alt="CollabSpace" width={32} height={32} />
          <span className="text-lg font-semibold tracking-tight">CollabSpace</span>
        </Link>
        <nav className="hidden items-center gap-8 text-sm text-slate-300 md:flex">
          <a href="#features" className="hover:text-white">Features</a>
          <a href="#workflow" className="hover:text-white">Workflow</a>
          <a href="#stack" className="hover:text-white">Architecture</a>
        </nav>
        <div className="flex items-center gap-3">
          <SignedOut>
            <Link href="/sign-in" className="hidden text-sm text-slate-300 hover:text-white sm:inline">
              Sign in
            </Link>
          </SignedOut>
          <PrimaryCta />
        </div>
      </header>

      <section className="relative z-10 mx-auto grid max-w-6xl items-center gap-12 px-6 pb-20 pt-10 lg:grid-cols-2 lg:pt-16">
        <div className="landing-rise">
          <p className="mb-4 inline-flex items-center gap-2 rounded-full border border-indigo-400/30 bg-indigo-500/10 px-3 py-1 text-xs font-medium text-indigo-200">
            <Zap className="size-3.5" />
            Realtime collaborative documents
          </p>
          <h1 className="text-4xl font-semibold tracking-tight text-white sm:text-5xl lg:text-6xl">
            Write together in a
            <span className="block bg-gradient-to-r from-indigo-300 via-sky-300 to-violet-300 bg-clip-text text-transparent landing-shimmer">
              3D-fast workspace
            </span>
          </h1>
          <p className="mt-5 max-w-xl text-base leading-7 text-slate-300 sm:text-lg">
            CollabSpace is a Google Docs-class editor with live cursors, comments, organization workspaces, and a print-accurate canvas. Built for teams that ship specs, proposals, and product docs together.
          </p>
          <div className="mt-8 flex flex-wrap items-center gap-4">
            <PrimaryCta />
            <a href="#features" className="text-sm font-medium text-slate-300 hover:text-white">
              Explore capabilities
            </a>
          </div>
          <div className="mt-10 flex flex-wrap gap-6 text-xs uppercase tracking-[0.18em] text-slate-400">
            <span>CRDT sync</span>
            <span>Org RBAC</span>
            <span>Offline-ready rooms</span>
          </div>
        </div>

        <div className="landing-stage relative mx-auto h-[460px] w-full max-w-[520px]">
          <div className="absolute left-1/2 top-1/2 size-64 -translate-x-1/2 -translate-y-1/2 rounded-full border border-indigo-400/20" />
          <div className="absolute left-1/2 top-1/2 size-[18px] -translate-x-1/2 -translate-y-1/2 landing-orbit">
            <span className="block size-4 rounded-full bg-sky-400 shadow-[0_0_18px_rgba(56,189,248,0.9)]" />
          </div>
          <div className="landing-float mx-auto h-[360px] w-[280px] rounded-[22px] border border-white/10 bg-gradient-to-br from-white/15 to-white/5 p-3 shadow-[0_40px_120px_rgba(15,23,42,0.7)] backdrop-blur-xl">
            <div className="h-full rounded-[16px] bg-[#0B1224] p-4 shadow-inner">
              <div className="mb-4 flex items-center justify-between">
                <div className="flex -space-x-2">
                  <span className="grid size-7 place-items-center rounded-full bg-indigo-500 text-[10px] font-semibold">AK</span>
                  <span className="grid size-7 place-items-center rounded-full bg-cyan-500 text-[10px] font-semibold">MR</span>
                  <span className="grid size-7 place-items-center rounded-full bg-violet-500 text-[10px] font-semibold">JL</span>
                </div>
                <span className="rounded-full bg-emerald-400/15 px-2 py-0.5 text-[10px] font-medium text-emerald-300">Live</span>
              </div>
              <div className="space-y-2">
                <div className="h-3 w-3/4 rounded bg-white/20" />
                <div className="h-2 w-full rounded bg-white/10" />
                <div className="h-2 w-5/6 rounded bg-white/10" />
                <div className="relative mt-4 h-24 rounded-lg border border-indigo-400/30 bg-indigo-500/10 p-3">
                  <p className="text-[11px] leading-4 text-indigo-100">Ship the Q3 proposal with live comments, tables, and shared margins.</p>
                  <MousePointer2 className="landing-cursor absolute bottom-3 right-4 size-4 text-sky-300" />
                </div>
                <div className="mt-3 grid grid-cols-3 gap-2">
                  <div className="h-10 rounded bg-white/10" />
                  <div className="h-10 rounded bg-white/10" />
                  <div className="h-10 rounded bg-indigo-400/30" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section id="features" className="relative z-10 mx-auto max-w-6xl px-6 py-16">
        <div className="mb-10 max-w-2xl">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-indigo-300">Product surface</p>
          <h2 className="mt-3 text-3xl font-semibold tracking-tight text-white sm:text-4xl">Every capability a recruiter should see.</h2>
          <p className="mt-3 text-slate-300">Not a mock. These features are implemented in the editor, Convex backend, Clerk orgs, and Liveblocks rooms.</p>
        </div>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {features.map((feature) => (
            <article
              key={feature.title}
              className="rounded-2xl border border-white/10 bg-white/[0.04] p-5 backdrop-blur-sm transition hover:-translate-y-1 hover:border-indigo-400/40 hover:bg-white/[0.07]"
            >
              <feature.icon className="size-5 text-indigo-300" />
              <h3 className="mt-4 text-base font-semibold text-white">{feature.title}</h3>
              <p className="mt-2 text-sm leading-6 text-slate-400">{feature.body}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="relative z-10 mx-auto grid max-w-6xl gap-10 px-6 py-8 lg:grid-cols-2">
        <div className="rounded-3xl border border-white/10 bg-gradient-to-br from-indigo-500/15 to-transparent p-8">
          <Highlighter className="size-6 text-indigo-300" />
          <h3 className="mt-4 text-2xl font-semibold text-white">A toolbar that actually ships work</h3>
          <ul className="mt-5 space-y-3 text-sm text-slate-300">
            <li className="flex gap-2"><CheckCircle2 className="mt-0.5 size-4 text-emerald-400" /> Undo/redo, spellcheck, and print-ready canvas</li>
            <li className="flex gap-2"><CheckCircle2 className="mt-0.5 size-4 text-emerald-400" /> Font family, size, color, highlight, and line height</li>
            <li className="flex gap-2"><CheckCircle2 className="mt-0.5 size-4 text-emerald-400" /> Mentions, comments, and inbox notifications</li>
            <li className="flex gap-2"><CheckCircle2 className="mt-0.5 size-4 text-emerald-400" /> Rename, delete, and search across workspaces</li>
          </ul>
        </div>
        <div className="rounded-3xl border border-white/10 bg-white/[0.04] p-8">
          <ShieldCheck className="size-6 text-sky-300" />
          <h3 className="mt-4 text-2xl font-semibold text-white">Auth, tenancy, and permissions</h3>
          <p className="mt-4 text-sm leading-6 text-slate-300">
            Clerk authenticates users and organizations. Convex mutations check ownership and org membership. Liveblocks rooms authorize only owners or org members, so collaboration is scoped, not global.
          </p>
          <div className="mt-6 grid grid-cols-2 gap-3 text-xs text-slate-300">
            <div className="rounded-xl border border-white/10 p-3">JWT template: convex</div>
            <div className="rounded-xl border border-white/10 p-3">Org-aware queries</div>
            <div className="rounded-xl border border-white/10 p-3">Room-level access</div>
            <div className="rounded-xl border border-white/10 p-3">Personal vs team docs</div>
          </div>
        </div>
      </section>

      <section id="workflow" className="relative z-10 mx-auto max-w-6xl px-6 py-16">
        <div className="mb-10 flex items-center gap-3">
          <Workflow className="size-5 text-indigo-300" />
          <h2 className="text-3xl font-semibold tracking-tight text-white">How teams use CollabSpace</h2>
        </div>
        <div className="grid gap-4 md:grid-cols-3">
          {steps.map((item) => (
            <article key={item.step} className="rounded-2xl border border-white/10 bg-[#0C1326] p-6">
              <p className="text-sm font-semibold text-indigo-300">{item.step}</p>
              <h3 className="mt-3 text-xl font-semibold text-white">{item.title}</h3>
              <p className="mt-2 text-sm leading-6 text-slate-400">{item.body}</p>
            </article>
          ))}
        </div>
      </section>

      <section id="stack" className="relative z-10 mx-auto max-w-6xl px-6 py-8">
        <h2 className="text-3xl font-semibold tracking-tight text-white">Production-shaped architecture</h2>
        <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-300">
          Frontend on Next.js App Router, documents in Convex, presence and CRDT editing in Liveblocks, identity in Clerk. The same stack used in modern SaaS products.
        </p>
        <div className="mt-8 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
          {stack.map((item) => (
            <div key={item.name} className="rounded-2xl border border-white/10 bg-white/[0.03] px-4 py-5 text-center">
              <p className="text-sm font-semibold text-white">{item.name}</p>
              <p className="mt-1 text-xs text-slate-400">{item.role}</p>
            </div>
          ))}
        </div>
        <div className="mt-8 grid gap-3 sm:grid-cols-3">
          <div className="flex items-center gap-3 rounded-xl border border-white/10 p-4 text-sm text-slate-300">
            <FileText className="size-4 text-indigo-300" /> PDF / print export
          </div>
          <div className="flex items-center gap-3 rounded-xl border border-white/10 p-4 text-sm text-slate-300">
            <FileJson className="size-4 text-indigo-300" /> JSON & HTML snapshots
          </div>
          <div className="flex items-center gap-3 rounded-xl border border-white/10 p-4 text-sm text-slate-300">
            <Users className="size-4 text-indigo-300" /> Live avatar stack
          </div>
        </div>
      </section>

      <section className="relative z-10 mx-auto max-w-6xl px-6 py-20">
        <div className="overflow-hidden rounded-[28px] border border-indigo-400/30 bg-gradient-to-r from-indigo-600/30 via-[#10182d] to-cyan-500/10 p-10 text-center">
          <h2 className="text-3xl font-semibold text-white sm:text-4xl">Start writing with your team</h2>
          <p className="mx-auto mt-3 max-w-xl text-sm text-slate-300">
            Create an account, open a template, and share a live document. Sign up takes you straight into the workspace.
          </p>
          <div className="mt-8 flex justify-center">
            <PrimaryCta />
          </div>
        </div>
      </section>

      <footer className="relative z-10 border-t border-white/10 px-6 py-8 text-center text-xs text-slate-500">
        CollabSpace — realtime documents for ambitious teams.
      </footer>
    </div>
  );
};

export default Home;
