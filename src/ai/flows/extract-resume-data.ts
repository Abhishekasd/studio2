'use server';

/**
 * @fileOverview Extracts structured data from raw resume text.
 *
 * - extractResumeData - A function that parses resume text.
 * - ExtractResumeDataInput - The input type for the extractResumeData function.
 * - ExtractResumeDataOutput - The return type for the extractResumeData function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const ExtractResumeDataInputSchema = z.object({
  resumeText: z.string().describe('The full text content of a resume.'),
});
export type ExtractResumeDataInput = z.infer<typeof ExtractResumeDataInputSchema>;

const ExtractResumeDataOutputSchema = z.object({
    contact: z.object({
        name: z.string().describe("The user's full name."),
        email: z.string().describe("The user's email address."),
        phone: z.string().describe("The user's phone number."),
        website: z.string().optional().describe("The user's personal website or portfolio URL."),
        linkedin: z.string().optional().describe("The user's LinkedIn profile URL."),
    }),
    summary: z.string().optional().describe("The professional summary or objective statement."),
    skills: z.array(z.object({ value: z.string() })).describe("A list of the user's skills."),
    experience: z.array(z.object({
        title: z.string().describe("The job title."),
        company: z.string().describe("The company name."),
        dates: z.string().describe("The dates of employment."),
        description: z.string().describe("A description of responsibilities and achievements."),
    })).describe("A list of the user's work experience."),
    education: z.array(z.object({
        degree: z.string().describe("The degree or certificate obtained."),
        institution: z.string().describe("The name of the educational institution."),
        dates: z.string().describe("The dates of attendance."),
    })).describe("A list of the user's education history."),
    certifications: z.array(z.object({ name: z.string(), source: z.string() })).optional().describe("A list of certifications."),
    projects: z.array(z.object({ name: z.string(), description: z.string(), url: z.string().optional() })).optional().describe("A list of personal or professional projects."),
    achievements: z.array(z.object({ value: z.string() })).optional().describe("A list of key achievements."),
    publications: z.array(z.object({ title: z.string(), url: z.string().optional() })).optional().describe("A list of publications."),
    references: z.string().optional().describe("Information about references, usually 'Available upon request'."),
});
export type ExtractResumeDataOutput = z.infer<typeof ExtractResumeDataOutputSchema>;


export async function extractResumeData(input: ExtractResumeDataInput): Promise<ExtractResumeDataOutput> {
  return extractResumeDataFlow(input);
}

const prompt = ai.definePrompt({
  name: 'extractResumeDataPrompt',
  input: {schema: ExtractResumeDataInputSchema},
  output: {schema: ExtractResumeDataOutputSchema},
  model: 'googleai/gemini-1.5-flash',
  prompt: `You are an expert resume parser. Your task is to extract structured information from the provided resume text and return it as a JSON object. The output must conform to the specified schema.

Analyze the following resume text:
---
{{{resumeText}}}
---

Extract the information for the following fields: contact (name, email, phone, website, linkedin), summary, skills (as an array of objects with a 'value' property), experience (including title, company, dates, and description), education (including degree, institution, and dates), and any other available sections like certifications, projects, achievements, publications, or references. For descriptions in experience, combine the bullet points into a single string separated by newlines.`,
});

const extractResumeDataFlow = ai.defineFlow(
  {
    name: 'extractResumeDataFlow',
    inputSchema: ExtractResumeDataInputSchema,
    outputSchema: ExtractResumeDataOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
