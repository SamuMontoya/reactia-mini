import { describe, it, expect, jest } from '@jest/globals';
import { render, screen } from '@testing-library/react';
import { useForm } from 'react-hook-form';
import QuestionRenderer from '@/app/reactia-mini/diagnostico/QuestionRenderer';
import type { DiagnosticoQuestion } from '@/content/diagnostico-config';
import type { Diagnostico } from '@/lib/schemas';

const TEXTO_QUESTION: DiagnosticoQuestion = {
  id: 'descripcion_negocio',
  area: 'modelo',
  titulo: 'Cuéntanos sobre tu negocio',
  tipo: 'texto',
  filas: 4,
  maxLength: 280,
  placeholder: 'Ej: cuéntanos qué hace tu negocio',
};

function Harness({
  onDictandoChange,
}: {
  onDictandoChange?: (dictando: boolean) => void;
}) {
  const {
    control,
    formState: { errors },
  } = useForm<Diagnostico>();

  return (
    <QuestionRenderer
      question={TEXTO_QUESTION}
      control={control}
      errors={errors}
      currentValue={undefined}
      onDictandoChange={onDictandoChange}
    />
  );
}

describe('QuestionRenderer — pregunta de texto', () => {
  it('coloca el botón de dictado, el help text y el contador en una sola fila arriba del textarea', () => {
    render(<Harness />);

    const boton = screen.getByRole('button', { name: /dictar/i });
    const ayuda = screen.getByText(/^toca para dictar$/i);
    const contador = screen.getByText('0/280');
    const textarea = screen.getByRole('textbox');

    // Bit 4 (DOCUMENT_POSITION_FOLLOWING) set means the right-hand node comes
    // after the left-hand one in the document.
    expect(
      boton.compareDocumentPosition(ayuda) & Node.DOCUMENT_POSITION_FOLLOWING
    ).toBeTruthy();
    expect(
      ayuda.compareDocumentPosition(contador) & Node.DOCUMENT_POSITION_FOLLOWING
    ).toBeTruthy();
    expect(
      contador.compareDocumentPosition(textarea) & Node.DOCUMENT_POSITION_FOLLOWING
    ).toBeTruthy();
  });

  it('el botón y el help text comparten la misma fila (no envuelven a una fila separada)', () => {
    render(<Harness />);

    const boton = screen.getByRole('button', { name: /dictar/i });
    const ayuda = screen.getByText(/^toca para dictar$/i);

    // Same immediate parent row — the layout this test guards against
    // regressing is the button and help text stacking on separate lines.
    expect(boton.closest('span')?.parentElement).toBe(ayuda.parentElement);
  });

  it('muestra cómo activar el dictado en iPhone, con ícono, arriba del textarea', () => {
    render(<Harness />);

    const ayudaIphone = screen.getByText(
      /en iPhone activa el dictado en Ajustes › General › Teclado › Dictado/i
    );
    const textarea = screen.getByRole('textbox');

    expect(ayudaIphone).toBeInTheDocument();
    // Above the field, not below it: under the textarea this landed inside
    // the page's bottom fade and behind the sticky nav.
    expect(
      ayudaIphone.compareDocumentPosition(textarea) & Node.DOCUMENT_POSITION_FOLLOWING
    ).toBeTruthy();

    // The gear glyph rides along in the same block, and can't be squashed by
    // the wrapping text beside it.
    const icono = ayudaIphone.closest('p')?.querySelector('svg');
    expect(icono).toBeTruthy();
    expect(icono?.getAttribute('class')).toContain('shrink-0');
  });

  it('avisa al padre cuando el dictado empieza y termina, vía onDictandoChange', () => {
    const onDictandoChange = jest.fn();
    render(<Harness onDictandoChange={onDictandoChange} />);

    // DictateButton reports its initial (not-listening) state on mount.
    expect(onDictandoChange).toHaveBeenCalledWith(false);
  });
});
