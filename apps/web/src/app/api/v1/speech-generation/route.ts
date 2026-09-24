import { randomUUID } from "node:crypto";

import { speechGenerationSchema } from "@voxora/contracts";
import {
  AuthorizationError,
  isWorkspaceRole,
  prepareSpeechRequest,
  UsageLimitError,
} from "@voxora/domain";
import {
  SpeechProviderConfigurationError,
  SpeechProviderRequestError,
} from "@voxora/speech";

import { createConfiguredSpeechProvider } from "@/server/speech-provider";

type ErrorCode =
  | "UNAUTHENTICATED"
  | "FORBIDDEN"
  | "INVALID_REQUEST"
  | "USAGE_LIMIT_EXCEEDED"
  | "SPEECH_PROVIDER_UNAVAILABLE"
  | "SPEECH_GENERATION_FAILED";

function errorResponse(
  status: number,
  code: ErrorCode,
  message: string,
  correlationId: string,
  details?: unknown,
  headers?: HeadersInit,
) {
  const responseHeaders = new Headers(headers);
  responseHeaders.set("Cache-Control", "no-store");
  responseHeaders.set("X-Correlation-ID", correlationId);

  return Response.json(
    {
      error: { code, message, ...(details ? { details } : {}) },
      meta: { correlationId },
    },
    {
      status,
      headers: responseHeaders,
    },
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

  const parsed = speechGenerationSchema.safeParse(body);
  if (!parsed.success) {
    return errorResponse(
      400,
      "INVALID_REQUEST",
      "The speech generation request did not pass validation",
      correlationId,
      parsed.error.flatten(),
    );
  }

  try {
    const requestId = randomUUID();
    prepareSpeechRequest({
      requestId,
      workspaceId,
      actorId,
      role: roleHeader,
      idempotencyKey,
      text: parsed.data.text,
      locale: parsed.data.locale,
      voice: parsed.data.voice,
      format: parsed.data.format,
      usage: { limit: 1_000_000, consumed: 742_000, reserved: 21_000 },
    });

    const provider = createConfiguredSpeechProvider();
    const audio = await provider.generate(
      {
        text: parsed.data.text,
        voice: parsed.data.voice,
        format: parsed.data.format,
        instructions:
          parsed.data.instructions ??
          `Speak clearly and naturally using the ${parsed.data.locale} locale.`,
      },
      { idempotencyKey, signal: request.signal },
    );

    return new Response(audio.bytes.slice().buffer, {
      status: 200,
      headers: {
        "Cache-Control": "no-store",
        "Content-Type": audio.contentType,
        "Content-Length": String(audio.bytes.byteLength),
        "X-Correlation-ID": correlationId,
        "X-Voxora-Request-ID": requestId,
        "X-Voxora-AI-Disclosure": "AI-generated voice",
      },
    });
  } catch (error) {
    if (error instanceof AuthorizationError) {
      return errorResponse(
        403,
        "FORBIDDEN",
        "The current role cannot generate speech",
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

    if (error instanceof SpeechProviderConfigurationError) {
      return errorResponse(
        503,
        "SPEECH_PROVIDER_UNAVAILABLE",
        "Speech generation is not configured for this environment",
        correlationId,
      );
    }

    if (error instanceof SpeechProviderRequestError) {
      return errorResponse(
        502,
        "SPEECH_GENERATION_FAILED",
        "Speech generation failed; retry the request later",
        correlationId,
        undefined,
        error.retryable ? { "Retry-After": "2" } : undefined,
      );
    }

    throw error;
  }
}
