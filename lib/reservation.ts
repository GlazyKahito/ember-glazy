import { z } from "zod";
import { slotsFor, weekdayOf, week } from "./hours";

export const seatingOptions = [
  { value: "hearth", label: "Hearth counter", note: "Watch the fire" },
  { value: "dining", label: "Dining room", note: "Quieter tables" },
  { value: "any", label: "No preference", note: "Wherever is best" },
] as const;

export type Seating = (typeof seatingOptions)[number]["value"];

export type ReservationInput = {
  date: string;
  time: string;
  party: string;
  name: string;
  phone: string;
  seating: Seating;
  notes: string;
};

export const fieldOrder = ["date", "time", "party", "name", "phone", "notes"] as const;
export type Field = (typeof fieldOrder)[number];
export type Errors = Partial<Record<Field, string>>;

export const NOTES_MAX = 280;

/** Strips spaces, dashes and a leading +91 or 0, leaving the 10-digit mobile number. */
export function normalisePhone(raw: string) {
  const digits = raw.replace(/[^\d+]/g, "");
  return digits.replace(/^\+?91(?=\d{10}$)/, "").replace(/^0(?=\d{10}$)/, "");
}

const schema = z.object({
  date: z
    .string()
    .min(1, "Pick a day for your table.")
    .refine((v) => !v || /^\d{4}-\d{2}-\d{2}$/.test(v), "Pick a day for your table.")
    .refine(
      (v) => !/^\d{4}-\d{2}-\d{2}$/.test(v) || (week[weekdayOf(v)]?.length ?? 0) > 0,
      "We are closed on Mondays. Pick another day.",
    ),
  time: z.string().min(1, "Choose a time."),
  party: z
    .string()
    .min(1, "Tell us how many of you are coming.")
    .refine((v) => {
      const n = Number(v);
      return Number.isInteger(n) && n >= 1 && n <= 8;
    }, "Tables are for one to eight guests."),
  name: z
    .string()
    .trim()
    .min(1, "Tell us who the table is for.")
    .min(2, "Use at least two letters.")
    .max(60, "Keep the name under 60 characters.")
    .regex(/^[\p{L}][\p{L}\p{M} .'’-]*$/u, "Use letters only, no numbers or symbols."),
  phone: z
    .string()
    .trim()
    .min(1, "We need a number to confirm the table.")
    .refine((v) => /^[6-9]\d{9}$/.test(normalisePhone(v)), "Enter a 10-digit Indian mobile number."),
  notes: z.string().max(NOTES_MAX, `Keep requests under ${NOTES_MAX} characters.`),
});

/**
 * Validates the whole form. `today` and `nowMinutes` are Mumbai time, so a
 * table cannot be booked for a seating that has already gone.
 */
export function validateReservation(values: ReservationInput, today: string | null, nowMinutes: number | null): Errors {
  const errors: Errors = {};
  const result = schema.safeParse(values);
  if (!result.success) {
    for (const issue of result.error.issues) {
      const key = issue.path[0] as Field;
      if (key && !errors[key]) errors[key] = issue.message;
    }
  }

  if (!errors.date && today && values.date < today) {
    errors.date = "That day has passed. Pick another.";
  }

  if (!errors.date && !errors.time && values.date) {
    const slot = Number(values.time);
    const valid = slotsFor(values.date).some((s) => s.minutes === slot);
    if (!valid) errors.time = "That time is not available on this day.";
    else if (today && nowMinutes !== null && values.date === today && slot < nowMinutes + 60) {
      errors.time = "Book at least an hour ahead. Pick a later time.";
    }
  }

  return errors;
}
