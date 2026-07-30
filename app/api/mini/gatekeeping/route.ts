import { NextRequest, NextResponse } from 'next/server';
import { submitGatekeeping } from '@/lib/api/gatekeeping';
import { gatekeepingSchema } from '@/lib/schemas';
import { getErrorMessage } from '@/lib/getErrorMessage';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { deviceId, ...formData } = body;
    const validData = gatekeepingSchema.parse(formData);
    const result = await submitGatekeeping(validData, deviceId);

    return NextResponse.json(result, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { error: getErrorMessage(error) },
      { status: 400 }
    );
  }
}
