import { NextRequest, NextResponse } from 'next/server';
import { callGroqScoring } from '@/lib/api/scoring';
import { saveResultado } from '@/lib/api/resultados';
import { getErrorMessage } from '@/lib/getErrorMessage';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { diagnosticoId, respuestas } = body;

    let scoringResult;
    try {
      scoringResult = await callGroqScoring(diagnosticoId, respuestas);
    } catch (groqError) {
      return NextResponse.json({ error: getErrorMessage(groqError) }, { status: 502 });
    }

    const result = await saveResultado(diagnosticoId, scoringResult);

    return NextResponse.json(result, { status: 201 });
  } catch (error) {
    const message = getErrorMessage(error);
    if (message === 'Diagnóstico no encontrado') {
      return NextResponse.json({ error: message }, { status: 404 });
    }
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
