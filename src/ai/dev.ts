import { config } from 'dotenv';
config();

// The main entry point for Genkit dev server.
import '@/ai/flows/summarize-resume.ts';
import '@/ai/flows/generate-resume-suggestions.ts';
import '@/ai/flows/extract-resume-data.ts';
