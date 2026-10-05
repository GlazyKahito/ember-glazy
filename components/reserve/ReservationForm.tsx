"use client";

import { AnimatePresence, motion } from "motion/react";
import { useEffect, useRef, useState, type FormEvent } from "react";
import { FlameMark } from "@/components/FlameMark";
import { ease } from "@/components/motion";
import { dayNames, formatMinutes, longDate, nextDays, slotsFor } from "@/lib/hours";
import {
  fieldOrder,
  loadValidator,
  NOTES_MAX,
  normalisePhone,
  seatingOptions,
  type Errors,
  type Field,
  type ReservationInput,
} from "@/lib/reservation";
import { useNowMinutes, useTodayIso } from "@/lib/use-client-value";

const empty: ReservationInput = {
  date: "",
  time: "",
  party: "2",
  name: "",
  phone: "",
  seating: "any",
  notes: "",
};

const labels: Record<Field, string> = {
  date: "Day",
  time: "Time",
  party: "Guests",
  name: "Name",
  phone: "Mobile number",
  notes: "Requests",
};

const DAYS = 14;

function focusField(field: Field) {
  const byId: Partial<Record<Field, string>> = { name: "res-name", phone: "res-phone", notes: "res-notes" };
  const id = byId[field];
  if (id) {
    document.getElementById(id)?.focus();
    return;
  }
  const group = document.getElementById(`res-${field}`);
  const target =
    group?.querySelector<HTMLInputElement>("input:checked:not(:disabled)") ??
    group?.querySelector<HTMLInputElement>("input:not(:disabled)");
  (target ?? group)?.focus();
}

function ErrorText({ id, message }: { id: string; message?: string }) {
  return (
    <AnimatePresence initial={false}>
      {message ? (
        <motion.p
          id={id}
          className="mt-2 flex items-center gap-1.5 text-sm text-danger"
          initial={{ opacity: 0, y: -4 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.25 }}
        >
          <svg viewBox="0 0 16 16" className="size-3.5 shrink-0" aria-hidden="true">
            <circle cx="8" cy="8" r="7" fill="none" stroke="currentColor" strokeWidth="1.5" />
            <path d="M8 4.5v4.2M8 10.8v.7" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
          </svg>
          {message}
        </motion.p>
      ) : null}
    </AnimatePresence>
  );
}

function Legend({ step, children, aside }: { step: string; children: string; aside?: string }) {
  return (
    <legend className="mb-3 flex w-full items-baseline justify-between gap-4 text-sm">
      <span className="flex items-baseline gap-2.5 text-cream">
        <span className="text-[0.68rem] tracking-[0.16em] text-ember tabular-nums">{step}</span>
        <span className="font-medium">{children}</span>
      </span>
      {aside ? <span className="text-xs text-muted">{aside}</span> : null}
    </legend>
  );
}

export function ReservationForm() {
  const today = useTodayIso();
  const nowMinutes = useNowMinutes();
  const [values, setValues] = useState<ReservationInput>(empty);
  const [errors, setErrors] = useState<Errors>({});
  const [attempted, setAttempted] = useState(false);
  const [status, setStatus] = useState<"idle" | "sending" | "done">("idle");
  const [confirmed, setConfirmed] = useState<ReservationInput | null>(null);
  const timer = useRef(0);

  useEffect(() => {
    const pending = timer;
    return () => window.clearTimeout(pending.current);
  }, []);

  const days = today ? nextDays(today, DAYS) : null;
  const slots = values.date ? slotsFor(values.date) : [];
  const errorCount = Object.keys(errors).length;

  const update = <K extends keyof ReservationInput>(key: K, value: ReservationInput[K]) => {
    const next = { ...values, [key]: value };
    if (key === "date" && next.time && !slotsFor(String(value)).some((s) => String(s.minutes) === next.time)) {
      next.time = "";
    }
    setValues(next);
    // After the first submit the rules are already loaded, so this settles within the same frame.
    if (attempted) void loadValidator().then((validate) => setErrors(validate(next, today, nowMinutes)), () => {});
  };

  const onSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (status === "sending") return;
    let validate;
    try {
      validate = await loadValidator();
    } catch {
      return; // offline before the rules arrived: the next submit retries
    }
    const found = validate(values, today, nowMinutes);
    setAttempted(true);
    setErrors(found);
    const first = fieldOrder.find((f) => found[f]);
    if (first) {
      focusField(first);
      return;
    }
    setStatus("sending");
    timer.current = window.setTimeout(() => {
      setConfirmed(values);
      setStatus("done");
    }, 900);
  };

  const reset = () => {
    setValues(empty);
    setErrors({});
    setAttempted(false);
    setConfirmed(null);
    setStatus("idle");
  };

  const describe = (field: Field, extra?: string) =>
    [errors[field] ? `res-${field}-error` : null, extra].filter(Boolean).join(" ") || undefined;

  return (
    <div className="relative overflow-hidden rounded-[1.75rem] border border-[var(--line)] bg-ash/70 shadow-[0_40px_120px_-40px_rgb(0_0_0/0.8)]">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 -top-px h-px bg-linear-to-r from-transparent via-ember/70 to-transparent"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -top-40 left-1/2 h-64 w-[80%] -translate-x-1/2 rounded-full bg-[radial-gradient(closest-side,rgb(255_107_44/0.16),transparent)]"
      />

      <AnimatePresence mode="wait" initial={false}>
        {status === "done" && confirmed ? (
          <motion.div
            key="done"
            className="relative p-6 sm:p-10"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.7, ease }}
          >
            <FlameMark id="flame-confirm" className="size-10" />
            <h3
              tabIndex={-1}
              ref={(el) => el?.focus()}
              className="mt-6 font-display text-[clamp(2rem,4vw,3rem)] leading-[1.02] text-cream outline-none"
            >
              See you by the fire, {confirmed.name.trim().split(/\s+/)[0]}.
            </h3>
            <p className="mt-3 text-parchment">Here is the table we would hold for you.</p>

            <dl className="mt-8 grid grid-cols-2 gap-px overflow-hidden rounded-2xl border border-[var(--line)] bg-[var(--line)] text-sm">
              {[
                ["Day", longDate(confirmed.date)],
                ["Time", formatMinutes(Number(confirmed.time))],
                ["Guests", `${confirmed.party} ${confirmed.party === "1" ? "guest" : "guests"}`],
                ["Seating", seatingOptions.find((s) => s.value === confirmed.seating)?.label ?? ""],
                ["Name", confirmed.name.trim()],
                ["Mobile", `+91 ${normalisePhone(confirmed.phone).replace(/(\d{5})(\d{5})/, "$1 $2")}`],
              ].map(([k, v]) => (
                <div key={k} className="bg-ash px-4 py-4">
                  <dt className="text-xs tracking-[0.14em] text-muted uppercase">{k}</dt>
                  <dd className="mt-1.5 text-cream">{v}</dd>
                </div>
              ))}
            </dl>
            {confirmed.notes.trim() ? (
              <p className="mt-4 rounded-2xl border border-[var(--line)] px-4 py-3 text-sm text-parchment">
                <span className="text-muted">Your note: </span>
                {confirmed.notes.trim()}
              </p>
            ) : null}

            <div className="mt-6 flex gap-3 rounded-2xl border border-ember/40 bg-ember/10 p-4 text-sm leading-relaxed text-cream">
              <span aria-hidden="true" className="mt-1 size-2 shrink-0 rounded-full bg-ember" />
              <p>
                <strong className="font-semibold">This is a concept demo.</strong> Ember is not a real restaurant, so no
                booking was made and nothing you entered left your browser.
              </p>
            </div>

            <button type="button" onClick={reset} className="btn btn-ghost mt-8">
              Make another booking
            </button>
          </motion.div>
        ) : (
          <motion.form
            key="form"
            noValidate
            onSubmit={onSubmit}
            // Fetch the rules as soon as someone starts on the form, well before they submit.
            onFocus={() => void loadValidator().catch(() => {})}
            aria-describedby="res-concept"
            className="relative flex flex-col gap-8 p-5 sm:p-8 lg:p-10"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.5, ease }}
          >
            <AnimatePresence initial={false}>
              {attempted && errorCount > 0 ? (
                <motion.div
                  key="summary"
                  role="alert"
                  className="rounded-2xl border border-danger/40 bg-danger/10 p-4 text-sm"
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.35, ease }}
                >
                  <p className="font-medium text-cream">
                    {errorCount === 1 ? "One thing to fix" : `${errorCount} things to fix`} before we hold your table:
                  </p>
                  <ul className="mt-2 flex flex-col gap-1">
                    {fieldOrder
                      .filter((f) => errors[f])
                      .map((f) => (
                        <li key={f}>
                          <a
                            href={`#res-${f}`}
                            onClick={(ev) => {
                              ev.preventDefault();
                              focusField(f);
                            }}
                            className="text-danger underline decoration-danger/40 underline-offset-4 hover:decoration-danger"
                          >
                            {labels[f]}: {errors[f]}
                          </a>
                        </li>
                      ))}
                  </ul>
                </motion.div>
              ) : null}
            </AnimatePresence>

            <fieldset
              id="res-date"
              tabIndex={-1}
              aria-invalid={errors.date ? true : undefined}
              aria-describedby={describe("date")}
              className="outline-none"
            >
              <Legend
                step="01"
                aside={
                  days ? `${days[0].month} – ${days[days.length - 1].month}`.replace(/^(\w+) – \1$/, "$1") : undefined
                }
              >
                Pick a day
              </Legend>
              <div className="grid grid-cols-7 gap-1.5 sm:gap-2">
                {days
                  ? days.map((d) => (
                      <label key={d.iso} className="chip h-[4.25rem]">
                        <input
                          type="radio"
                          name="date"
                          value={d.iso}
                          checked={values.date === d.iso}
                          disabled={d.closed}
                          onChange={() => update("date", d.iso)}
                          aria-label={`${dayNames[d.weekday]} ${d.date} ${d.month}${d.closed ? ", closed" : ""}${d.iso === today ? ", today" : ""}`}
                        />
                        <span className="chip-face gap-0.5 text-center">
                          <span className="text-[0.6rem] tracking-[0.1em] uppercase opacity-75 sm:text-[0.62rem] sm:tracking-[0.12em]">
                            {dayNames[d.weekday].slice(0, 3)}
                          </span>
                          <span className="font-display text-xl leading-none">{d.date}</span>
                          {d.closed ? (
                            <span className="text-[0.5rem] tracking-[0.08em] uppercase sm:text-[0.55rem]">Closed</span>
                          ) : d.iso === today ? (
                            <span className="text-[0.5rem] tracking-[0.08em] text-flame uppercase sm:text-[0.55rem]">
                              Today
                            </span>
                          ) : null}
                        </span>
                      </label>
                    ))
                  : Array.from({ length: DAYS }, (_, i) => (
                      <span
                        key={i}
                        aria-hidden="true"
                        className="h-[4.25rem] animate-pulse rounded-xl border border-[var(--line)] bg-cream/[0.03]"
                      />
                    ))}
              </div>
              <ErrorText id="res-date-error" message={errors.date} />
            </fieldset>

            <fieldset
              id="res-time"
              tabIndex={-1}
              aria-invalid={errors.time ? true : undefined}
              aria-describedby={describe("time")}
              className="outline-none"
            >
              <Legend step="02" aside={values.date ? longDate(values.date) : undefined}>
                Choose a time
              </Legend>
              {values.date ? (
                <div className="flex flex-col gap-4">
                  {(["Lunch", "Dinner"] as const).map((service) => {
                    const list = slots.filter((s) => s.service === service);
                    if (!list.length) return null;
                    return (
                      <div key={service}>
                        <p className="mb-2 text-xs tracking-[0.14em] text-muted uppercase">{service}</p>
                        <div className="grid grid-cols-4 gap-1.5 sm:grid-cols-6 sm:gap-2">
                          {list.map((s) => {
                            const past = values.date === today && nowMinutes !== null && s.minutes < nowMinutes + 60;
                            return (
                              <label key={s.minutes} className="chip h-11">
                                <input
                                  type="radio"
                                  name="time"
                                  value={s.minutes}
                                  checked={values.time === String(s.minutes)}
                                  disabled={past}
                                  onChange={() => update("time", String(s.minutes))}
                                />
                                <span className="chip-face text-sm">{formatMinutes(s.minutes)}</span>
                              </label>
                            );
                          })}
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <p className="rounded-xl border border-dashed border-[var(--line-strong)] px-4 py-4 text-sm text-muted">
                  Pick a day first and the open seatings appear here.
                </p>
              )}
              <ErrorText id="res-time-error" message={errors.time} />
            </fieldset>

            <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.15fr)]">
              <fieldset
                id="res-party"
                tabIndex={-1}
                aria-invalid={errors.party ? true : undefined}
                aria-describedby={describe("party", "res-party-hint")}
                className="outline-none"
              >
                <Legend step="03">Guests</Legend>
                <div className="grid grid-cols-8 gap-1.5 lg:grid-cols-4 lg:gap-2">
                  {Array.from({ length: 8 }, (_, i) => String(i + 1)).map((n) => (
                    <label key={n} className="chip h-11">
                      <input
                        type="radio"
                        name="party"
                        value={n}
                        checked={values.party === n}
                        onChange={() => update("party", n)}
                        aria-label={`${n} ${n === "1" ? "guest" : "guests"}`}
                      />
                      <span className="chip-face font-display text-lg tabular-nums">{n}</span>
                    </label>
                  ))}
                </div>
                <p id="res-party-hint" className="mt-2 text-xs text-muted">
                  More than eight? Say so in your request and we will set the hearth counter.
                </p>
                <ErrorText id="res-party-error" message={errors.party} />
              </fieldset>

              <fieldset>
                <Legend step="04">Seating</Legend>
                <div className="grid grid-cols-3 gap-1.5 lg:gap-2">
                  {seatingOptions.map((s) => (
                    <label key={s.value} className="chip min-h-[4.25rem]">
                      <input
                        type="radio"
                        name="seating"
                        value={s.value}
                        checked={values.seating === s.value}
                        onChange={() => update("seating", s.value)}
                      />
                      <span className="chip-face px-1.5 py-2 text-center">
                        <span className="text-[0.8rem] leading-tight font-medium sm:text-sm">{s.label}</span>
                        <span className="mt-0.5 text-[0.65rem] leading-tight text-muted">{s.note}</span>
                      </span>
                    </label>
                  ))}
                </div>
              </fieldset>
            </div>

            <div className="grid gap-5 sm:grid-cols-2">
              <div>
                <label htmlFor="res-name" className="mb-2 flex items-baseline gap-2.5 text-sm font-medium text-cream">
                  <span className="text-[0.68rem] tracking-[0.16em] text-ember">05</span> Name
                </label>
                <input
                  id="res-name"
                  name="name"
                  type="text"
                  autoComplete="name"
                  className="field"
                  placeholder="Who is the table for?"
                  value={values.name}
                  onChange={(e) => update("name", e.target.value)}
                  aria-invalid={errors.name ? true : undefined}
                  aria-describedby={describe("name")}
                  aria-required="true"
                />
                <ErrorText id="res-name-error" message={errors.name} />
              </div>
              <div>
                <label htmlFor="res-phone" className="mb-2 flex items-baseline gap-2.5 text-sm font-medium text-cream">
                  <span className="text-[0.68rem] tracking-[0.16em] text-ember">06</span> Mobile number
                </label>
                <div className="relative">
                  <span
                    aria-hidden="true"
                    className="pointer-events-none absolute top-1/2 left-4 -translate-y-1/2 text-parchment"
                  >
                    +91
                  </span>
                  <input
                    id="res-phone"
                    name="phone"
                    type="tel"
                    inputMode="tel"
                    autoComplete="tel-national"
                    className="field pl-[3.25rem] tabular-nums"
                    placeholder="98200 00000"
                    value={values.phone}
                    onChange={(e) => update("phone", e.target.value)}
                    aria-invalid={errors.phone ? true : undefined}
                    aria-describedby={describe("phone")}
                    aria-required="true"
                  />
                </div>
                <ErrorText id="res-phone-error" message={errors.phone} />
              </div>
            </div>

            <div>
              <label
                htmlFor="res-notes"
                className="mb-2 flex items-baseline justify-between gap-2.5 text-sm font-medium text-cream"
              >
                <span className="flex items-baseline gap-2.5">
                  <span className="text-[0.68rem] tracking-[0.16em] text-ember">07</span> Special requests
                  <span className="font-normal text-muted">(optional)</span>
                </span>
                <span
                  id="res-notes-count"
                  className={`text-xs font-normal tabular-nums ${values.notes.length > NOTES_MAX ? "text-danger" : "text-muted"}`}
                >
                  {values.notes.length}/{NOTES_MAX}
                </span>
              </label>
              <textarea
                id="res-notes"
                name="notes"
                rows={3}
                className="field"
                placeholder="Allergies, a birthday, a seat by the fire…"
                value={values.notes}
                onChange={(e) => update("notes", e.target.value)}
                aria-invalid={errors.notes ? true : undefined}
                aria-describedby={describe("notes", "res-notes-count")}
              />
              <ErrorText id="res-notes-error" message={errors.notes} />
            </div>

            <div className="flex flex-col gap-4 border-t border-[var(--line)] pt-8 sm:flex-row sm:items-center sm:justify-between">
              <p id="res-concept" className="max-w-xs text-xs leading-relaxed text-muted">
                Concept demo: nothing is sent anywhere and no table is booked.
              </p>
              <button
                type="submit"
                className="btn btn-primary w-full sm:w-auto"
                disabled={status === "sending"}
                aria-live="polite"
              >
                {status === "sending" ? (
                  <>
                    <span
                      className="size-4 animate-spin rounded-full border-2 border-char/30 border-t-char"
                      aria-hidden="true"
                    />
                    Holding your table…
                  </>
                ) : (
                  <>
                    Hold my table
                    <span className="arrow" aria-hidden="true">
                      →
                    </span>
                  </>
                )}
              </button>
            </div>
          </motion.form>
        )}
      </AnimatePresence>
    </div>
  );
}
