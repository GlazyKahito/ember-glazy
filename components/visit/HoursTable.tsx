"use client";

import { hoursTable } from "@/lib/hours";
import { useTodayWeekday } from "@/lib/use-client-value";

export function HoursTable() {
  const today = useTodayWeekday();
  return (
    <dl className="border-t border-[var(--line)]">
      {hoursTable.map((row) => {
        const isToday = today !== null && (row.weekdays as readonly number[]).includes(today);
        return (
          <div
            key={row.days}
            className={`flex items-baseline justify-between gap-6 border-b border-[var(--line)] py-4 ${isToday ? "text-cream" : "text-parchment"}`}
          >
            <dt className="flex items-center gap-2.5">
              {isToday ? (
                <span
                  className="size-1.5 rounded-full bg-ember shadow-[0_0_10px_rgb(255_107_44/0.9)]"
                  aria-hidden="true"
                />
              ) : null}
              {row.days}
              {isToday ? <span className="sr-only">(today)</span> : null}
            </dt>
            <dd className={`text-right ${row.weekdays[0] === 1 ? "text-muted" : ""}`}>{row.hours}</dd>
          </div>
        );
      })}
    </dl>
  );
}
