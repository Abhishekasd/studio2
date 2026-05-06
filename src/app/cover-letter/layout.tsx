import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'AI Cover Letter Generator',
  description: 'Generate a professional, personalized cover letter tailored to any job description in seconds using AI. Free to use. No sign-up required.',
  openGraph: {
    title: 'AI Cover Letter Generator | Resume Master AI',
    description: 'Paste your resume and a job description. Our AI writes you a perfect, tailored cover letter in seconds.',
    type: 'website',
  },
};

export default function CoverLetterLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
