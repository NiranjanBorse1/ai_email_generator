"use client";

import type { Session } from "@supabase/supabase-js";
import { useEffect, useMemo, useState } from "react";

import { createSupabaseBrowserClient } from "@/lib/supabase/browser";

export default function Home() {
  const supabase = useMemo(() => createSupabaseBrowserClient(), []);
  const [theme, setTheme] = useState<"dark" | "light">("dark");
  const [session, setSession] = useState<Session | null>(null);
  const [isAuthReady, setIsAuthReady] = useState(false);
  const [authEmail, setAuthEmail] = useState("");
  const [authPassword, setAuthPassword] = useState("");
  const [authMessage, setAuthMessage] = useState("");
  const [authLoading, setAuthLoading] = useState(false);
  const [purpose, setPurpose] = useState("");
  const [recipient, setRecipient] = useState("");
  const [tone, setTone] = useState("");
  const [generatedEmail, setGeneratedEmail] = useState("");
  const [emailHistory, setEmailHistory] = useState<
    Array<{ id: string; text: string; createdAt: string }>
  >([]);
  const [showPreviousDrafts, setShowPreviousDrafts] = useState(false);
  const [historyLoading, setHistoryLoading] = useState(false);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [copyMessage, setCopyMessage] = useState("");

  useEffect(() => {
    const savedTheme = window.localStorage.getItem("theme");

    if (savedTheme === "dark" || savedTheme === "light") {
      setTheme(savedTheme);
    }
  }, []);

  useEffect(() => {
    window.localStorage.setItem("theme", theme);
    document.documentElement.style.colorScheme = theme;
  }, [theme]);

  useEffect(() => {
    if (!supabase) {
      setIsAuthReady(true);
      setAuthMessage("Add NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY to enable auth.");
      return;
    }

    let isMounted = true;

    supabase.auth
      .getSession()
      .then(({ data }) => {
        if (isMounted) {
          setSession(data.session);
          setIsAuthReady(true);
        }
      })
      .catch(() => {
        if (isMounted) {
          setIsAuthReady(true);
        }
      });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, nextSession) => {
      setSession(nextSession);
      setIsAuthReady(true);
    });

    return () => {
      isMounted = false;
      subscription.unsubscribe();
    };
  }, [supabase]);

  useEffect(() => {
    const supabaseClient = supabase;

    if (!supabaseClient || !session) {
      setEmailHistory([]);
      return;
    }

    const client = supabaseClient;

    let isMounted = true;

    async function loadEmailHistory() {
      setHistoryLoading(true);

      try {
        const { data, error: fetchError } = await client
          .from("email_drafts")
          .select("id,text,created_at")
          .order("created_at", { ascending: false })
          .limit(10);

        if (fetchError) {
          throw fetchError;
        }

        if (isMounted) {
          setEmailHistory(
            (data ?? []).map((draft) => ({
              id: draft.id,
              text: draft.text,
              createdAt: draft.created_at,
            })),
          );
        }
      } catch (historyError) {
        if (isMounted) {
          setAuthMessage(
            historyError instanceof Error
              ? `Could not load saved drafts: ${historyError.message}`
              : "Could not load saved drafts.",
          );
        }
      } finally {
        if (isMounted) {
          setHistoryLoading(false);
        }
      }
    }

    loadEmailHistory();

    return () => {
      isMounted = false;
    };
  }, [supabase, session]);

  const isDark = theme === "dark";
  const isAuthenticated = Boolean(session);

  const pageClasses = isDark
    ? "relative min-h-screen overflow-hidden bg-[#07111f] text-white"
    : "relative min-h-screen overflow-hidden bg-[#f7fafc] text-slate-900";

  const backgroundClasses = isDark
    ? "absolute inset-0 bg-[radial-gradient(circle_at_top_left,_rgba(74,222,128,0.22),_transparent_36%),radial-gradient(circle_at_top_right,_rgba(96,165,250,0.2),_transparent_30%),linear-gradient(180deg,_#07111f_0%,_#0b1729_55%,_#08101d_100%)]"
    : "absolute inset-0 bg-[radial-gradient(circle_at_top_left,_rgba(59,130,246,0.16),_transparent_36%),radial-gradient(circle_at_top_right,_rgba(16,185,129,0.14),_transparent_30%),linear-gradient(180deg,_#f8fbff_0%,_#eef4ff_55%,_#e8eef8_100%)]";

  const gridClasses = isDark
    ? "absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[size:64px_64px] opacity-30"
    : "absolute inset-0 bg-[linear-gradient(rgba(15,23,42,0.06)_1px,transparent_1px),linear-gradient(90deg,rgba(15,23,42,0.06)_1px,transparent_1px)] bg-[size:64px_64px] opacity-35";

  const pillClasses = isDark
    ? "inline-flex items-center rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm font-medium text-emerald-200 shadow-[0_0_0_1px_rgba(255,255,255,0.03)] backdrop-blur"
    : "inline-flex items-center rounded-full border border-slate-200 bg-white/80 px-4 py-2 text-sm font-medium text-slate-700 shadow-sm backdrop-blur";

  const heroTitleClasses = isDark
    ? "text-4xl font-semibold tracking-tight text-white sm:text-5xl lg:text-6xl"
    : "text-4xl font-semibold tracking-tight text-slate-950 sm:text-5xl lg:text-6xl";

  const heroTextClasses = isDark
    ? "max-w-lg text-base leading-7 text-slate-300 sm:text-lg"
    : "max-w-lg text-base leading-7 text-slate-600 sm:text-lg";

  const featureCardClasses = isDark
    ? "rounded-2xl border border-white/10 bg-white/5 p-4 backdrop-blur"
    : "rounded-2xl border border-slate-200 bg-white/80 p-4 text-slate-700 shadow-sm backdrop-blur";

  const panelClasses = isDark
    ? "rounded-3xl border border-white/10 bg-white/10 p-4 shadow-2xl shadow-black/30 backdrop-blur-xl sm:p-6 lg:p-8"
    : "rounded-3xl border border-slate-200 bg-white/85 p-4 shadow-xl shadow-slate-200/60 backdrop-blur-xl sm:p-6 lg:p-8";

  const sectionLabelClasses = isDark
    ? "text-sm font-medium uppercase tracking-[0.24em] text-emerald-200/90"
    : "text-sm font-medium uppercase tracking-[0.24em] text-sky-700";

  const sectionTitleClasses = isDark
    ? "text-2xl font-semibold text-white"
    : "text-2xl font-semibold text-slate-950";

  const labelClasses = isDark
    ? "text-sm font-medium text-slate-200"
    : "text-sm font-medium text-slate-700";

  const inputClasses = isDark
    ? "w-full rounded-2xl border border-white/10 bg-slate-950/40 px-4 py-3 text-sm text-white placeholder:text-slate-500 outline-none transition focus:border-emerald-300/60 focus:ring-4 focus:ring-emerald-300/10"
    : "w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 placeholder:text-slate-400 outline-none transition focus:border-sky-300 focus:ring-4 focus:ring-sky-100";

  const selectClasses = isDark
    ? "w-full rounded-2xl border border-white/10 bg-slate-950/40 px-4 py-3 text-sm text-white outline-none transition focus:border-emerald-300/60 focus:ring-4 focus:ring-emerald-300/10"
    : "w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-sky-300 focus:ring-4 focus:ring-sky-100";

  const buttonClasses = isDark
    ? "inline-flex w-full items-center justify-center rounded-2xl bg-emerald-400 px-5 py-3 text-sm font-semibold text-slate-950 transition hover:bg-emerald-300 focus:outline-none focus:ring-4 focus:ring-emerald-300/30"
    : "inline-flex w-full items-center justify-center rounded-2xl bg-sky-500 px-5 py-3 text-sm font-semibold text-white transition hover:bg-sky-400 focus:outline-none focus:ring-4 focus:ring-sky-200";

  const errorClasses = isDark
    ? "mt-5 rounded-2xl border border-rose-400/30 bg-rose-500/10 px-4 py-3 text-sm text-rose-200"
    : "mt-5 rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700";

  const outputPanelClasses = isDark
    ? "mt-5 space-y-2 rounded-2xl border border-emerald-400/20 bg-slate-950/40 px-4 py-4"
    : "mt-5 space-y-2 rounded-2xl border border-sky-200 bg-sky-50/80 px-4 py-4";

  const outputLabelClasses = isDark
    ? "text-sm font-medium uppercase tracking-[0.2em] text-emerald-200/90"
    : "text-sm font-medium uppercase tracking-[0.2em] text-sky-700";

  const outputTextClasses = isDark
    ? "whitespace-pre-wrap text-sm leading-7 text-slate-100"
    : "whitespace-pre-wrap text-sm leading-7 text-slate-800";

  const copyButtonClasses = isDark
    ? "rounded-full border border-emerald-300/30 px-3 py-1 text-xs font-medium text-emerald-100 transition hover:bg-emerald-300/10"
    : "rounded-full border border-sky-300 px-3 py-1 text-xs font-medium text-sky-700 transition hover:bg-sky-100";

  const copyMessageClasses = isDark ? "text-xs text-emerald-200" : "text-xs text-sky-700";

  const themeToggleClasses = isDark
    ? "inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm font-medium text-white transition hover:bg-white/10"
    : "inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-800 shadow-sm transition hover:bg-slate-50";

  const authShellClasses = isDark
    ? "rounded-3xl border border-white/10 bg-slate-950/40 p-4 backdrop-blur"
    : "rounded-3xl border border-slate-200 bg-slate-50/90 p-4 backdrop-blur";

  const authInputClasses = isDark
    ? "w-full rounded-2xl border border-white/10 bg-slate-950/60 px-4 py-3 text-sm text-white placeholder:text-slate-500 outline-none transition focus:border-emerald-300/60 focus:ring-4 focus:ring-emerald-300/10"
    : "w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 placeholder:text-slate-400 outline-none transition focus:border-sky-300 focus:ring-4 focus:ring-sky-100";

  const authButtonPrimaryClasses = isDark
    ? "inline-flex w-full items-center justify-center rounded-2xl bg-emerald-400 px-5 py-3 text-sm font-semibold text-slate-950 transition hover:bg-emerald-300 focus:outline-none focus:ring-4 focus:ring-emerald-300/30"
    : "inline-flex w-full items-center justify-center rounded-2xl bg-sky-500 px-5 py-3 text-sm font-semibold text-white transition hover:bg-sky-400 focus:outline-none focus:ring-4 focus:ring-sky-200";

  const authButtonSecondaryClasses = isDark
    ? "inline-flex w-full items-center justify-center rounded-2xl border border-white/10 bg-white/5 px-5 py-3 text-sm font-semibold text-white transition hover:bg-white/10 focus:outline-none focus:ring-4 focus:ring-white/10"
    : "inline-flex w-full items-center justify-center rounded-2xl border border-slate-200 bg-white px-5 py-3 text-sm font-semibold text-slate-800 transition hover:bg-slate-50 focus:outline-none focus:ring-4 focus:ring-slate-200";

  const authNoticeClasses = isDark
    ? "rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-slate-200"
    : "rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-700";

  const authMessageClasses = isDark
    ? "mt-3 rounded-2xl border border-emerald-400/20 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-100"
    : "mt-3 rounded-2xl border border-sky-200 bg-sky-50 px-4 py-3 text-sm text-sky-700";

  const signedInCardClasses = isDark
    ? "rounded-2xl border border-emerald-400/20 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-100"
    : "rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800";

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setGeneratedEmail("");
    setCopyMessage("");
    setIsLoading(true);

    try {
      const response = await fetch("/api/generate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: session?.access_token ? `Bearer ${session.access_token}` : "",
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

      const nextEmail = data.email ?? "";

      setGeneratedEmail(nextEmail);

      if (supabase && session) {
        const { data: insertedDraft, error: insertError } = await supabase
          .from("email_drafts")
          .insert({
            user_id: session.user.id,
            text: nextEmail,
          })
          .select("id,text,created_at")
          .single();

        if (insertError) {
          throw insertError;
        }

        if (insertedDraft) {
          setEmailHistory((currentHistory) =>
            [
              { id: insertedDraft.id, text: insertedDraft.text, createdAt: insertedDraft.created_at },
              ...currentHistory,
            ].slice(0, 10),
          );
          setShowPreviousDrafts(true);
        }
      }
    } catch (submitError) {
      const message = submitError instanceof Error ? submitError.message : "Something went wrong.";
      setError(message);
    } finally {
      setIsLoading(false);
    }
  }

  async function handleCopyEmail() {
    if (!generatedEmail) {
      return;
    }

    try {
      await navigator.clipboard.writeText(generatedEmail);
      setCopyMessage("Copied to clipboard");
    } catch {
      setCopyMessage("Copy failed");
    }
  }

  async function handleAuth(action: "signin" | "signup") {
    if (!supabase) {
      setAuthMessage("Supabase is not configured yet. Add the env variables first.");
      return;
    }

    setAuthMessage("");
    setAuthLoading(true);

    try {
      const trimmedEmail = authEmail.trim();

      if (!trimmedEmail || !authPassword.trim()) {
        throw new Error("Enter both email and password.");
      }

      const result =
        action === "signin"
          ? await supabase.auth.signInWithPassword({
              email: trimmedEmail,
              password: authPassword,
            })
          : await supabase.auth.signUp({
              email: trimmedEmail,
              password: authPassword,
            });

      if (result.error) {
        throw result.error;
      }

      if (result.data.session) {
        setSession(result.data.session);
        setAuthPassword("");
        setAuthMessage(action === "signin" ? "Signed in successfully." : "Signed up and signed in successfully.");
        return;
      }

      setAuthMessage(
        action === "signup"
          ? "Check your inbox to confirm your account before signing in."
          : "Signed in successfully.",
      );
    } catch (authError) {
      const message = authError instanceof Error ? authError.message : "Authentication failed.";
      setAuthMessage(message);
    } finally {
      setAuthLoading(false);
    }
  }

  async function handleSignOut() {
    if (!supabase) {
      return;
    }

    setAuthMessage("");
    await supabase.auth.signOut();
    setSession(null);
    setGeneratedEmail("");
    setCopyMessage("");
    setEmailHistory([]);
    setShowPreviousDrafts(false);
  }

  async function handleDeleteDraft(draftId: string) {
    if (!supabase) {
      return;
    }

    const { error: deleteError } = await supabase.from("email_drafts").delete().eq("id", draftId);

    if (deleteError) {
      setAuthMessage(`Could not delete draft: ${deleteError.message}`);
      return;
    }

    setEmailHistory((currentHistory) => currentHistory.filter((draft) => draft.id !== draftId));
  }

  return (
    <main className={pageClasses}>
      <div className={backgroundClasses} />
      <div className={gridClasses} />

      <div className="relative mx-auto flex min-h-screen w-full max-w-6xl items-center px-6 py-12 sm:px-10 lg:px-12">
        <section className="grid w-full gap-10 lg:grid-cols-[1.05fr_0.95fr] lg:items-center">
          <div className="max-w-xl space-y-6">
            <div className="flex flex-wrap items-center gap-3">
              <span className={pillClasses}>AI Email Generator</span>
              <button
                type="button"
                onClick={() => setTheme(isDark ? "light" : "dark")}
                className={themeToggleClasses}
              >
                <span>{isDark ? "🌙" : "☀️"}</span>
                <span>{isDark ? "Dark mode" : "Light mode"}</span>
              </button>
            </div>
            <div className="space-y-4">
              <h1 className={heroTitleClasses}>Write better emails faster with a simple prompt.</h1>
              <p className={heroTextClasses}>
                Tell the app what the email is for, who it is going to, and the tone you want. The generator will handle the draft next.
              </p>
            </div>

            <div className="grid gap-3 text-sm sm:grid-cols-3">
              <div className={featureCardClasses}>Clear inputs</div>
              <div className={featureCardClasses}>Fast workflow</div>
              <div className={featureCardClasses}>Ready for Supabase auth</div>
            </div>
          </div>

          <div className={panelClasses}>
            <div className="mb-6 space-y-2">
              <p className={sectionLabelClasses}>Compose email</p>
              <h2 className={sectionTitleClasses}>Generate your draft</h2>
            </div>

            <div className="space-y-4">
              {isAuthenticated ? (
                <div className={signedInCardClasses}>
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <p className="font-medium">Signed in</p>
                      <p className="text-xs opacity-80">{session?.user.email ?? "Authenticated user"}</p>
                    </div>
                    <button type="button" onClick={handleSignOut} className={copyButtonClasses}>
                      Sign out
                    </button>
                  </div>
                </div>
              ) : (
                <div className={authShellClasses}>
                  <div className="space-y-3">
                    <p className={sectionLabelClasses}>Supabase auth</p>
                    <p className={isDark ? "text-sm text-slate-200" : "text-sm text-slate-700"}>
                      Sign in or create an account to use the generator.
                    </p>
                  </div>

                  <div className="mt-4 space-y-3">
                    <input
                      type="email"
                      value={authEmail}
                      onChange={(event) => setAuthEmail(event.target.value)}
                      placeholder="Email address"
                      className={authInputClasses}
                    />
                    <input
                      type="password"
                      value={authPassword}
                      onChange={(event) => setAuthPassword(event.target.value)}
                      placeholder="Password"
                      className={authInputClasses}
                    />
                    <div className="grid gap-3 sm:grid-cols-2">
                      <button
                        type="button"
                        onClick={() => handleAuth("signin")}
                        disabled={authLoading || !isAuthReady}
                        className={authButtonPrimaryClasses}
                      >
                        {authLoading ? "Please wait..." : "Sign in"}
                      </button>
                      <button
                        type="button"
                        onClick={() => handleAuth("signup")}
                        disabled={authLoading || !isAuthReady}
                        className={authButtonSecondaryClasses}
                      >
                        Create account
                      </button>
                    </div>
                  </div>

                  {!isAuthReady ? <p className={authNoticeClasses}>Checking authentication session...</p> : null}

                  {authMessage ? <p className={authMessageClasses}>{authMessage}</p> : null}
                </div>
              )}
            </div>

            <form className="mt-6 space-y-5" onSubmit={handleSubmit}>
              <div className="space-y-2">
                <label htmlFor="purpose" className={labelClasses}>
                  Email purpose
                </label>
                <textarea
                  id="purpose"
                  name="purpose"
                  rows={4}
                  placeholder="Example: follow up after a product demo and ask for feedback"
                  value={purpose}
                  onChange={(event) => setPurpose(event.target.value)}
                  className={inputClasses}
                />
              </div>

              <div className="space-y-2">
                <label htmlFor="recipient" className={labelClasses}>
                  Recipient
                </label>
                <input
                  id="recipient"
                  name="recipient"
                  type="text"
                  placeholder="Example: client, manager, sales lead"
                  value={recipient}
                  onChange={(event) => setRecipient(event.target.value)}
                  className={inputClasses}
                />
              </div>

              <div className="space-y-2">
                <label htmlFor="tone" className={labelClasses}>
                  Tone
                </label>
                <select
                  id="tone"
                  name="tone"
                  value={tone}
                  onChange={(event) => setTone(event.target.value)}
                  className={selectClasses}
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

              <button type="submit" disabled={isLoading || !isAuthenticated} className={buttonClasses}>
                {!isAuthenticated ? "Sign in to generate" : isLoading ? "Generating..." : "Generate"}
              </button>
            </form>

            {error ? <p className={errorClasses}>{error}</p> : null}

            {generatedEmail ? (
              <div className={outputPanelClasses}>
                <div className="flex items-center justify-between gap-3">
                  <p className={outputLabelClasses}>Generated email</p>
                  <button type="button" onClick={handleCopyEmail} className={copyButtonClasses}>
                    Copy
                  </button>
                </div>
                <p className={outputTextClasses}>{generatedEmail}</p>
                {copyMessage ? <p className={copyMessageClasses}>{copyMessage}</p> : null}
              </div>
            ) : null}

            <div className="mt-5 flex items-center justify-between gap-3">
              <p className={isDark ? "text-sm text-slate-300" : "text-sm text-slate-600"}>
                Saved drafts from this profile
              </p>
              <button
                type="button"
                onClick={() => setShowPreviousDrafts((currentValue) => !currentValue)}
                disabled={!isAuthenticated || emailHistory.length === 0}
                className={copyButtonClasses}
              >
                {showPreviousDrafts ? "Hide previous drafts" : "Show previous drafts"}
              </button>
            </div>

            {showPreviousDrafts && emailHistory.length > 0 ? (
              <div
                className={
                  isDark
                    ? "mt-5 rounded-2xl border border-white/10 bg-white/5 p-4"
                    : "mt-5 rounded-2xl border border-slate-200 bg-white p-4"
                }
              >
                <p className={outputLabelClasses}>Previous drafts</p>
                {historyLoading ? (
                  <p className={isDark ? "mt-3 text-sm text-slate-400" : "mt-3 text-sm text-slate-500"}>
                    Loading saved drafts...
                  </p>
                ) : null}
                <div className="mt-3 space-y-3">
                  {emailHistory.map((item, index) => (
                    <div
                      key={`${item.createdAt}-${index}`}
                      className={
                        isDark
                          ? "rounded-2xl border border-white/10 bg-slate-950/40 px-4 py-3"
                          : "rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3"
                      }
                    >
                      <p className={isDark ? "text-xs text-slate-400" : "text-xs text-slate-500"}>
                        {new Date(item.createdAt).toLocaleString()}
                      </p>
                      <p
                        className={
                          isDark
                            ? "mt-2 whitespace-pre-wrap text-sm leading-6 text-slate-100"
                            : "mt-2 whitespace-pre-wrap text-sm leading-6 text-slate-800"
                        }
                      >
                        {item.text}
                      </p>
                      <div className="mt-3 flex items-center justify-between gap-3">
                        <p className={isDark ? "text-xs text-slate-400" : "text-xs text-slate-500"}>
                          {new Date(item.createdAt).toLocaleString()}
                        </p>
                        <button
                          type="button"
                          onClick={() => handleDeleteDraft(item.id)}
                          className={copyButtonClasses}
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ) : showPreviousDrafts ? (
              <p className={isDark ? "mt-4 text-sm text-slate-400" : "mt-4 text-sm text-slate-500"}>
                No previous drafts saved yet.
              </p>
            ) : null}

            {!isAuthenticated ? (
              <p className={isDark ? "mt-4 text-xs text-slate-400" : "mt-4 text-xs text-slate-500"}>
                The generator is locked until you sign in with Supabase auth.
              </p>
            ) : null}
          </div>
        </section>
      </div>
    </main>
  );
}
