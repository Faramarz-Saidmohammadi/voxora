"use client";

import { useEffect, useRef, useState } from "react";

const fallbackText =
  "Welcome to Voxora. Your appointment is confirmed for tomorrow at ten thirty.";

export function VoicePreview({
  text = fallbackText,
  mode = "browser",
}: Readonly<{ text?: string; mode?: "browser" | "openai" }>) {
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [supportError, setSupportError] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const objectUrlRef = useRef<string | null>(null);

  useEffect(() => {
    return () => {
      window.speechSynthesis?.cancel();
      audioRef.current?.pause();
      if (objectUrlRef.current) URL.revokeObjectURL(objectUrlRef.current);
    };
  }, []);

  function stopExternalAudio() {
    audioRef.current?.pause();
    audioRef.current = null;
    if (objectUrlRef.current) URL.revokeObjectURL(objectUrlRef.current);
    objectUrlRef.current = null;
    setIsSpeaking(false);
  }

  async function toggleExternalSpeech() {
    if (isSpeaking) {
      stopExternalAudio();
      return;
    }

    setIsLoading(true);
    setSupportError(false);

    try {
      const response = await fetch("/api/v1/speech-generation", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-voxora-tenant": "workspace-demo",
          "x-voxora-actor": "dashboard-preview",
          "x-voxora-role": "EDITOR",
          "idempotency-key": crypto.randomUUID(),
        },
        body: JSON.stringify({
          text,
          locale: "en-US",
          voice: "cedar",
          format: "mp3",
        }),
      });

      if (!response.ok) throw new Error("Speech generation failed");

      const objectUrl = URL.createObjectURL(await response.blob());
      const audio = new Audio(objectUrl);
      objectUrlRef.current = objectUrl;
      audioRef.current = audio;
      audio.onended = stopExternalAudio;
      audio.onerror = () => {
        stopExternalAudio();
        setSupportError(true);
      };
      await audio.play();
      setIsSpeaking(true);
    } catch {
      stopExternalAudio();
      setSupportError(true);
    } finally {
      setIsLoading(false);
    }
  }

  function toggleBrowserSpeech() {
    if (!("speechSynthesis" in window)) {
      setSupportError(true);
      return;
    }

    if (isSpeaking) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
      return;
    }

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = "en-US";
    utterance.rate = 0.94;
    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);
    window.speechSynthesis.speak(utterance);
    setIsSpeaking(true);
  }

  function toggleSpeech() {
    if (mode === "openai") {
      void toggleExternalSpeech();
      return;
    }

    toggleBrowserSpeech();
  }

  return (
    <div className="voice-preview">
      <div className="voice-copy">
        <span className="eyebrow">
          {mode === "openai" ? "Governed AI preview" : "Local browser preview"}
        </span>
        <p>{text}</p>
      </div>
      <div className="waveform" aria-hidden="true">
        {[22, 38, 58, 32, 68, 46, 76, 54, 32, 62, 42, 26].map(
          (height, index) => (
            <span key={`${height}-${index}`} style={{ height }} />
          ),
        )}
      </div>
      <button
        className="play-button"
        type="button"
        onClick={toggleSpeech}
        disabled={isLoading}
        aria-pressed={isSpeaking}
        aria-label={
          isLoading
            ? "Generating voice preview"
            : isSpeaking
              ? "Stop voice preview"
              : "Play voice preview"
        }
      >
        <span aria-hidden="true">
          {isLoading ? "…" : isSpeaking ? "■" : "▶"}
        </span>
        {isLoading
          ? "Generating preview"
          : isSpeaking
            ? "Stop preview"
            : "Play voice preview"}
      </button>
      {mode === "openai" ? (
        <p className="support-note">
          This preview uses an AI-generated voice, not a human voice.
        </p>
      ) : null}
      {supportError ? (
        <p className="support-note" role="status">
          {mode === "openai"
            ? "AI speech generation is temporarily unavailable."
            : "Speech preview is unavailable in this browser."}
        </p>
      ) : null}
    </div>
  );
}
