// src/app/research/new/page.tsx

'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function NewArtifactPage() {
  const router = useRouter();
  const [type, setType] = useState('Note');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErrorMessage(null);

    if (!title.trim() || !description.trim()) {
      setErrorMessage('Title and description are required.');
      return;
    }

    setIsSubmitting(true);

    try {
      const res = await fetch('/api/artifacts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type, title, description }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => null);
        setErrorMessage(data?.error ?? 'Failed to create artifact.');
        setIsSubmitting(false);
        return;
      }

      const data = await res.json();
      const id = data?.id;

      if (id) {
        router.push(`/research/${id}`);
      } else {
        router.push('/research');
      }
    } catch (err) {
      console.error('[NewArtifactPage] submit error:', err);
      setErrorMessage('Unexpected error. Please try again.');
      setIsSubmitting(false);
    }
  }

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 text-slate-100">
      <div className="flex items-center justify-between gap-4">
        <div className="space-y-1">
          <Link
            href="/research"
            className="text-xs font-medium text-sky-500 hover:underline"
          >
            ← Back to Research Hub
          </Link>
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight">
            New Research Artifact
          </h1>
          <p className="text-sm text-slate-400">
            Capture a note, literature insight, draft, hypothesis, or any unit of
            research that you want the DCCF OS to remember.
          </p>
        </div>
      </div>

      <form
        onSubmit={handleSubmit}
        className="space-y-6 rounded-2xl border border-slate-800 bg-slate-900/60 p-6 shadow-lg backdrop-blur"
      >
        <div className="space-y-2">
          <label
            htmlFor="type"
            className="text-xs font-medium uppercase tracking-wide text-slate-300"
          >
            Artifact Type
          </label>
          <select
            id="type"
            value={type}
            onChange={(e) => setType(e.target.value)}
            className="w-full rounded-lg border border-slate-700 bg-slate-950/60 px-3 py-2 text-sm text-slate-100 outline-none focus:border-sky-500 focus:ring-1 focus:ring-sky-500"
          >
            <option>Note</option>
            <option>Literature Review</option>
            <option>Draft</option>
            <option>Concept Map</option>
            <option>Research Question</option>
            <option>Hypothesis</option>
            <option>Summary</option>
            <option>TODO</option>
            <option>Insight</option>
            <option>Reading Queue</option>
          </select>
        </div>

        <div className="space-y-2">
          <label
            htmlFor="title"
            className="text-xs font-medium uppercase tracking-wide text-slate-300"
          >
            Title
          </label>
          <input
            id="title"
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full rounded-lg border border-slate-700 bg-slate-950/60 px-3 py-2 text-sm text-slate-100 outline-none focus:border-sky-500 focus:ring-1 focus:ring-sky-500"
            placeholder="e.g. Initial Notes on Flow State Literature"
          />
        </div>

        <div className="space-y-2">
          <label
            htmlFor="description"
            className="text-xs font-medium uppercase tracking-wide text-slate-300"
          >
            Description (Markdown supported)
          </label>
          <textarea
            id="description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={10}
            className="w-full rounded-lg border border-slate-700 bg-slate-950/60 px-3 py-2 text-sm text-slate-100 outline-none focus:border-sky-500 focus:ring-1 focus:ring-sky-500 font-mono"
            placeholder={`You can use Markdown here, for example:

# Big idea
- Key bullets
- Citations
- Questions to explore next
`}
          />
        </div>

        {errorMessage && (
          <p className="text-xs text-red-400">{errorMessage}</p>
        )}

        <div className="flex items-center justify-end gap-3">
          <Link
            href="/research"
            className="text-xs font-medium text-slate-400 hover:text-slate-200"
          >
            Cancel
          </Link>
          <button
            type="submit"
            disabled={isSubmitting}
            className="inline-flex items-center rounded-full bg-sky-600 px-4 py-2 text-sm font-medium text-white shadow hover:bg-sky-500 disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {isSubmitting ? 'Saving…' : 'Save Artifact'}
          </button>
        </div>
      </form>
    </div>
  );
}
