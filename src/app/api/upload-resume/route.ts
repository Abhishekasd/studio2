'use server';
import { NextRequest, NextResponse } from 'next/server';
import { promises as fs } from 'fs';
import pdf from 'pdf-parse';
import { tmpdir } from 'os';
import path from 'path';

// Note: formidable is not used as it has issues in this environment.
// We are manually handling the file upload.

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get('file') as File | null;

    if (!file) {
      return NextResponse.json({ error: 'No file uploaded.' }, { status: 400 });
    }
    
    const tempFilePath = path.join(tmpdir(), file.name);
    await fs.writeFile(tempFilePath, Buffer.from(await file.arrayBuffer()));
    
    let textContent = '';
    const fileBuffer = await fs.readFile(tempFilePath);

    if (file.type === 'application/pdf') {
      const data = await pdf(fileBuffer);
      textContent = data.text;
    } else if (file.type === 'text/plain') {
      textContent = fileBuffer.toString('utf8');
    } else {
       // Clean up the uploaded file
      await fs.unlink(tempFilePath);
      return NextResponse.json({ error: 'Unsupported file type. Please upload a PDF or TXT file.' }, { status: 400 });
    }
    
    // Clean up the uploaded file
    await fs.unlink(tempFilePath);

    return NextResponse.json({ text: textContent });

  } catch (error: any) {
    console.error('Upload error:', error);
    return NextResponse.json({ error: 'Failed to process file.', details: error.message }, { status: 500 });
  }
}
