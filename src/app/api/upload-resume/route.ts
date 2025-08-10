import { NextRequest, NextResponse } from 'next/server';
import { promises as fs } from 'fs';
import formidable from 'formidable';
import pdf from 'pdf-parse';
import { tmpdir } from 'os';
import path from 'path';

export const config = {
  api: {
    bodyParser: false,
  },
};

async function parseFormData(req: NextRequest): Promise<{ fields: formidable.Fields; files: formidable.Files }> {
  const formData = await req.formData();
  const form = formidable({
      maxFiles: 1,
      maxFileSize: 1024 * 1024 * 5, // 5MB
      uploadDir: tmpdir(),
  });

  const formidableFiles: formidable.Files = {};

  for (const [key, value] of formData.entries()) {
      if (value instanceof File) {
          const tempFilePath = path.join(tmpdir(), value.name);
          await fs.writeFile(tempFilePath, Buffer.from(await value.arrayBuffer()));
          const file = new formidable.File({
            filepath: tempFilePath,
            originalFilename: value.name,
            mimetype: value.type,
            size: value.size,
          });
          file.filepath = tempFilePath; // formidable.File is not a class, so we have to do this
          if (!formidableFiles[key]) {
            formidableFiles[key] = [];
          }
          (formidableFiles[key] as formidable.File[]).push(file);
      }
  }

  // formidable's parse returns fields as arrays. We can just return empty for this use case.
  const fields = {};
  
  // formidable expects files to be in arrays. Let's handle single file case
  const finalFiles: formidable.Files = {};
  for(const key in formidableFiles) {
      const fileList = formidableFiles[key];
      if(Array.isArray(fileList) && fileList.length === 1) {
          finalFiles[key] = fileList[0];
      } else {
          finalFiles[key] = fileList;
      }
  }

  return { fields, files: finalFiles };
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
