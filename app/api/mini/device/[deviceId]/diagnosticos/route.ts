import { NextRequest, NextResponse } from 'next/server';
import { getDiagnosticosByDeviceId } from '@/lib/api/device';

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ deviceId: string }> }
) {
  try {
    const { deviceId } = await params;
    const diagnosticos = await getDiagnosticosByDeviceId(deviceId);

    return NextResponse.json({ diagnosticos });
  } catch (error) {
    return NextResponse.json(
      { error: 'Error al obtener diagnósticos' },
      { status: 500 }
    );
  }
}