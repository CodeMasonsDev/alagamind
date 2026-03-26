const MIN_VALID_YEAR = 2000;
const MAX_VALID_YEAR = 2100;

export function parseJournalTimestamp(value: unknown): number | null {
  if (value === undefined || value === null) {
    return null;
  }

  if (typeof value === "number") {
    if (!Number.isFinite(value) || value <= 0) {
      return null;
    }

    const normalized = value < 1_000_000_000_000 ? value * 1000 : value;
    return isValidTimestamp(normalized) ? normalized : null;
  }

  const trimmed = String(value).trim();
  if (!trimmed) {
    return null;
  }

  if (
    trimmed === "0001-01-01T00:00:00" ||
    trimmed === "0001-01-01T00:00:00Z" ||
    trimmed === "0001-01-01"
  ) {
    return null;
  }

  if (/^\d+$/.test(trimmed)) {
    const numeric = Number(trimmed);
    if (!Number.isFinite(numeric) || numeric <= 0) {
      return null;
    }

    const normalized = trimmed.length <= 10 ? numeric * 1000 : numeric;
    return isValidTimestamp(normalized) ? normalized : null;
  }

  const normalizedValue = normalizeBackendDateString(trimmed);
  const parsed = new Date(normalizedValue).getTime();

  if (Number.isNaN(parsed) || !isValidTimestamp(parsed)) {
    return null;
  }

  return parsed;
}

export function formatJournalCalendarDate(timestampMs: number | null) {
  if (!timestampMs) {
    return "Unknown date";
  }

  return new Date(timestampMs).toLocaleDateString(undefined, {
    month: "long",
    day: "numeric",
    year: "numeric",
  });
}

export function formatJournalClockTime(timestampMs: number | null) {
  if (!timestampMs) {
    return "Unknown time";
  }

  return new Date(timestampMs).toLocaleTimeString(undefined, {
    hour: "numeric",
    minute: "2-digit",
  });
}

export function formatJournalDateTime(timestampMs: number | null) {
  if (!timestampMs) {
    return "Unknown date";
  }

  return new Date(timestampMs).toLocaleString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

function normalizeBackendDateString(value: string) {
  if (/[zZ]$|[+\-]\d{2}:\d{2}$/.test(value)) {
    return value;
  }

  if (
    /^\d{4}-\d{2}-\d{2}[T ]\d{2}:\d{2}(:\d{2}(\.\d{1,7})?)?$/.test(value)
  ) {
    return `${value.replace(" ", "T")}Z`;
  }

  return value;
}

function isValidTimestamp(timestampMs: number) {
  const year = new Date(timestampMs).getFullYear();
  return year >= MIN_VALID_YEAR && year <= MAX_VALID_YEAR;
}
