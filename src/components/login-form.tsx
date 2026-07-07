"use client";

import { useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";

type LoginState =
  | { status: "idle"; message: null; verifyUrl: null }
  | { status: "submitting"; message: null; verifyUrl: null }
  | { status: "success"; message: string; verifyUrl: string | null }
  | { status: "error"; message: string; verifyUrl: null };

const initialState: LoginState = {
  status: "idle",
  message: null,
  verifyUrl: null,
};

export function LoginForm() {
  const searchParams = useSearchParams();
  const [state, setState] = useState<LoginState>(initialState);
  const initialError = searchParams.get("error");

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    const formData = new FormData(form);

    setState({ status: "submitting", message: null, verifyUrl: null });

    const response = await fetch("/api/auth/magic-link", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        email: formData.get("email"),
        isAdultVerified: formData.get("isAdultVerified") === "on",
      }),
    });
    const payload = await response.json();

    if (!response.ok) {
      const issueMessage = Array.isArray(payload.issues)
        ? payload.issues[0]?.message
        : null;

      setState({
        status: "error",
        message: issueMessage ?? payload.error ?? "Unable to send sign-in link.",
        verifyUrl: null,
      });
      return;
    }

    setState({
      status: "success",
      message: payload.message ?? "Check your email for a sign-in link.",
      verifyUrl: payload.verifyUrl ?? null,
    });
    form.reset();
  }

  return (
    <form className="grid gap-5" onSubmit={handleSubmit}>
      {initialError ? (
        <p className="rounded-md border border-amber-200 bg-warn-soft px-4 py-3 text-sm text-amber-950">
          That link expired or was already used. Request a new one below.
        </p>
      ) : null}

      <label className="grid gap-2">
        <span className="text-sm font-semibold">Email</span>
        <input
          autoComplete="email"
          className="min-h-11 rounded-md border border-line bg-surface px-4 text-base outline-none transition focus:border-accent"
          name="email"
          placeholder="you@example.com"
          required
          type="email"
        />
        <span className="text-sm leading-6 text-muted">
          Not sold, not shared, and never shown on requests or to helpers. Only
          used to send your sign-in link.
        </span>
      </label>

      <label className="flex items-start gap-3 text-sm leading-6">
        <input
          className="mt-1 size-4 accent-accent"
          name="isAdultVerified"
          required
          type="checkbox"
        />
        <span>I confirm I am 18 or older and will use ProofPing lawfully.</span>
      </label>

      <button
        className="inline-flex h-11 w-full items-center justify-center rounded-md bg-accent px-6 text-sm font-semibold text-white transition hover:bg-accent-strong disabled:cursor-not-allowed disabled:opacity-60 sm:w-fit"
        disabled={state.status === "submitting"}
        type="submit"
      >
        {state.status === "submitting" ? "Sending..." : "Email sign-in link"}
      </button>

      {state.status === "success" && state.message ? (
        <div className="grid gap-2 text-sm" role="status">
          <p className="font-medium">{state.message}</p>
          {state.verifyUrl ? (
            <>
              <p className="text-muted">Local development link:</p>
              <a
                className="break-all font-semibold text-accent-strong underline underline-offset-4"
                href={state.verifyUrl}
              >
                {state.verifyUrl}
              </a>
            </>
          ) : null}
        </div>
      ) : null}

      {state.status === "error" && state.message ? (
        <p className="text-sm font-medium text-amber-900" role="alert">
          {state.message}
        </p>
      ) : null}

      <p className="text-center text-sm text-muted sm:text-left">
        <Link className="font-semibold text-accent-strong hover:underline" href="/">
          Back to home
        </Link>
      </p>
    </form>
  );
}
