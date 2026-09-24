export type UsageWindow = Readonly<{
  limit: number;
  consumed: number;
  reserved: number;
}>;

export type UsageReservation =
  | Readonly<{
      accepted: true;
      reservedCharacters: number;
      next: UsageWindow;
      remaining: number;
    }>
  | Readonly<{
      accepted: false;
      reason: "INVALID_AMOUNT" | "LIMIT_EXCEEDED";
      remaining: number;
    }>;

export function reserveUsage(
  current: UsageWindow,
  characters: number,
): UsageReservation {
  const remaining = Math.max(
    0,
    current.limit - current.consumed - current.reserved,
  );

  if (!Number.isSafeInteger(characters) || characters <= 0) {
    return { accepted: false, reason: "INVALID_AMOUNT", remaining };
  }

  if (characters > remaining) {
    return { accepted: false, reason: "LIMIT_EXCEEDED", remaining };
  }

  return {
    accepted: true,
    reservedCharacters: characters,
    remaining: remaining - characters,
    next: {
      ...current,
      reserved: current.reserved + characters,
    },
  };
}
