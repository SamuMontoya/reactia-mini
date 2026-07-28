import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { updateLeadEmail } from '@/lib/api/leads';
import { getErrorMessage } from '@/lib/getErrorMessage';

const emailBodySchema = z.object({
  email: z.string().email('Email inválido'),
});

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ leadId: string }> }
) {
  try {
    const { leadId } = await params;
    const body = await req.json();
    const { email } = emailBodySchema.parse(body);

    const result = await updateLeadEmail(leadId, email);

    return NextResponse.json(result, { status: 200 });
  } catch (error) {
    const message = getErrorMessage(error);
    if (message === 'Lead no encontrado') {
      return NextResponse.json({ error: message }, { status: 404 });
    }
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
