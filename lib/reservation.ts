
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

export type Validate = (values: ReservationInput, today: string | null, nowMinutes: number | null) => Errors;

let validator: Promise<Validate> | null = null;

/**
 * The rules (and zod with them) load only when someone starts on the form, so
 * they stay out of the page's first download. Repeat calls share one request.
 */
export function loadValidator(): Promise<Validate> {
  validator ??= import("./reservation-schema").then(
    (m) => m.validateReservation,
    (error: unknown) => {
      validator = null; // let the next attempt try again
      throw error;
    },
  );
  return validator;
}
