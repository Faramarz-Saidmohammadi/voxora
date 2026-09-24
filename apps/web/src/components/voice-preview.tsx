"use client";

import { useEffect, useState } from "react";

const fallbackText =
  "Welcome to Voxora. Your appointment is confirmed for tomorrow at ten thirty.";

export function VoicePreview({
  text = fallbackText,
}: Readonly<{ text?: string }>) {
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [supportError, setSupportError] = useState(false);

  useEffect(() => {
    return () => window.speechSynthesis?.cancel();
  }, []);

  function toggleSpeech() {
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

  return (
    <div className="voice-preview">
      <div className="voice-copy">
        <span className="eyebrow">Local browser preview</span>
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
        aria-pressed={isSpeaking}
        aria-label={isSpeaking ? "Stop voice preview" : "Play voice preview"}
      >
        <span aria-hidden="true">{isSpeaking ? "■" : "▶"}</span>
        {isSpeaking ? "Stop preview" : "Play voice preview"}
      </button>
      {supportError ? (
        <p className="support-note" role="status">
          Speech preview is unavailable in this browser.
        </p>
      ) : null}
    </div>
  );
}
