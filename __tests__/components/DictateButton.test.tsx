import { describe, it, expect, jest, beforeEach, afterEach } from '@jest/globals';
import { render, screen, fireEvent, act } from '@testing-library/react';
import DictateButton from '@/components/ui/DictateButton';

type ResultLike = { 0: { transcript: string }; isFinal: boolean };
type EventLike = { resultIndex: number; results: ResultLike[] };

/** Minimal stand-in for the Web Speech API, controlled manually from each
 *  test rather than emitting events on its own — real timing/async behaviour
 *  here is exactly what's inconsistent across browsers, which is the whole
 *  reason DictateButton can't just trust it. */
class FakeSpeechRecognition {
  lang = '';
  continuous = false;
  interimResults = false;
  onresult: ((event: EventLike) => void) | null = null;
  onerror: ((event: { error: string }) => void) | null = null;
  onend: (() => void) | null = null;
  start = jest.fn();
  stop = jest.fn();
}

let lastInstance: FakeSpeechRecognition;

beforeEach(() => {
  Object.defineProperty(window, 'isSecureContext', {
    value: true,
    configurable: true,
  });
  (window as unknown as { SpeechRecognition: unknown }).SpeechRecognition = jest.fn(
    () => {
      lastInstance = new FakeSpeechRecognition();
      return lastInstance;
    }
  );
});

afterEach(() => {
  delete (window as unknown as { SpeechRecognition?: unknown }).SpeechRecognition;
});

const interimResult = (transcript: string): EventLike => ({
  resultIndex: 0,
  results: [{ 0: { transcript }, isFinal: false }],
});

describe('DictateButton', () => {
  it('es un botón primario ámbar sólido, no un outline', () => {
    render(<DictateButton onTranscript={() => {}} onFocusFallback={() => {}} />);

    const boton = screen.getByRole('button', { name: /dictar/i });
    expect(boton.className).toContain('bg-amber');
    expect(boton.className).toContain('text-white');
    // Not the old muted-until-hover outline treatment.
    expect(boton.className).not.toContain('border-dust');
    expect(boton.className).not.toContain('text-stone');
    expect(boton.className).not.toContain('text-amber-dim');
  });

  it('confirma el interim pendiente al tocar el botón para detener el dictado manualmente', () => {
    const onTranscript = jest.fn();
    render(<DictateButton onTranscript={onTranscript} onFocusFallback={() => {}} />);

    fireEvent.click(screen.getByRole('button', { name: /dictar/i }));
    act(() => {
      lastInstance.onresult?.(interimResult('hola como estas'));
    });

    // Tap again while "Escuchando…" — the manual stop path.
    fireEvent.click(screen.getByRole('button', { name: /escuchando/i }));

    expect(onTranscript).toHaveBeenCalledWith('hola como estas');
  });

  it('desconecta los manejadores del reconocimiento al detener manualmente, para no confirmar dos veces', () => {
    const onTranscript = jest.fn();
    render(<DictateButton onTranscript={onTranscript} onFocusFallback={() => {}} />);

    fireEvent.click(screen.getByRole('button', { name: /dictar/i }));
    act(() => {
      lastInstance.onresult?.(interimResult('texto parcial'));
    });

    fireEvent.click(screen.getByRole('button', { name: /escuchando/i }));

    expect(onTranscript).toHaveBeenCalledTimes(1);
    expect(onTranscript).toHaveBeenCalledWith('texto parcial');
    // The real engine checks `recognition.onresult` itself before calling
    // it — nulling it out here is what stops a final result the engine
    // still delivers after `.stop()` from landing a second time.
    expect(lastInstance.onresult).toBeNull();
    expect(lastInstance.onend).toBeNull();
    expect(lastInstance.onerror).toBeNull();
  });

  it('confirma el interim pendiente si el reconocimiento se corta solo sin resultado final', () => {
    const onTranscript = jest.fn();
    render(<DictateButton onTranscript={onTranscript} onFocusFallback={() => {}} />);

    fireEvent.click(screen.getByRole('button', { name: /dictar/i }));
    act(() => {
      lastInstance.onresult?.(interimResult('se cortó solo'));
    });

    // WebKit ending the session on its own (see the component's doc
    // comment) — nothing calls `stop()`, `onend` just fires.
    act(() => {
      lastInstance.onend?.();
    });

    expect(onTranscript).toHaveBeenCalledWith('se cortó solo');
  });
});
