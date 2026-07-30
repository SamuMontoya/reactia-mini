import { NextRequest, NextResponse } from 'next/server';
import { saveDiagnostico } from '@/lib/api/diagnosticos';
import { getErrorMessage } from '@/lib/getErrorMessage';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { leadId, respuestas, deviceId } = body;

    const result = await saveDiagnostico(leadId, respuestas, deviceId);

    return NextResponse.json(result, { status: 201 });
  } catch (error) {
    const message = getErrorMessage(error);
    if (message === 'Lead no encontrado') {
      return NextResponse.json({ error: message }, { status: 404 });
    }
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
