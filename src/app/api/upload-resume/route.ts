'use server';
import { NextRequest, NextResponse } from 'next/server';
import pdf from 'pdf-parse';

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get('file') as File | null;

    if (!file) {
      return NextResponse.json({ error: 'No file uploaded.' }, { status: 400 });
    }

    const fileBuffer = Buffer.from(await file.arrayBuffer());
    let textContent = '';

    if (file.type === 'application/pdf') {
      const data = await pdf(fileBuffer);
      textContent = data.text;
    } else if (file.type === 'text/plain') {
      textContent = fileBuffer.toString('utf8');
    } else {
      return NextResponse.json({ error: 'Unsupported file type. Please upload a PDF or TXT file.' }, { status: 400 });
    }

    return NextResponse.json({ text: textContent });

  } catch (error: any) {
    console.error('Upload error:', error);
    return NextResponse.json({ error: 'Failed to process file.', details: error.message }, { status: 500 });
  }
}
