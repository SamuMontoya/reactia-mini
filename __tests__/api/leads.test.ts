import { describe, it, expect, jest, beforeEach } from '@jest/globals';
import { updateLeadEmail } from '@/lib/api/leads';

type SingleResult = {
  data: { id: string; estado: string } | null;
  error: { message: string } | null;
};
type UpdateResult = { error: { message: string } | null };

const mockSingle = jest.fn<() => Promise<SingleResult>>();
const mockUpdateEq = jest.fn<() => Promise<UpdateResult>>();

jest.mock('@/lib/supabase', () => ({
  supabase: {
    from: jest.fn(() => ({
      select: jest.fn(() => ({
        eq: jest.fn(() => ({
          single: mockSingle,
        })),
      })),
      update: jest.fn(() => ({
        eq: mockUpdateEq,
      })),
    })),
  },
}));

beforeEach(() => {
  mockSingle.mockReset();
  mockUpdateEq.mockReset();
  mockUpdateEq.mockResolvedValue({ error: null });
});

describe('updateLeadEmail', () => {
  it('actualiza el email si el lead está en no_calificado', async () => {
    mockSingle.mockResolvedValue({
      data: { id: 'lead-1', estado: 'no_calificado' },
      error: null,
    });

    const result = await updateLeadEmail('lead-1', 'test@example.com');

    expect(result).toEqual({ success: true });
  });

  it('rechaza si el lead tiene estado distinto a no_calificado', async () => {
    mockSingle.mockResolvedValue({
      data: { id: 'lead-1', estado: 'calificado_pendiente' },
      error: null,
    });

    await expect(
      updateLeadEmail('lead-1', 'test@example.com')
    ).rejects.toThrow();
  });

  it('rechaza si el lead no existe', async () => {
    mockSingle.mockResolvedValue({
      data: null,
      error: { message: 'Row not found' },
    });

    await expect(
      updateLeadEmail('lead-x', 'test@example.com')
    ).rejects.toThrow();
  });
});
