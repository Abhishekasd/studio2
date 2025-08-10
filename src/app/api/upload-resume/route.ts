'use server';
import { NextRequest, NextResponse } from 'next/server';
import pdf from 'pdf-parse';
import formidable from 'formidable';
import { promises as fs } from 'fs';

// Disable the default body parser to handle file uploads with formidable
export const config = {
  api: {
    bodyParser: false,
  },
};

const parseForm = (req: NextRequest): Promise<{ fields: formidable.Fields; files: formidable.Files }> => {
    return new Promise((resolve, reject) => {
        const form = formidable({});
        // The 'req' object in Next.js 13+ app router is not directly compatible with what formidable expects.
        // We need to cast it to any to make it work.
        form.parse(req as any, (err, fields, files) => {
            if (err) {
                reject(err);
            }
            resolve({ fields, files });
        });
    });
};

export async function POST(req: NextRequest) {
  try {
    const { files } = await parseForm(req);
    const file = Array.isArray(files.file) ? files.file[0] : files.file;

    if (!file) {
      return NextResponse.json({ error: 'No file uploaded.' }, { status: 400 });
    }

    const fileBuffer = await fs.readFile(file.filepath);
    let textContent = '';

    if (file.mimetype === 'application/pdf') {
      const data = await pdf(fileBuffer);
      textContent = data.text;
    } else if (file.mimetype === 'text/plain') {
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
