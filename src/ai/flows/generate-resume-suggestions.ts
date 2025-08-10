'use server';

/**
 * @fileOverview Generates resume suggestions based on job title and industry.
 *
 * - generateResumeSuggestions - A function that generates resume suggestions.
 * - GenerateResumeSuggestionsInput - The input type for the generateResumeSuggestions function.
 * - GenerateResumeSuggestionsOutput - The return type for the generateResumeSuggestions function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GenerateResumeSuggestionsInputSchema = z.object({
  jobTitle: z.string().describe('The job title of the user.'),
  industry: z.string().describe('The industry of the user.'),
});
export type GenerateResumeSuggestionsInput = z.infer<typeof GenerateResumeSuggestionsInputSchema>;

const GenerateResumeSuggestionsOutputSchema = z.object({
  skills: z.array(z.string()).describe('Suggested skills for the job title and industry.'),
  education: z.array(z.string()).describe('Suggested education details for the job title and industry.'),
  experience: z.array(z.string()).describe('Suggested experience details for the job title and industry.'),
});
export type GenerateResumeSuggestionsOutput = z.infer<typeof GenerateResumeSuggestionsOutputSchema>;

export async function generateResumeSuggestions(input: GenerateResumeSuggestionsInput): Promise<GenerateResumeSuggestionsOutput> {
  return generateResumeSuggestionsFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generateResumeSuggestionsPrompt',
  input: {schema: GenerateResumeSuggestionsInputSchema},
  output: {schema: GenerateResumeSuggestionsOutputSchema},
  model: 'googleai/gemini-1.5-flash',
  prompt: `You are an AI resume expert. You will provide suggestions for skills, education, and experience based on the user's job title and industry.

Job Title: {{{jobTitle}}}
Industry: {{{industry}}}

Provide suggestions for skills, education, and experience.`,
});

const generateResumeSuggestionsFlow = ai.defineFlow(
  {
    name: 'generateResumeSuggestionsFlow',
    inputSchema: GenerateResumeSuggestionsInputSchema,
    outputSchema: GenerateResumeSuggestionsOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
