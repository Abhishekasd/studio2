import { templates } from '@/lib/templates';
import TemplateCard from '@/components/template-card';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { Sparkles, ArrowDown } from 'lucide-react';

export default function Home() {
  return (
    <div className="container mx-auto px-4 py-8">
      <header className="text-center mb-12 py-16 bg-card rounded-xl shadow-md">
        <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight text-primary font-headline">
          Craft Your Future with ResumeAI
        </h1>
        <p className="mt-4 text-lg text-muted-foreground max-w-3xl mx-auto">
          Build a professional, ATS-friendly resume in minutes. Our AI-powered platform helps you highlight your skills and experience to land your dream job.
        </p>
        <div className="mt-8">
          <Button asChild size="lg" className="rounded-full font-bold">
            <Link href="#templates">
              <ArrowDown className="mr-2 animate-bounce" />
              Choose Your Template
            </Link>
          </Button>
        </div>
      </header>

      <section id="templates">
        <h2 className="text-3xl font-bold text-center mb-10 font-headline flex items-center justify-center gap-3">
          <Sparkles className="w-8 h-8 text-amber-400" />
          Select a Template to Begin
          <Sparkles className="w-8 h-8 text-amber-400" />
          </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-x-6 gap-y-10">
          {templates.map((template) => (
            <TemplateCard key={template.id} template={template} />
          ))}
        </div>
      </section>
    </div>
  );
}
