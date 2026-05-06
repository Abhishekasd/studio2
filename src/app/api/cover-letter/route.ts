import { NextRequest, NextResponse } from 'next/server';
import { generateCoverLetter } from '@/ai/flows/generate-cover-letter';

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { resumeText, jobDescription } = body;

    if (!resumeText || !jobDescription) {
      return NextResponse.json({ error: 'Both resumeText and jobDescription are required.' }, { status: 400 });
    }

    const result = await generateCoverLetter({ resumeText, jobDescription });

    return NextResponse.json(result);

  } catch (error: any) {
    console.error('Error generating cover letter:', error);
    return NextResponse.json({ error: 'Error generating cover letter', details: error.message }, { status: 500 });
  }
}
