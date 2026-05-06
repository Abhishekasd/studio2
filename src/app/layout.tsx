import type { Metadata } from 'next';
import './globals.css';
import { Toaster } from '@/components/ui/toaster';
import Header from '@/components/layout/header';
import Footer from '@/components/layout/footer';
import { ThemeProvider } from '@/components/theme-provider';
import { AuthProvider } from '@/components/auth/auth-provider';

const siteUrl = 'https://resumemasterai.netlify.app';

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: 'Resume Master AI — Build Your Perfect Resume with AI',
    template: '%s | Resume Master AI',
  },
  description: 'Create a professional, ATS-optimized resume in minutes using AI. Choose from 10 stunning templates, get AI-powered suggestions, and generate tailored cover letters instantly.',
  keywords: ['resume builder', 'AI resume', 'ATS resume', 'cover letter generator', 'professional resume', 'resume templates', 'free resume builder'],
  authors: [{ name: 'Resume Master AI' }],
  creator: 'Resume Master AI',
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true },
  },
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: siteUrl,
    siteName: 'Resume Master AI',
    title: 'Resume Master AI — Build Your Perfect Resume with AI',
    description: 'Create a professional, ATS-optimized resume in minutes using AI. 10 stunning templates. AI cover letter generator. Free to start.',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Resume Master AI — Build Your Perfect Resume with AI',
    description: 'Create a professional, ATS-optimized resume in minutes using AI. Free templates, AI suggestions & cover letter generator.',
    creator: '@resumemasterai',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Inter&display=swap" rel="stylesheet"></link>
        <script async src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-2365487260750859" crossOrigin="anonymous"></script>
      </head>
      <body className="font-body antialiased">
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <AuthProvider>
            <div className="flex flex-col min-h-screen">
              <Header />
              <main className="flex-grow">{children}</main>
              <Footer />
            </div>
            <Toaster />
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
