import { describe, it, expect } from '@jest/globals';
import { formatPhoneInput, nationalDigits, toE164Colombia } from '@/lib/format';

describe('nationalDigits', () => {
  it('deja pasar 10 dígitos tal cual', () => {
    expect(nationalDigits('3001234567')).toBe('3001234567');
  });

  it('descarta cualquier carácter que no sea dígito', () => {
    expect(nationalDigits('300-123-4567')).toBe('3001234567');
    expect(nationalDigits('300 abc 123 4567')).toBe('3001234567');
  });

  it('corta en 10 dígitos, sin permitir un onceavo', () => {
    expect(nationalDigits('30012345678')).toBe('3001234567');
  });

  it('quita un prefijo +57/0057 pegado por el usuario en vez de contarlo como parte del número', () => {
    expect(nationalDigits('573001234567')).toBe('3001234567');
    expect(nationalDigits('0057300123456 7')).toBe('3001234567');
  });
});

describe('toE164Colombia', () => {
  it('devuelve +57 seguido de los 10 dígitos cuando el número está completo', () => {
    expect(toE164Colombia('300 123 4567')).toBe('+573001234567');
  });

  it('devuelve cadena vacía mientras falten dígitos, en vez de un número incompleto', () => {
    expect(toE164Colombia('300 123')).toBe('');
    expect(toE164Colombia('')).toBe('');
  });
});

describe('formatPhoneInput', () => {
  it('agrupa en 3-3-4 a medida que se escribe', () => {
    expect(formatPhoneInput('3001234567')).toBe('300 123 4567');
    expect(formatPhoneInput('300')).toBe('300');
    expect(formatPhoneInput('30012')).toBe('300 12');
  });
});
