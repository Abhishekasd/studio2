import { NextRequest, NextResponse } from 'next/server';
import { promises as fs } from 'fs';
import formidable from 'formidable';
import pdf from 'pdf-parse';

export const config = {
  api: {
    bodyParser: false,
  },
};

async function parseFormData(req: NextRequest): Promise<{ fields: formidable.Fields; files: formidable.Files }> {
    const readable = req.body || new ReadableStream();
    const contentType = req.headers.get('content-type') || '';
    
    return new Promise((resolve, reject) => {
        const form = formidable({ 
            maxFiles: 1,
            maxFileSize: 1024 * 1024 * 5, // 5MB
        });
        
        const chunks: Uint8Array[] = [];
        const reader = readable.getReader();

        function pump(): Promise<void> {
            return reader.read().then(({ done, value }) => {
                if (done) {
                    const buffer = Buffer.concat(chunks);
                    (form as any).req = { headers: { 'content-type': contentType } };
                    form.parse(buffer, (err, fields, files) => {
                        if (err) {
                            reject(err);
                        } else {
                            resolve({ fields, files });
                        }
                    });
                    return;
                }
                chunks.push(value);
                return pump();
            });
        }
        pump().catch(reject);
    });
}


export async function POST(req: NextRequest) {
  try {
    const { files } = await parseFormData(req);
    const file = Array.isArray(files.file) ? files.file[0] : files.file;

    if (!file) {
      return NextResponse.json({ error: 'No file uploaded.' }, { status: 400 });
    }

    let textContent = '';
    const fileBuffer = await fs.readFile(file.filepath);

    if (file.mimetype === 'application/pdf') {
      const data = await pdf(fileBuffer);
      textContent = data.text;
    } else if (file.mimetype === 'text/plain') {
      textContent = fileBuffer.toString('utf8');
    } else {
      return NextResponse.json({ error: 'Unsupported file type. Please upload a PDF or TXT file.' }, { status: 400 });
    }
    
    // Clean up the uploaded file
    await fs.unlink(file.filepath);

    return NextResponse.json({ text: textContent });

  } catch (error: any) {
    console.error('Upload error:', error);
    return NextResponse.json({ error: 'Failed to process file.', details: error.message }, { status: 500 });
  }
}