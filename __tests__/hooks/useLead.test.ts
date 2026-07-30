import { describe, it, expect, beforeEach } from '@jest/globals';
import { renderHook, waitFor } from '@testing-library/react';
import { useLead } from '@/lib/hooks/useLead';
import { saveLead } from '@/lib/storage/leadStorage';

const LEAD = {
  leadId: 'lead-1',
  deviceId: 'device-1',
  nombre: 'Samuel',
  empresa: 'Kreanding',
  whatsapp: '+573001234567',
};

beforeEach(() => {
  localStorage.clear();
});

describe('useLead', () => {
  it('resuelve a null cuando no hay lead guardado', async () => {
    const { result } = renderHook(() => useLead());
    await waitFor(() => expect(result.current).toBeNull());
  });

  it('resuelve al lead guardado cuando sí existe', async () => {
    saveLead(LEAD);
    const { result } = renderHook(() => useLead());
    await waitFor(() => expect(result.current).toEqual(LEAD));
  });

  it('nunca se resuelve a null cuando hay un lead guardado (la regresión real)', async () => {
    // Esta es la garantía que le importa a cada página que hace
    // `if (lead === null) router.replace('/gatekeeping')`: mientras exista
    // un lead guardado, este hook no debe pasar nunca por un valor que un
    // consumidor pueda confundir con "confirmado que no hay lead" — antes
    // del fix, el primer render usaba el snapshot del servidor (null) y una
    // página que redirigía con `if (!lead)` lo hacía antes de que este hook
    // alcanzara a leer el valor real de localStorage.
    saveLead(LEAD);
    const vistos: Array<typeof LEAD | null | undefined> = [];
    const { result, rerender } = renderHook(() => {
      const lead = useLead();
      vistos.push(lead);
      return lead;
    });
    rerender();
    await waitFor(() => expect(result.current).toEqual(LEAD));

    expect(vistos.some((v) => v === null)).toBe(false);
  });
});
