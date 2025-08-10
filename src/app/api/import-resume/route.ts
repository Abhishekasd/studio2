import { NextRequest, NextResponse } from 'next/server';
import pdf from 'pdf-parse';
import mammoth from 'mammoth';
import { importResume } from '@/ai/flows/import-resume';

export const config = {
  api: {
    bodyParser: false,
  },
};

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('resume') as File | null;

    if (!file) {
      return NextResponse.json({ error: 'No file uploaded.' }, { status: 400 });
    }

    const allowedTypes = [
      'application/pdf',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'text/plain',
    ];

    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json({ error: `Unsupported file type: ${file.type}. Please upload a PDF, DOCX, or TXT file.` }, { status: 400 });
    }
    
    const buffer = Buffer.from(await file.arrayBuffer());
    let extractedText = '';

    if (file.type === 'application/pdf') {
      const data = await pdf(buffer);
      extractedText = data.text;
    } else if (file.type === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document') {
      const { value } = await mammoth.extractRawText({ buffer });
      extractedText = value;
    } else if (file.type === 'text/plain') {
      extractedText = buffer.toString('utf8');
    }

    if (!extractedText.trim()) {
        return NextResponse.json({ error: 'Could not extract text from the file.' }, { status: 400 });
    }

    const result = await importResume({ resumeText: extractedText });

    return NextResponse.json(result);

  } catch (error: any) {
    console.error('Error processing resume:', error);
    return NextResponse.json({ error: 'Error processing resume', details: error.message }, { status: 500 });
  }
}
