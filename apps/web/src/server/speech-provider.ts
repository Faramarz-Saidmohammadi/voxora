import "server-only";

import {
  OpenAISpeechProvider,
  SpeechProviderConfigurationError,
  type SpeechProvider,
} from "@voxora/speech";

export function createConfiguredSpeechProvider(
  environment: NodeJS.ProcessEnv = process.env,
): SpeechProvider {
  if (environment.SPEECH_PROVIDER !== "openai") {
    throw new SpeechProviderConfigurationError();
  }

  const apiKey = environment.OPENAI_API_KEY?.trim();
  if (!apiKey) {
    throw new SpeechProviderConfigurationError();
  }

  return new OpenAISpeechProvider({
    apiKey,
    model: environment.OPENAI_SPEECH_MODEL,
  });
}

export function isExternalSpeechPreviewEnabled(
  environment: NodeJS.ProcessEnv = process.env,
): boolean {
  return (
    environment.SPEECH_PROVIDER === "openai" &&
    Boolean(environment.OPENAI_API_KEY?.trim())
  );
}
