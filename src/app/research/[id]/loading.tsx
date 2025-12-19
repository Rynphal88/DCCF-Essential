// src/app/research/[id]/loading.tsx

export default function ArtifactDetailLoading() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6 text-slate-100">
      <div className="h-4 w-32 rounded-full bg-slate-800 animate-pulse" />
      <div className="h-8 w-2/3 rounded-full bg-slate-800 animate-pulse" />
      <div className="space-y-3">
        <div className="h-4 w-full rounded bg-slate-900 animate-pulse" />
        <div className="h-4 w-5/6 rounded bg-slate-900 animate-pulse" />
        <div className="h-4 w-2/3 rounded bg-slate-900 animate-pulse" />
      </div>
    </div>
  );
}
