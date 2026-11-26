const easternClock = new Intl.DateTimeFormat("en-US", {
  timeZone: "America/New_York",
  year: "numeric",
  month: "2-digit",
  day: "2-digit",
  hour: "2-digit",
  hourCycle: "h23",
});

export const PUBLIC_RESERVATION_CUTOFF_MESSAGE = "Online reservations close at 8:00 a.m. Eastern on the tournament date.";

export function isPublicReservationWindowOpen({ entriesOpen, scheduleItem, date, now = Date.now() }) {
  if (!entriesOpen) return false;
  const startDate = scheduleItem?.startDate || date;
  if (scheduleItem?.publicDetailsPage === "multiDayInfo" ||
      (scheduleItem?.endDate && scheduleItem.endDate !== startDate)) return false;
  if (!/^\d{4}-\d{2}-\d{2}$/.test(startDate || "")) return false;
  const parsed = new Date(startDate);
  if (Number.isNaN(parsed.getTime()) || parsed.toISOString().slice(0, 10) !== startDate) return false;

  const { year, month, day, hour } = Object.fromEntries(
    easternClock.formatToParts(now).map(({ type, value }) => [type, value])
  );
  const easternDate = `${year}-${month}-${day}`;
  return easternDate < startDate || (easternDate === startDate && Number(hour) < 8);
}
