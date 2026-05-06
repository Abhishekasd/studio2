'use server';

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

const GenerateCoverLetterInputSchema = z.object({
  resumeText: z.string().describe('The user\'s resume content in plain text'),
  jobDescription: z.string().describe('The job description they are applying for'),
});
export type GenerateCoverLetterInput = z.infer<typeof GenerateCoverLetterInputSchema>;

const GenerateCoverLetterOutputSchema = z.object({
  coverLetter: z.string().describe('The generated professional cover letter text.'),
});
export type GenerateCoverLetterOutput = z.infer<typeof GenerateCoverLetterOutputSchema>;

export async function generateCoverLetter(input: GenerateCoverLetterInput): Promise<GenerateCoverLetterOutput> {
  return generateCoverLetterFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generateCoverLetterPrompt',
  input: { schema: GenerateCoverLetterInputSchema },
  output: { schema: GenerateCoverLetterOutputSchema },
  model: 'openai/gpt-4o-mini',
  prompt: `
You are an expert career coach and executive resume writer. 
Your task is to write a highly professional, engaging, and tailored cover letter.

Here is the user's resume:
---
{{{resumeText}}}
---

Here is the job description they are applying for:
---
{{{jobDescription}}}
---

Instructions:
1. Write a compelling cover letter connecting the user's specific experience from their resume to the requirements in the job description.
2. Keep it professional but modern and enthusiastic.
3. It should be 3-4 paragraphs long.
4. Do not include placeholder text like [Your Name] at the bottom if the name is available in the resume, but if it isn't, use placeholders.
5. Focus on the value the candidate brings to the company.
6. Return only the text of the cover letter.
`,
});

const generateCoverLetterFlow = ai.defineFlow(
  {
    name: 'generateCoverLetterFlow',
    inputSchema: GenerateCoverLetterInputSchema,
    outputSchema: GenerateCoverLetterOutputSchema,
  },
  async (input) => {
    const { output } = await prompt(input);
    return output!;
  }
);
