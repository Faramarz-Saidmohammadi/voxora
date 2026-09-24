import OpenAI, {
  APIConnectionError,
  APIError,
  AuthenticationError,
  PermissionDeniedError,
} from "openai";

import {
  SpeechProviderConfigurationError,
  SpeechProviderRequestError,
  type GenerateSpeechInput,
  type GenerateSpeechOptions,
  type GeneratedSpeech,
  type SpeechProvider,
} from "./provider";

type OpenAIResponseFormat = "mp3" | "wav" | "opus";

type SpeechResponse = Readonly<{
  arrayBuffer(): Promise<ArrayBuffer>;
}>;

export type OpenAISpeechClient = Readonly<{
  audio: {
    speech: {
      create(
        input: {
          model: string;
          voice: string;
          input: string;
          instructions?: string;
          response_format: OpenAIResponseFormat;
        },
        options?: GenerateSpeechOptions,
      ): Promise<SpeechResponse>;
    };
  };
}>;

export type OpenAISpeechProviderOptions = Readonly<{
  apiKey: string;
  model?: string;
  timeoutMs?: number;
  maxRetries?: number;
  client?: OpenAISpeechClient;
}>;

const formatConfiguration = {
  mp3: { responseFormat: "mp3", contentType: "audio/mpeg" },
  wav: { responseFormat: "wav", contentType: "audio/wav" },
  ogg: { responseFormat: "opus", contentType: "audio/ogg" },
} as const;

export class OpenAISpeechProvider implements SpeechProvider {
  readonly #client: OpenAISpeechClient;
  readonly #model: string;

  constructor(options: OpenAISpeechProviderOptions) {
    this.#model = options.model?.trim() || "gpt-4o-mini-tts";
    this.#client =
      options.client ??
      (new OpenAI({
        apiKey: options.apiKey,
        timeout: options.timeoutMs ?? 30_000,
        maxRetries: options.maxRetries ?? 2,
      }) as unknown as OpenAISpeechClient);
  }

  async generate(
    input: GenerateSpeechInput,
    options?: GenerateSpeechOptions,
  ): Promise<GeneratedSpeech> {
    const format = formatConfiguration[input.format];

    try {
      const response = await this.#client.audio.speech.create(
        {
          model: this.#model,
          voice: input.voice,
          input: input.text,
          ...(input.instructions ? { instructions: input.instructions } : {}),
          response_format: format.responseFormat,
        },
        options,
      );

      return {
        bytes: new Uint8Array(await response.arrayBuffer()),
        contentType: format.contentType,
        provider: "openai",
        model: this.#model,
        voice: input.voice,
      };
    } catch (error) {
      if (
        error instanceof AuthenticationError ||
        error instanceof PermissionDeniedError
      ) {
        throw new SpeechProviderConfigurationError();
      }

      const retryable =
        error instanceof APIConnectionError ||
        (error instanceof APIError &&
          (error.status === 408 ||
            error.status === 409 ||
            error.status === 429 ||
            (typeof error.status === "number" && error.status >= 500)));

      throw new SpeechProviderRequestError(retryable);
    }
  }
}
