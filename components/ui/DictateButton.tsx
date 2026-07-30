'use client';
import { useEffect, useRef, useState } from 'react';
import { Mic } from '@/components/icons';

/**
 * Minimal ambient types for the Web Speech API — it isn't in TypeScript's
 * DOM lib (no browser has ever shipped a spec-final version of it), and
 * pulling in a whole @types package for four members isn't worth it.
 */
interface SpeechRecognitionResultLike {
  0: { transcript: string };
  isFinal: boolean;
}
interface SpeechRecognitionEventLike {
  resultIndex: number;
  results: ArrayLike<SpeechRecognitionResultLike>;
}
interface SpeechRecognitionErrorEventLike {
  error: string;
}
interface SpeechRecognitionLike {
  lang: string;
  continuous: boolean;
  interimResults: boolean;
  onresult: ((event: SpeechRecognitionEventLike) => void) | null;
  onend: (() => void) | null;
  onerror: ((event: SpeechRecognitionErrorEventLike) => void) | null;
  start(): void;
  stop(): void;
}
type SpeechRecognitionCtor = new () => SpeechRecognitionLike;

const getSpeechRecognitionCtor = (): SpeechRecognitionCtor | undefined => {
  const w = window as unknown as {
    SpeechRecognition?: SpeechRecognitionCtor;
    webkitSpeechRecognition?: SpeechRecognitionCtor;
  };
  return w.SpeechRecognition ?? w.webkitSpeechRecognition;
};

/** How long a single listening session gets before giving up on it — real
 *  on-device dictation can take a few seconds to actually start delivering
 *  results, so this needs real headroom, not just enough to catch a
 *  genuinely-off Dictation setting. Interim results (below) mean this almost
 *  never actually fires in practice once dictation is working at all — the
 *  first partial word arrives long before this. */
const NO_RESULT_TIMEOUT_MS = 12000;

/** Bars in the "listening" level meter, each on its own animation delay so
 *  they bounce out of phase instead of in lockstep. */
const VOICE_BARS = [0, 0.12, 0.24, 0.12, 0];

type DictateButtonProps = {
  /** Called with each finished chunk of speech, to append to the field. */
  onTranscript: (text: string) => void;
  /** Called when this browser has no SpeechRecognition constructor at all
   *  (old Firefox, some in-app browsers). Puts the keyboard up so the user
   *  can at least type, or use whatever dictation the keyboard itself offers. */
  onFocusFallback: () => void;
  /** Fires on every listening/not-listening change. The parent uses this to
   *  swap the (otherwise still-empty) textarea's own placeholder to
   *  something that says recording is happening, right where the reader is
   *  actually looking. */
  onListeningChange?: (listening: boolean) => void;
  /** Fires with the live, not-yet-final guess as it grows, and with '' once
   *  it clears. The parent renders this merged into the textarea's own
   *  value — inside the field the reader is looking at, not in a floating
   *  preview under this button — so there is nothing to swap out once the
   *  chunk goes final; the committed text lands in the exact same spot the
   *  preview was already showing. */
  onInterimChange?: (interim: string) => void;
};

/**
 * "Dictar" button next to a textarea, backed by the Web Speech API.
 *
 * One utterance per tap, not a restarted "continuous" session. An earlier
 * version tried to reproduce continuous listening by calling
 * `recognition.start()` again from inside `onend` every time iOS cut the
 * session short (which it does, regardless of `continuous: true` — a known
 * WebKit limitation). That restart call is not itself a direct response to a
 * user tap, and on a real device it never produced another result. Starting
 * only from `handleClick`, itself always a direct tap, is what real device
 * testing needs.
 *
 * `interimResults: true` is what makes this feel live instead of silent
 * until the whole utterance finishes: WebKit fires `onresult` repeatedly
 * with a growing, not-yet-final guess, reported via `onInterimChange` so the
 * parent can merge it straight into the textarea's own value — inside the
 * field itself, not a floating preview under this button. Once a chunk
 * comes back `isFinal`, it's handed to `onTranscript` and the interim is
 * cleared in the same tick, so the committed text lands in the exact spot
 * the preview was already showing — nothing to swap out afterwards.
 */
export default function DictateButton({
  onTranscript,
  onFocusFallback,
  onListeningChange,
  onInterimChange,
}: DictateButtonProps) {
  const [supported, setSupported] = useState(false);
  const [listening, setListening] = useState(false);
  const [hint, setHint] = useState<string | null>(null);

  const recognitionRef = useRef<SpeechRecognitionLike | null>(null);
  const gotResultRef = useRef(false);
  const noResultTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    setSupported(!!getSpeechRecognitionCtor() && window.isSecureContext);
  }, []);

  useEffect(() => {
    onListeningChange?.(listening);
  }, [listening, onListeningChange]);

  const clearNoResultTimer = () => {
    if (noResultTimer.current) clearTimeout(noResultTimer.current);
    noResultTimer.current = null;
  };

  const showHint = (message: string) => {
    setHint(message);
    window.setTimeout(() => setHint(null), 6000);
  };

  const stop = () => {
    clearNoResultTimer();
    recognitionRef.current?.stop();
    setListening(false);
    onInterimChange?.('');
  };

  useEffect(() => stop, []);

  const handleClick = () => {
    if (!supported) {
      onFocusFallback();
      showHint('Toca el ícono del micrófono en tu teclado para dictar.');
      return;
    }

    if (listening) {
      stop();
      return;
    }

    const Ctor = getSpeechRecognitionCtor();
    if (!Ctor) return;

    const recognition = new Ctor();
    recognition.lang = 'es-CO';
    recognition.continuous = false;
    // Live, not-yet-final guesses as the field's dimmed preview — see the
    // component doc comment for why this is the whole trick.
    recognition.interimResults = true;

    recognition.onresult = (event) => {
      gotResultRef.current = true;
      clearNoResultTimer();

      let finalText = '';
      let interimText = '';
      for (let i = event.resultIndex; i < event.results.length; i += 1) {
        const result = event.results[i];
        if (result.isFinal) finalText += `${result[0].transcript} `;
        else interimText += result[0].transcript;
      }

      if (finalText.trim()) {
        onTranscript(finalText.trim());
        onInterimChange?.('');
        // Explicit, rather than waiting on the browser's own `onend` timing:
        // `continuous: false` means one final result is the whole session,
        // and asking it to stop the instant that arrives — instead of
        // leaving the mic technically still "listening" until WebKit gets
        // around to ending it on its own — is what actually releases it
        // (and drops the OS mic indicator) right away instead of lingering.
        recognitionRef.current?.stop();
      } else {
        onInterimChange?.(interimText);
      }
    };

    recognition.onerror = (event) => {
      if (event.error === 'no-speech') return; // onend right after covers this
      clearNoResultTimer();
      setListening(false);
      onInterimChange?.('');

      if (event.error === 'not-allowed' || event.error === 'service-not-allowed') {
        showHint('Dale permiso de micrófono a esta página para poder dictar.');
        return;
      }

      showHint('No pudimos usar el dictado. Intenta escribir la respuesta.');
    };

    recognition.onend = () => {
      clearNoResultTimer();
      setListening(false);
      onInterimChange?.('');
      if (!gotResultRef.current) {
        showHint(
          'No captamos nada. Revisa que el Dictado esté activado (Ajustes → General → Teclado → Dictado) y que le dieras permiso de micrófono a esta página, y vuelve a tocar Dictar.'
        );
      }
    };

    recognitionRef.current = recognition;
    gotResultRef.current = false;
    setHint(null);

    try {
      recognition.start();
      setListening(true);
    } catch {
      showHint('No pudimos activar el micrófono. Intenta de nuevo.');
      return;
    }

    noResultTimer.current = setTimeout(() => {
      if (!gotResultRef.current) recognition.stop();
    }, NO_RESULT_TIMEOUT_MS);
  };

  return (
    <span className="relative inline-flex items-center">
      <button
        type="button"
        onClick={handleClick}
        aria-pressed={supported ? listening : undefined}
        className={`flex shrink-0 items-center gap-1.5 rounded-full border px-3 py-1.5 text-sm font-semibold transition-colors ${
          listening
            ? 'border-amber bg-amber text-white'
            : 'border-dust text-stone hover:border-amber hover:text-amber'
        }`}
      >
        {listening ? (
          <span aria-hidden className="flex h-4 items-center gap-0.5">
            {VOICE_BARS.map((delay, i) => (
              <span
                key={i}
                className="ds-voice-bar w-[3px] rounded-full bg-white"
                style={{ height: '100%', animationDelay: `${delay}s` }}
              />
            ))}
          </span>
        ) : (
          <Mic className="h-4 w-4" />
        )}
        {listening ? 'Escuchando…' : 'Dictar'}
      </button>

      {hint && (
        <span
          role="status"
          className="absolute bottom-full left-0 mb-2 w-max max-w-[16rem] rounded-[var(--radius-btn)] border border-dust bg-white px-3 py-2 text-xs text-stone shadow-[var(--shadow-md)]"
        >
          {hint}
        </span>
      )}
    </span>
  );
}
