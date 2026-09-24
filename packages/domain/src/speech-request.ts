import { requirePermission, type WorkspaceRole } from "./authorization";
import { reserveUsage, type UsageWindow } from "./usage";

export type PrepareSpeechRequestInput = Readonly<{
  requestId: string;
  workspaceId: string;
  actorId: string;
  role: WorkspaceRole;
  idempotencyKey: string;
  text: string;
  locale: string;
  voice: string;
  format: "mp3" | "wav" | "ogg";
  usage: UsageWindow;
}>;

export type PreparedSpeechRequest = Readonly<{
  request: {
    id: string;
    workspaceId: string;
    actorId: string;
    idempotencyKey: string;
    locale: string;
    voice: string;
    format: "mp3" | "wav" | "ogg";
    characterCount: number;
    status: "QUEUED";
  };
  nextUsage: UsageWindow;
  remainingCharacters: number;
}>;

export class UsageLimitError extends Error {
  readonly code = "USAGE_LIMIT_EXCEEDED";

  constructor(readonly remaining: number) {
    super("The workspace does not have enough remaining characters");
    this.name = "UsageLimitError";
  }
}

export function prepareSpeechRequest(
  input: PrepareSpeechRequestInput,
): PreparedSpeechRequest {
  requirePermission(input.role, "speech:create");

  const characters = Array.from(input.text.trim()).length;
  const reservation = reserveUsage(input.usage, characters);

  if (!reservation.accepted) {
    throw new UsageLimitError(reservation.remaining);
  }

  return {
    request: {
      id: input.requestId,
      workspaceId: input.workspaceId,
      actorId: input.actorId,
      idempotencyKey: input.idempotencyKey,
      locale: input.locale,
      voice: input.voice,
      format: input.format,
      characterCount: characters,
      status: "QUEUED",
    },
    nextUsage: reservation.next,
    remainingCharacters: reservation.remaining,
  };
}
