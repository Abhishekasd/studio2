import { templates } from '@/lib/templates';
import TemplateCard from '@/components/template-card';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { Sparkles } from 'lucide-react';

export default function Home() {
  return (
    <div className="container mx-auto px-4 py-8">
      <header className="text-center mb-12 py-12">
        <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight text-primary font-headline">
          Craft Your Future with ResumAI
        </h1>
        <p className="mt-4 text-lg text-muted-foreground max-w-2xl mx-auto">
          Build a professional, ATS-friendly resume in minutes. Our AI-powered platform helps you highlight your skills and experience to land your dream job.
        </p>
        <div className="mt-8">
          <Button asChild size="lg">
            <Link href="#templates">
              <Sparkles className="mr-2" />
              Get Started with AI
            </Link>
          </Button>
        </div>
      </header>

      <section id="templates">
        <h2 className="text-3xl font-bold text-center mb-8 font-headline">Choose Your Template</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
          {templates.map((template) => (
            <TemplateCard key={template.id} template={template} />
          ))}
        </div>
      </section>
    </div>
  );
}
