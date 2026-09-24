import OpenAI from "openai";

import {
  SpeechProviderRequestError,
  type GenerateSpeechInput,
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
      create(input: {
        model: string;
        voice: string;
        input: string;
        instructions?: string;
        response_format: OpenAIResponseFormat;
      }): Promise<SpeechResponse>;
    };
  };
}>;

export type OpenAISpeechProviderOptions = Readonly<{
  apiKey: string;
  model?: string;
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
      (new OpenAI({ apiKey: options.apiKey }) as unknown as OpenAISpeechClient);
  }

  async generate(input: GenerateSpeechInput): Promise<GeneratedSpeech> {
    const format = formatConfiguration[input.format];

    try {
      const response = await this.#client.audio.speech.create({
        model: this.#model,
        voice: input.voice,
        input: input.text,
        ...(input.instructions ? { instructions: input.instructions } : {}),
        response_format: format.responseFormat,
      });

      return {
        bytes: new Uint8Array(await response.arrayBuffer()),
        contentType: format.contentType,
        provider: "openai",
        model: this.#model,
        voice: input.voice,
      };
    } catch {
      throw new SpeechProviderRequestError(true);
    }
  }
}
