/**
 * Opening hours, in minutes from midnight (IST). A service that runs past
 * midnight has a close time above 1440, so 1 am is 25 * 60.
 */
export type Service = { name: "Lunch" | "Dinner"; open: number; close: number };

const h = (hours: number, minutes = 0) => hours * 60 + minutes;

const dinner = (close: number): Service => ({ name: "Dinner", open: h(18), close });

/** Indexed by JavaScript weekday: 0 is Sunday. */
export const week: Service[][] = [
  [
    { name: "Lunch", open: h(12, 30), close: h(16) },
    { name: "Dinner", open: h(19), close: h(25) },
  ],
  [],
  [dinner(h(25))],
  [dinner(h(25))],
  [dinner(h(25))],
  [dinner(h(25, 30))],
  [dinner(h(25, 30))],
];

export const hoursTable = [
  { days: "Tuesday – Thursday", weekdays: [2, 3, 4], hours: "6 pm – 1 am" },
  { days: "Friday – Saturday", weekdays: [5, 6], hours: "6 pm – 1:30 am" },
  { days: "Sunday", weekdays: [0], hours: "12:30 – 4 pm, 7 pm – 1 am" },
  { days: "Monday", weekdays: [1], hours: "Closed, the fire rests" },
] as const;

export const dayNames = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"] as const;

const monthNames = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
] as const;

/** "6 pm", "12:30 pm", "1:30 am". */
export function formatMinutes(total: number) {
  const m = ((total % 1440) + 1440) % 1440;
  const hours = Math.floor(m / 60);
  const minutes = m % 60;
  const suffix = hours < 12 ? "am" : "pm";
  const twelve = hours % 12 === 0 ? 12 : hours % 12;
  return `${twelve}${minutes ? `:${String(minutes).padStart(2, "0")}` : ""} ${suffix}`;
}

/** Mumbai has no daylight saving, so IST is always UTC+5:30. */
export function toIst(date: Date) {
  return new Date(date.getTime() + 330 * 60_000);
}

export function istParts(date: Date) {
  const ist = toIst(date);
  return {
    weekday: ist.getUTCDay(),
    minutes: ist.getUTCHours() * 60 + ist.getUTCMinutes(),
    iso: ist.toISOString().slice(0, 10),
  };
}

export function serviceStatus(now: Date): { open: boolean; label: string } {
  const { weekday, minutes } = istParts(now);
  const yesterday = (weekday + 6) % 7;

  for (const s of week[yesterday]) {
    if (s.close > 1440 && minutes < s.close - 1440) {
      return { open: true, label: `Open now · until ${formatMinutes(s.close)}` };
    }
  }
  for (const s of week[weekday]) {
    if (minutes >= s.open && minutes < s.close) {
      return { open: true, label: `Open now · until ${formatMinutes(s.close)}` };
    }
    if (minutes < s.open) {
      return { open: false, label: `Opens today at ${formatMinutes(s.open)}` };
    }
  }
  for (let i = 1; i <= 7; i++) {
    const day = (weekday + i) % 7;
    const first = week[day][0];
    if (first) {
      const when = i === 1 ? "tomorrow" : dayNames[day];
      return { open: false, label: `Opens ${when} at ${formatMinutes(first.open)}` };
    }
  }
  return { open: false, label: "Closed" };
}

/** A calendar day, as YYYY-MM-DD, with display parts. */
export type Day = {
  iso: string;
  weekday: number;
  date: number;
  month: string;
  closed: boolean;
};

export function nextDays(fromIso: string, count: number): Day[] {
  const [y, m, d] = fromIso.split("-").map(Number);
  const days: Day[] = [];
  for (let i = 0; i < count; i++) {
    const dt = new Date(Date.UTC(y, m - 1, d + i));
    const weekday = dt.getUTCDay();
    days.push({
      iso: dt.toISOString().slice(0, 10),
      weekday,
      date: dt.getUTCDate(),
      month: monthNames[dt.getUTCMonth()],
      closed: week[weekday].length === 0,
    });
  }
  return days;
}

export function weekdayOf(iso: string) {
  const [y, m, d] = iso.split("-").map(Number);
  return new Date(Date.UTC(y, m - 1, d)).getUTCDay();
}

export function longDate(iso: string) {
  const [y, m, d] = iso.split("-").map(Number);
  const dt = new Date(Date.UTC(y, m - 1, d));
  return `${dayNames[dt.getUTCDay()]}, ${dt.getUTCDate()} ${monthNames[dt.getUTCMonth()]}`;
}

/** Bookable seatings for a day. The last seating is 90 minutes before close, and never after 11 pm. */
export function slotsFor(iso: string): { service: Service["name"]; minutes: number }[] {
  const slots: { service: Service["name"]; minutes: number }[] = [];
  for (const s of week[weekdayOf(iso)]) {
    const last = Math.min(s.close - 90, h(23));
    for (let t = s.open; t <= last; t += 30) slots.push({ service: s.name, minutes: t });
  }
  return slots;
}
