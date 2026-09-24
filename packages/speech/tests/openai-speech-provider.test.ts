import { describe, expect, it, vi } from "vitest";
import { AuthenticationError, RateLimitError } from "openai";

import {
  OpenAISpeechProvider,
  SpeechProviderConfigurationError,
  SpeechProviderRequestError,
  type OpenAISpeechClient,
} from "../src/index";

function createClient(bytes = [1, 2, 3]) {
  const create = vi.fn(async () => ({
    arrayBuffer: async () => Uint8Array.from(bytes).buffer,
  }));

  return {
    create,
    client: { audio: { speech: { create } } } as OpenAISpeechClient,
  };
}

describe("OpenAI speech provider", () => {
  it("maps the provider-neutral request to the OpenAI speech API", async () => {
    const { client, create } = createClient();
    const provider = new OpenAISpeechProvider({
      apiKey: "test-key",
      model: "gpt-4o-mini-tts",
      client,
    });

    const result = await provider.generate({
      text: "Your appointment is confirmed.",
      voice: "cedar",
      format: "ogg",
      instructions: "Speak clearly and calmly in English.",
    });

    expect(create).toHaveBeenCalledWith(
      {
        model: "gpt-4o-mini-tts",
        voice: "cedar",
        input: "Your appointment is confirmed.",
        instructions: "Speak clearly and calmly in English.",
        response_format: "opus",
      },
      undefined,
    );
    expect(result).toMatchObject({
      contentType: "audio/ogg",
      provider: "openai",
      model: "gpt-4o-mini-tts",
      voice: "cedar",
    });
    expect([...result.bytes]).toEqual([1, 2, 3]);
  });

  it("normalizes provider failures without leaking upstream details", async () => {
    const client = {
      audio: {
        speech: {
          create: vi.fn(async () => {
            throw new Error("upstream response containing sensitive details");
          }),
        },
      },
    } as OpenAISpeechClient;

    const provider = new OpenAISpeechProvider({ apiKey: "test-key", client });

    const promise = provider.generate({
      text: "Hello",
      voice: "marin",
      format: "mp3",
    });

    await expect(promise).rejects.toMatchObject({
      name: "SpeechProviderRequestError",
      retryable: false,
    });
  });

  it("marks rate-limit failures as retryable", async () => {
    const client = {
      audio: {
        speech: {
          create: vi.fn(async () => {
            throw new RateLimitError(
              429,
              { message: "rate limited" },
              "rate limited",
              new Headers(),
            );
          }),
        },
      },
    } as OpenAISpeechClient;

    const provider = new OpenAISpeechProvider({ apiKey: "test-key", client });

    await expect(
      provider.generate({ text: "Hello", voice: "cedar", format: "mp3" }),
    ).rejects.toMatchObject({ retryable: true });
  });

  it("normalizes invalid provider credentials as configuration errors", async () => {
    const client = {
      audio: {
        speech: {
          create: vi.fn(async () => {
            throw new AuthenticationError(
              401,
              { message: "invalid secret credential" },
              "invalid secret credential",
              new Headers(),
            );
          }),
        },
      },
    } as OpenAISpeechClient;

    const provider = new OpenAISpeechProvider({ apiKey: "test-key", client });

    await expect(
      provider.generate({ text: "Hello", voice: "cedar", format: "mp3" }),
    ).rejects.toEqual(expect.any(SpeechProviderConfigurationError));
  });

  it("provides a stable configuration error without secret material", () => {
    const error = new SpeechProviderConfigurationError();

    expect(error).toMatchObject({
      name: "SpeechProviderConfigurationError",
      code: "SPEECH_PROVIDER_UNAVAILABLE",
      message: "The configured speech provider is unavailable",
    });
  });
});
