"use client";

import { useEffect, useId, useRef, useState, type ChangeEvent, type FormEvent } from "react";
import "./course-follow.css";

// Sanity check only, not a validator — the server owns the real rules (see the
// API contract). This just saves a round trip on the most obviously-wrong input.
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const FALLBACK_EMAIL = "contact@everytech.io";

const INVALID_MSG = "That doesn’t look like an email address. Check it and try again.";

type Phase = "idle" | "pending" | "success" | "error";

/** The one element we ever move focus to, resolved declaratively in an effect. */
type FocusTarget = "input" | "status" | null;

interface FollowResponse {
  ok?: boolean;
  error?: string;
}

export function CourseFollow() {
  const [email, setEmail] = useState("");
  const [phase, setPhase] = useState<Phase>("idle");
  const [message, setMessage] = useState("");
  // Separate from `phase` on purpose: a 429 or a dead network is an error, but the
  // email the user typed is fine. Painting the field red and telling a screen reader
  // it's invalid because the SERVER is unhappy is a lie about their input.
  const [emailInvalid, setEmailInvalid] = useState(false);
  // Focus is state, not a side effect scattered through the handler. Focusing
  // inline in the handler races the render that creates or destroys the target,
  // so name the target here and resolve it in an effect after commit.
  const [focusTarget, setFocusTarget] = useState<FocusTarget>(null);

  const emailRef = useRef<HTMLInputElement>(null);
  const statusRef = useRef<HTMLParagraphElement>(null);

  const emailId = useId();
  const statusId = useId();
  const noteId = useId();

  const pending = phase === "pending";
  const done = phase === "success";
  const isError = phase === "error";

  useEffect(() => {
    if (!focusTarget) return;
    if (focusTarget === "input") emailRef.current?.focus();
    else statusRef.current?.focus();
    setFocusTarget(null);
  }, [focusTarget]);

  function handleEmailChange(e: ChangeEvent<HTMLInputElement>) {
    setEmail(e.target.value);
    // The first keystroke after a rejected submit withdraws the complaint: the
    // value we objected to no longer exists, so keeping the field red (and the
    // error announced) is stale information the user has already acted on.
    if (emailInvalid) setEmailInvalid(false);
    if (isError) {
      setPhase("idle");
      setMessage("");
    }
  }

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (pending || done) return;

    const trimmed = email.trim();
    if (!EMAIL_RE.test(trimmed)) {
      setPhase("error");
      setEmailInvalid(true);
      setMessage(INVALID_MSG);
      setFocusTarget("input");
      return;
    }

    setPhase("pending");
    setEmailInvalid(false);
    setMessage("Adding you to the list…");
    setFocusTarget("status");

    let res: Response;
    try {
      res = await fetch("/api/courses/claude/follow", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: trimmed }),
      });
    } catch {
      setPhase("error");
      setMessage("Couldn’t reach the list. Check your connection and try again.");
      setFocusTarget("status");
      return;
    }

    let data: FollowResponse = {};
    try {
      data = (await res.json()) as FollowResponse;
    } catch {
      // No JSON body (e.g. a proxy error page) — fall through to the
      // status-code handling below, which has a sane default for every branch.
    }

    // 200 is the ONLY success status, and it means the same thing whether the address
    // was new or already following — the server deliberately refuses to tell us which,
    // so that a stranger can't use this form to test whether an address is on the list.
    // Say the one true thing we know, identically either way.
    if (res.status === 200 && data.ok) {
      setPhase("success");
      setMessage("You’re on the list. Day 2 lands in your inbox the day it publishes.");
      setFocusTarget("status");
      return;
    }

    if (res.status === 400) {
      // Deliberately ignores `data.error`: the server's token ("invalid email") is a
      // debugging string, not copy, and printing it verbatim leaks the shape of the
      // validator to anyone probing the endpoint.
      setPhase("error");
      setEmailInvalid(true);
      setMessage(INVALID_MSG);
      setFocusTarget("input");
      return;
    }

    if (res.status === 429) {
      const retryAfter = Number(res.headers.get("Retry-After"));
      setPhase("error");
      setMessage(
        Number.isFinite(retryAfter) && retryAfter > 0
          ? `Too many attempts. Try again in about ${retryAfter}s.`
          : "Too many attempts. Try again in a moment.",
      );
      setFocusTarget("status");
      return;
    }

    // 503, or any other status we don't have a specific branch for: treat it the
    // same as "the list is down," since that's the only honest thing to say.
    setPhase("error");
    setMessage(
      `The list is down for a moment. Email ${FALLBACK_EMAIL} and we’ll add you by hand.`,
    );
    setFocusTarget("status");
  }

  return (
    <div className="course-follow" id="get-day-2" tabIndex={-1}>
      <h3 className="course-follow__title">Get Day 2 when it lands</h3>
      <p className="course-follow__lead">
        The tools are running and you have not delegated anything yet. Day 2 explains the machine
        before you point it at your project. Leave your email and each day shows up the morning it
        publishes.
      </p>

      {/* On success the form is unmounted rather than disabled: there is nothing left
          to submit, and a disabled input still takes tab focus. The card collapses to
          title + confirmation + privacy note. */}
      {done ? null : (
        <form className="course-follow__form" onSubmit={handleSubmit} noValidate>
          <label htmlFor={emailId}>Email</label>
          <div className="course-follow__row">
            <input
              ref={emailRef}
              id={emailId}
              name="email"
              type="email"
              required
              autoComplete="email"
              inputMode="email"
              placeholder="you@example.com"
              value={email}
              onChange={handleEmailChange}
              aria-invalid={emailInvalid}
              // The privacy note is always part of the field's description; the status
              // joins it only once there is something to say.
              aria-describedby={message ? `${noteId} ${statusId}` : noteId}
              disabled={pending}
            />
            {/* Disabled only while a request is in flight. Disabling on an empty field
                never tells the user why it will not submit; let them submit and answer
                them in the status line instead. */}
            <button type="submit" className="btn course-follow__submit" disabled={pending}>
              {pending ? "Adding you…" : "Email me Day 2"}
            </button>
          </div>
        </form>
      )}

      {/* Kept mounted in every phase, outside the form: screen readers stop announcing
          a live region that unmounts and remounts. */}
      <p
        ref={statusRef}
        id={statusId}
        className={
          "course-follow__status" +
          (isError ? " course-follow__status--error" : "") +
          (done ? " course-follow__status--done" : "")
        }
        aria-live="polite"
        tabIndex={-1}
      >
        {message}
      </p>

      <p className="course-follow__note" id={noteId}>
        Six emails at most, one a day for the rest of the week. I don’t send anything else and I
        don’t pass your address on.
      </p>
    </div>
  );
}
