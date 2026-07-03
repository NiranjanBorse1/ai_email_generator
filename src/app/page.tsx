"use client";

import { useState } from "react";

export default function Home() {
  const [purpose, setPurpose] = useState("");
  const [recipient, setRecipient] = useState("");
  const [tone, setTone] = useState("");
  const [generatedEmail, setGeneratedEmail] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setGeneratedEmail("");
    setIsLoading(true);

    try {
      const response = await fetch("/api/generate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ purpose, recipient, tone }),
      });

      const data = (await response.json()) as {
        email?: string;
        error?: string;
        details?: string;
      };

      if (!response.ok) {
        throw new Error(data.error ?? data.details ?? "Failed to generate email.");
      }

      setGeneratedEmail(data.email ?? "");
    } catch (submitError) {
      const message = submitError instanceof Error ? submitError.message : "Something went wrong.";
      setError(message);
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <main className="relative min-h-screen overflow-hidden bg-[#07111f] text-white">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,_rgba(74,222,128,0.22),_transparent_36%),radial-gradient(circle_at_top_right,_rgba(96,165,250,0.2),_transparent_30%),linear-gradient(180deg,_#07111f_0%,_#0b1729_55%,_#08101d_100%)]" />
      <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[size:64px_64px] opacity-30" />

      <div className="relative mx-auto flex min-h-screen w-full max-w-6xl items-center px-6 py-12 sm:px-10 lg:px-12">
        <section className="grid w-full gap-10 lg:grid-cols-[1.05fr_0.95fr] lg:items-center">
          <div className="max-w-xl space-y-6">
            <span className="inline-flex items-center rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm font-medium text-emerald-200 shadow-[0_0_0_1px_rgba(255,255,255,0.03)] backdrop-blur">
              AI Email Generator
            </span>
            <div className="space-y-4">
              <h1 className="text-4xl font-semibold tracking-tight text-white sm:text-5xl lg:text-6xl">
                Write better emails faster with a simple prompt.
              </h1>
              <p className="max-w-lg text-base leading-7 text-slate-300 sm:text-lg">
                Tell the app what the email is for, who it is going to, and the tone you want. The generator will handle the draft next.
              </p>
            </div>

            <div className="grid gap-3 text-sm text-slate-300 sm:grid-cols-3">
              <div className="rounded-2xl border border-white/10 bg-white/5 p-4 backdrop-blur">
                Clear inputs
              </div>
              <div className="rounded-2xl border border-white/10 bg-white/5 p-4 backdrop-blur">
                Fast workflow
              </div>
              <div className="rounded-2xl border border-white/10 bg-white/5 p-4 backdrop-blur">
                Ready for Gemini
              </div>
            </div>
          </div>

          <div className="rounded-3xl border border-white/10 bg-white/10 p-4 shadow-2xl shadow-black/30 backdrop-blur-xl sm:p-6 lg:p-8">
            <div className="mb-6 space-y-2">
              <p className="text-sm font-medium uppercase tracking-[0.24em] text-emerald-200/90">
                Compose email
              </p>
              <h2 className="text-2xl font-semibold text-white">Generate your draft</h2>
            </div>

            <form className="space-y-5" onSubmit={handleSubmit}>
              <div className="space-y-2">
                <label htmlFor="purpose" className="text-sm font-medium text-slate-200">
                  Email purpose
                </label>
                <textarea
                  id="purpose"
                  name="purpose"
                  rows={4}
                  placeholder="Example: follow up after a product demo and ask for feedback"
                  value={purpose}
                  onChange={(event) => setPurpose(event.target.value)}
                  className="w-full rounded-2xl border border-white/10 bg-slate-950/40 px-4 py-3 text-sm text-white placeholder:text-slate-500 outline-none transition focus:border-emerald-300/60 focus:ring-4 focus:ring-emerald-300/10"
                />
              </div>

              <div className="space-y-2">
                <label htmlFor="recipient" className="text-sm font-medium text-slate-200">
                  Recipient
                </label>
                <input
                  id="recipient"
                  name="recipient"
                  type="text"
                  placeholder="Example: client, manager, sales lead"
                  value={recipient}
                  onChange={(event) => setRecipient(event.target.value)}
                  className="w-full rounded-2xl border border-white/10 bg-slate-950/40 px-4 py-3 text-sm text-white placeholder:text-slate-500 outline-none transition focus:border-emerald-300/60 focus:ring-4 focus:ring-emerald-300/10"
                />
              </div>

              <div className="space-y-2">
                <label htmlFor="tone" className="text-sm font-medium text-slate-200">
                  Tone
                </label>
                <select
                  id="tone"
                  name="tone"
                  value={tone}
                  onChange={(event) => setTone(event.target.value)}
                  className="w-full rounded-2xl border border-white/10 bg-slate-950/40 px-4 py-3 text-sm text-white outline-none transition focus:border-emerald-300/60 focus:ring-4 focus:ring-emerald-300/10"
                >
                  <option value="" disabled>
                    Select a tone
                  </option>
                  <option value="professional">Professional</option>
                  <option value="friendly">Friendly</option>
                  <option value="confident">Confident</option>
                  <option value="concise">Concise</option>
                </select>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="inline-flex w-full items-center justify-center rounded-2xl bg-emerald-400 px-5 py-3 text-sm font-semibold text-slate-950 transition hover:bg-emerald-300 focus:outline-none focus:ring-4 focus:ring-emerald-300/30"
              >
                {isLoading ? "Generating..." : "Generate"}
              </button>
            </form>

            {error ? (
              <p className="mt-5 rounded-2xl border border-rose-400/30 bg-rose-500/10 px-4 py-3 text-sm text-rose-200">
                {error}
              </p>
            ) : null}

            {generatedEmail ? (
              <div className="mt-5 space-y-2 rounded-2xl border border-emerald-400/20 bg-slate-950/40 px-4 py-4">
                <p className="text-sm font-medium uppercase tracking-[0.2em] text-emerald-200/90">
                  Generated email
                </p>
                <p className="whitespace-pre-wrap text-sm leading-7 text-slate-100">
                  {generatedEmail}
                </p>
              </div>
            ) : null}
          </div>
        </section>
      </div>
    </main>
  );
}
