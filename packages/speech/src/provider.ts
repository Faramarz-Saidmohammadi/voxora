export const speechVoices = [
  "alloy",
  "ash",
  "ballad",
  "coral",
  "echo",
  "fable",
  "nova",
  "onyx",
  "sage",
  "shimmer",
  "verse",
  "marin",
  "cedar",
] as const;

export type SpeechVoice = (typeof speechVoices)[number];
export type SpeechAudioFormat = "mp3" | "wav" | "ogg";

export type GenerateSpeechInput = Readonly<{
  text: string;
  voice: SpeechVoice;
  format: SpeechAudioFormat;
  instructions?: string;
}>;

export type GeneratedSpeech = Readonly<{
  bytes: Uint8Array;
  contentType: "audio/mpeg" | "audio/wav" | "audio/ogg";
  provider: "openai";
  model: string;
  voice: SpeechVoice;
}>;

export interface SpeechProvider {
  generate(input: GenerateSpeechInput): Promise<GeneratedSpeech>;
}

export class SpeechProviderConfigurationError extends Error {
  readonly code = "SPEECH_PROVIDER_UNAVAILABLE";

  constructor(message = "The configured speech provider is unavailable") {
    super(message);
    this.name = "SpeechProviderConfigurationError";
  }
}

export class SpeechProviderRequestError extends Error {
  readonly code = "SPEECH_GENERATION_FAILED";

  constructor(readonly retryable: boolean) {
    super("The speech provider could not generate audio");
    this.name = "SpeechProviderRequestError";
  }
}
