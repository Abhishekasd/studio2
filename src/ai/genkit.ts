import {genkit} from 'genkit';
import {googleAI}s from '@genkit-ai/googleai';

export const ai = genkit({
  plugins: [googleAI()],
});
