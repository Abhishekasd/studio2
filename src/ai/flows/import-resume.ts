'use server';

/**
 * @fileOverview Processes an uploaded resume, improves it with AI, and returns structured data.
 * 
 * - importResume - A function that takes resume text, enhances it, and structures it.
 * - ImportResumeInput - The input type for the importResume function.
 * - ImportResumeOutput - The return type for the importResume function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

const ImportResumeInputSchema = z.object({
  resumeText: z.string().describe('The raw text extracted from the user\'s resume file.'),
});
export type ImportResumeInput = z.infer<typeof ImportResumeInputSchema>;

const ImportResumeOutputSchema = z.object({
  improvedText: z.string().describe('An improved, clean text version of the entire resume, optimized for clarity and impact.'),
  jsonData: z.object({
    name: z.string().optional(),
    email: z.string().optional(),
    phone: z.string().optional(),
    website: z.string().optional(),
    linkedin: z.string().optional(),
    summary: z.string().optional(),
    skills: z.array(z.object({ value: z.string() })).optional(),
    experience: z.array(z.object({
      title: z.string(),
      company: z.string(),
      dates: z.string(),
      description: z.string(),
    })).optional(),
    education: z.array(z.object({
      degree: z.string(),
      institution: z.string(),
      dates: z.string(),
    })).optional(),
    certifications: z.array(z.object({ name: z.string(), source: z.string() })).optional(),
    projects: z.array(z.object({ name: z.string(), description: z.string(), url: z.string().optional() })).optional(),
    achievements: z.array(z.object({ value: z.string() })).optional(),
    publications: z.array(z.object({ title: z.string(), url: z.string().optional() })).optional(),
  }).describe('The structured JSON data extracted and inferred from the resume.'),
});
export type ImportResumeOutput = z.infer<typeof ImportResumeOutputSchema>;


export async function importResume(input: ImportResumeInput): Promise<ImportResumeOutput> {
  return importResumeFlow(input);
}

const prompt = ai.definePrompt({
  name: 'importResumePrompt',
  input: { schema: ImportResumeInputSchema },
  output: { schema: ImportResumeOutputSchema },
  model: 'googleai/gemini-1.5-flash',
  prompt: `
You are a world-class professional resume editor and career consultant.
Your task is to analyze, enhance, and structure the provided resume text.

**Instructions:**
1.  **Analyze and Enhance:** Carefully read the resume text. Correct any grammar or spelling mistakes. Rewrite vague descriptions to be more impactful using strong action verbs and quantifiable achievements. Ensure the tone is professional and optimized for Applicant Tracking Systems (ATS).
2.  **Preserve Details:** Maintain all original personal information (name, contact details, links) exactly as provided.
3.  **Extract and Structure:** Populate a structured JSON object with the extracted and improved information. The JSON fields are: name, email, phone, website, linkedin, summary, skills[], experience[], education[], certifications[], projects[], achievements[], publications[].
    - For array fields like 'skills', 'experience', etc., create an object for each entry.
    - For 'description' in experience, format it as a single string with bullet points separated by newlines (e.g., "• Achievement 1\n• Achievement 2").
4.  **Generate Clean Text:** Create a clean, well-formatted text version of the entire enhanced resume.

**Resume Text to Process:**
\`\`\`
{{{resumeText}}}
\`\`\`

**Output:**
You must provide both the improved text version and the structured JSON data.
`,
});

const importResumeFlow = ai.defineFlow(
  {
    name: 'importResumeFlow',
    inputSchema: ImportResumeInputSchema,
    outputSchema: ImportResumeOutputSchema,
  },
  async (input) => {
    const { output } = await prompt(input);
    return output!;
  }
);
