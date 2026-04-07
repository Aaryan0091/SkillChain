import BackButton from "@/components/BackButton";

export default function SubmitPage() {
  return (
    <main className="mx-auto flex min-h-screen w-full max-w-5xl flex-col px-6 py-10 pt-24 sm:px-10 sm:pt-32">
      <BackButton />
      <div className="space-y-3">
        <p className="text-sm font-medium uppercase tracking-[0.3em] text-muted">
          Repository Submission
        </p>
        <h1 className="text-4xl font-semibold tracking-tight">
          Connect a GitHub repository for analysis
        </h1>
        <p className="max-w-2xl text-base leading-7 text-muted">
          This route is ready for authenticated submissions, repository
          validation, job creation, and status polling from the backend.
        </p>
      </div>

      <section className="mt-10 rounded-[2rem] border border-border bg-surface p-8 backdrop-blur">
        <div className="grid gap-5 md:grid-cols-2">
          <div className="rounded-[1.5rem] bg-surface-strong p-5">
            <p className="text-sm font-medium text-muted">Repository URL</p>
            <div className="mt-3 rounded-2xl border border-border px-4 py-3 text-sm text-muted">
              https://github.com/username/project-name
            </div>
          </div>
          <div className="rounded-[1.5rem] bg-surface-strong p-5">
            <p className="text-sm font-medium text-muted">Analysis goals</p>
            <div className="mt-3 rounded-2xl border border-border px-4 py-3 text-sm text-muted">
              Backend skill, architecture quality, docs quality, test coverage
            </div>
          </div>
        </div>
        <div className="mt-6 rounded-3xl border border-dashed border-border p-5 text-sm leading-7 text-muted">
          Next step: wire this page to a protected Supabase session and POST the
          repository URL to the backend `/api/v1/projects` endpoint.
        </div>
      </section>
    </main>
  );
}
