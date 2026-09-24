import { randomUUID } from "node:crypto";

import { speechRequestSchema } from "@voxora/contracts";
import {
  AuthorizationError,
  isWorkspaceRole,
  prepareSpeechRequest,
  UsageLimitError,
} from "@voxora/domain";

type ErrorCode =
  "UNAUTHENTICATED" | "FORBIDDEN" | "INVALID_REQUEST" | "USAGE_LIMIT_EXCEEDED";

function errorResponse(
  status: number,
  code: ErrorCode,
  message: string,
  correlationId: string,
  details?: unknown,
) {
  return Response.json(
    {
      error: { code, message, ...(details ? { details } : {}) },
      meta: { correlationId },
    },
    { status, headers: { "Cache-Control": "no-store" } },
  );
}

export async function POST(request: Request) {
  const correlationId = request.headers.get("x-correlation-id") ?? randomUUID();
  const workspaceId = request.headers.get("x-voxora-tenant");
  const actorId = request.headers.get("x-voxora-actor");
  const roleHeader = request.headers.get("x-voxora-role");
  const idempotencyKey = request.headers.get("idempotency-key");

  if (!workspaceId || !actorId || !roleHeader || !idempotencyKey) {
    return errorResponse(
      401,
      "UNAUTHENTICATED",
      "Workspace, actor, role, and idempotency headers are required",
      correlationId,
    );
  }

  if (!isWorkspaceRole(roleHeader)) {
    return errorResponse(
      403,
      "FORBIDDEN",
      "The workspace role is invalid",
      correlationId,
    );
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return errorResponse(
      400,
      "INVALID_REQUEST",
      "The request body must be valid JSON",
      correlationId,
    );
  }

  const parsed = speechRequestSchema.safeParse(body);
  if (!parsed.success) {
    return errorResponse(
      400,
      "INVALID_REQUEST",
      "The speech request did not pass validation",
      correlationId,
      parsed.error.flatten(),
    );
  }

  try {
    const prepared = prepareSpeechRequest({
      requestId: randomUUID(),
      workspaceId,
      actorId,
      role: roleHeader,
      idempotencyKey,
      ...parsed.data,
      usage: { limit: 1_000_000, consumed: 742_000, reserved: 21_000 },
    });

    return Response.json(
      {
        data: {
          requestId: prepared.request.id,
          status: prepared.request.status,
          characterCount: prepared.request.characterCount,
          remainingCharacters: prepared.remainingCharacters,
        },
        meta: { correlationId, persistence: "foundation-demo" },
      },
      { status: 202, headers: { "Cache-Control": "no-store" } },
    );
  } catch (error) {
    if (error instanceof AuthorizationError) {
      return errorResponse(
        403,
        "FORBIDDEN",
        "The current role cannot create speech requests",
        correlationId,
      );
    }

    if (error instanceof UsageLimitError) {
      return errorResponse(
        409,
        "USAGE_LIMIT_EXCEEDED",
        "The workspace usage limit has been reached",
        correlationId,
        { remaining: error.remaining },
      );
    }

    throw error;
  }
}
