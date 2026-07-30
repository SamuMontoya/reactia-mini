import { describe, it, expect } from '@jest/globals';
import { render, screen } from '@testing-library/react';
import ExpiradoModal from '@/app/reactia-mini/resultado/ExpiradoModal';

describe('ExpiradoModal', () => {
  it('muestra el mensaje de expiración y el enlace de WhatsApp con el mensaje dado', () => {
    render(<ExpiradoModal mensajeWhatsApp="Hola, mi diagnóstico expiró" />);

    expect(screen.getByText('Tu diagnóstico expiró')).toBeInTheDocument();

    const link = screen.getByRole('link', { name: /Escribirnos por WhatsApp/i });
    expect(link).toHaveAttribute('href', expect.stringContaining('wa.me'));
    expect(decodeURIComponent(link.getAttribute('href') ?? '')).toContain(
      'Hola, mi diagnóstico expiró'
    );
  });

  it('renderiza como un dialog modal accesible', () => {
    render(<ExpiradoModal mensajeWhatsApp="mensaje" />);
    expect(screen.getByRole('dialog')).toHaveAttribute('aria-modal', 'true');
  });
});
