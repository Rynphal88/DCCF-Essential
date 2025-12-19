// src/app/research/page.tsx

import Link from "next/link";
import { createClient } from "@supabase/supabase-js";
import { ResearchChatPanel } from "@/components/ai/ResearchChatPanel";

type Artifact = {
  id: number;
  type: string;
  title: string;
  description: string;
};

export const revalidate = 0;

// Server-side Supabase fetch for research artifacts
async function getArtifacts(): Promise<Artifact[]> {
  const supabaseUrl = process.env.SUPABASE_URL;
  const supabaseAnonKey = process.env.SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseAnonKey) {
    console.error(
      "[ResearchHub] Missing SUPABASE_URL or SUPABASE_ANON_KEY env vars. Check your .env.local file."
    );
    return [];
  }

  try {
    const supabase = createClient(supabaseUrl, supabaseAnonKey);

    const { data, error } = await supabase
      .from("artifacts")
      .select("id, type, title, description")
      .order("created_at", { ascending: false });

    if (error) {
      console.error("[ResearchHub] Error loading artifacts from Supabase:", error);
      return [];
    }

    return (data ?? []) as Artifact[];
  } catch (err) {
    console.error("[ResearchHub] Unexpected error while fetching artifacts:", err);
    return [];
  }
}

export default async function ResearchHubPage() {
  const artifacts = await getArtifacts();
  const primaryArtifactId = artifacts.length > 0 ? artifacts[0].id : undefined;

  return (
    <div className="mx-auto max-w-7xl space-y-10 px-4 py-8 text-slate-100 sm:px-6 lg:px-8">
      {/* 🔹 Header Section */}
      <header className="space-y-4 border-b border-slate-800 pb-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="space-y-2">
            <h1 className="text-3xl font-bold tracking-tight">Research Hub</h1>
            <p className="max-w-2xl text-sm text-muted-foreground md:text-base">
              This will evolve into your central research cockpit: a place to
              search, filter, and review scholarly work, with AI helping you
              summarise, compare, and connect ideas across papers and notes.
            </p>
            <p className="text-xs text-muted-foreground">
              For now, this is a placeholder view so navigation is complete and
              future-proof. We&apos;ll layer in the alien-grade search engine,
              semantic filters, and reading queues in the next phase.
            </p>
          </div>

          <div className="flex flex-col items-start gap-2 sm:items-end">
            <Link
              href="/research/new"
              className="inline-flex items-center rounded-full bg-sky-600 px-4 py-2 text-sm font-medium text-white shadow transition hover:bg-sky-500"
            >
              + New Artifact
            </Link>
            <Link
              href="/compass"
              className="text-xs font-medium text-sky-500 hover:underline"
            >
              ← Back to Compass
            </Link>
          </div>
        </div>
      </header>

      {/* 🔸 Main layout: list + AI panel */}
      <section className="grid gap-8 lg:grid-cols-[minmax(0,2fr)_minmax(260px,1fr)]">
        {/* Left: Artifact List */}
        <div className="space-y-6">
          <h2 className="text-lg font-semibold text-slate-200">
            Your Research Artifacts
          </h2>

          {artifacts.length > 0 ? (
            <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-2">
              {artifacts.map((artifact) => (
                <li key={artifact.id}>
                  <Link
                    href={`/research/${artifact.id}`}
                    className="block rounded-xl border border-slate-800 bg-slate-900/60 p-5 shadow-lg backdrop-blur-sm transition hover:border-sky-500 hover:bg-slate-900/80"
                  >
                    <h3 className="mb-1 text-xs font-semibold uppercase tracking-wide text-sky-300">
                      {artifact.type}
                    </h3>
                    <p className="text-base font-medium leading-snug">
                      {artifact.title}
                    </p>
                    <p className="mt-2 line-clamp-3 text-sm text-slate-400">
                      {artifact.description}
                    </p>
                  </Link>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-sm text-slate-500">
              No research artifacts yet. Start by creating one with the{" "}
              <span className="font-medium text-sky-400">+ New Artifact</span>{" "}
              button above.
            </p>
          )}
        </div>

        {/* Right: AI Assistant Panel (hybrid alien scholar, attached to latest artifact) */}
        <aside className="space-y-3">
          <div className="space-y-1">
            <h2 className="text-sm font-semibold text-slate-200">
              AI Research Companion
            </h2>
            <p className="text-xs text-slate-400">
              Ask questions about your current work. In offline or hybrid mode it
              will lean into pattern recognition and alien-style prompts instead
              of generic answers.
            </p>
          </div>

          {primaryArtifactId ? (
            <ResearchChatPanel artifactId={primaryArtifactId} />
          ) : (
            <div className="rounded-xl border border-slate-800 bg-slate-950/70 p-4 text-xs text-slate-400">
              Add your first artifact to start a conversation. The assistant will
              then attach itself to your latest item and help you turn it into
              clearer Problem → Gap → Contribution moves.
            </div>
          )}
        </aside>
      </section>
    </div>
  );
}
