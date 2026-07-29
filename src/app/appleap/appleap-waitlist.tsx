"use client";

import { useEffect, useId, useRef, useState, type FormEvent } from "react";
import "./appleap-waitlist.css";

// Sanity check only, not a validator — the server owns the real rules (see the
// API contract). This just saves a round trip on the most obviously-wrong input.
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const NOTE_MAX = 280;
const FALLBACK_EMAIL = "contact@everytech.io";

type Phase = "idle" | "pending" | "success" | "error";

interface WaitlistResponse {
  ok?: boolean;
  error?: string;
}

export function AppLeapWaitlist() {
  const [email, setEmail] = useState("");
  const [note, setNote] = useState("");
  const [phase, setPhase] = useState<Phase>("idle");
  const [message, setMessage] = useState("");
  // Separate from `phase` on purpose: a 429 or a dead network is an error, but the
  // email the user typed is fine. Painting the field red and telling a screen reader
  // it's invalid because the SERVER is unhappy is a lie about their input.
  const [emailInvalid, setEmailInvalid] = useState(false);

  const emailRef = useRef<HTMLInputElement>(null);
  const statusRef = useRef<HTMLParagraphElement>(null);

  const emailId = useId();
  const noteId = useId();
  const statusId = useId();

  const pending = phase === "pending";
  const done = phase === "success";
  const isError = phase === "error";

  // Disabling the submit button mid-flight can silently drop focus to <body> in
  // some browsers, which is exactly the kind of thing a screen reader user never
  // recovers from. Parking focus on the (always-focusable) status region instead
  // means the live-region announcement and the focus move happen together.
  useEffect(() => {
    if (phase !== "idle") statusRef.current?.focus();
  }, [phase]);

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (pending || done) return;

    const trimmed = email.trim();
    if (!EMAIL_RE.test(trimmed)) {
      setPhase("error");
      setEmailInvalid(true);
      setMessage("Enter a valid email address.");
      emailRef.current?.focus();
      return;
    }

    setPhase("pending");
    setEmailInvalid(false);
    setMessage("Joining the waitlist…");

    let res: Response;
    try {
      res = await fetch("/api/appleap/waitlist", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: trimmed, note: note.trim() || undefined }),
      });
    } catch {
      setPhase("error");
      setMessage(
        `Couldn't reach the waitlist — check your connection. Email ${FALLBACK_EMAIL} and we'll add you by hand.`,
      );
      return;
    }

    let data: WaitlistResponse = {};
    try {
      data = (await res.json()) as WaitlistResponse;
    } catch {
      // No JSON body (e.g. a proxy error page) — fall through to the
      // status-code handling below, which has a sane default for every branch.
    }

    // 200 is the ONLY success status, and it means the same thing whether the address
    // was new or already enrolled — the server deliberately refuses to tell us which,
    // so that a stranger can't use this form to test whether an address is on the list.
    // Say the one true thing we know, identically either way.
    if (res.status === 200 && data.ok) {
      setPhase("success");
      setMessage("You're on the list — we'll email you when a beta invite opens up.");
      return;
    }

    if (res.status === 400) {
      setPhase("error");
      setEmailInvalid(true);
      setMessage(
        typeof data.error === "string" && data.error
          ? data.error
          : "That didn't validate — check the email and try again.",
      );
      emailRef.current?.focus();
      return;
    }

    if (res.status === 429) {
      const retryAfter = Number(res.headers.get("Retry-After"));
      setPhase("error");
      setMessage(
        Number.isFinite(retryAfter) && retryAfter > 0
          ? `Too many requests — try again in about ${retryAfter}s.`
          : "Too many requests — try again shortly.",
      );
      return;
    }

    // 503, or any other status we don't have a specific branch for: treat it
    // the same as "the list is down," since that's the only honest thing to say.
    setPhase("error");
    setMessage(
      `The waitlist is temporarily unavailable. Email ${FALLBACK_EMAIL} directly and we'll add you by hand.`,
    );
  }

  return (
    <div className="waitlist">
      <form className="waitlist__form" onSubmit={handleSubmit} noValidate>
        <div className="waitlist__field">
          <label htmlFor={emailId}>Email</label>
          <input
            ref={emailRef}
            id={emailId}
            name="email"
            type="email"
            required
            autoComplete="email"
            placeholder="you@company.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            aria-invalid={emailInvalid}
            aria-describedby={message ? statusId : undefined}
            disabled={pending || done}
          />
        </div>

        <div className="waitlist__field">
          <label htmlFor={noteId}>
            What would you use it for? <span className="waitlist__hint">Optional</span>
          </label>
          <input
            id={noteId}
            name="note"
            type="text"
            maxLength={NOTE_MAX}
            placeholder="e.g. hand deep links to my agent"
            value={note}
            onChange={(e) => setNote(e.target.value)}
            disabled={pending || done}
          />
        </div>

        <button type="submit" className="btn waitlist__submit" disabled={pending || done}>
          {pending ? "Joining…" : done ? "You're on the list" : "Join the waitlist"}
        </button>
      </form>

      <p
        ref={statusRef}
        id={statusId}
        className={"waitlist__status" + (isError ? " waitlist__status--error" : "")}
        aria-live="polite"
        tabIndex={-1}
      >
        {message}
      </p>

      <p className="waitlist__fallback">
        Prefer email? Write to <a href={`mailto:${FALLBACK_EMAIL}`}>{FALLBACK_EMAIL}</a> and
        we&rsquo;ll add you by hand.
      </p>
    </div>
  );
}
