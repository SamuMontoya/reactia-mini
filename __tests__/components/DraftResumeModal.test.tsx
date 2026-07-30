import { describe, it, expect, jest } from '@jest/globals';
import { render, screen, fireEvent } from '@testing-library/react';
import DraftResumeModal from '@/app/reactia-mini/diagnostico/DraftResumeModal';

describe('DraftResumeModal', () => {
  it('muestra el mensaje de borrador guardado y ambas opciones', () => {
    render(<DraftResumeModal onContinuar={jest.fn()} onEmpezarDeNuevo={jest.fn()} />);

    expect(screen.getByText('Saliste sin querer')).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: 'Continuar donde quedé' })
    ).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Empezar de nuevo' })).toBeInTheDocument();
  });

  it('llama a onContinuar al tocar "Continuar donde quedé"', () => {
    const onContinuar = jest.fn();
    render(<DraftResumeModal onContinuar={onContinuar} onEmpezarDeNuevo={jest.fn()} />);

    fireEvent.click(screen.getByRole('button', { name: 'Continuar donde quedé' }));

    expect(onContinuar).toHaveBeenCalledTimes(1);
  });

  it('llama a onEmpezarDeNuevo al tocar "Empezar de nuevo"', () => {
    const onEmpezarDeNuevo = jest.fn();
    render(<DraftResumeModal onContinuar={jest.fn()} onEmpezarDeNuevo={onEmpezarDeNuevo} />);

    fireEvent.click(screen.getByRole('button', { name: 'Empezar de nuevo' }));

    expect(onEmpezarDeNuevo).toHaveBeenCalledTimes(1);
  });

  it('renderiza en un dialog accesible con aria-modal', () => {
    render(<DraftResumeModal onContinuar={jest.fn()} onEmpezarDeNuevo={jest.fn()} />);

    const dialog = screen.getByRole('dialog');
    expect(dialog).toHaveAttribute('aria-modal', 'true');
  });
});
