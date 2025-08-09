import { templates } from '@/lib/templates';
import TemplateCard from '@/components/template-card';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { Sparkles, ArrowDown, Gem, Zap } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';

const benefits = [
  {
    icon: <Sparkles className="h-8 w-8 text-primary" />,
    title: 'AI-Powered Content',
    description: 'Generate professional resume summaries and suggestions in seconds.',
  },
  {
    icon: <Gem className="h-8 w-8 text-primary" />,
    title: 'Premium Templates',
    description: 'Choose from a variety of free and premium, professionally designed templates.',
  },
  {
    icon: <Zap className="h-8 w-8 text-primary" />,
    title: 'Quick & Easy',
    description: 'A simple, intuitive editor that makes resume building a breeze.',
  },
];

export default function Home() {
  return (
    <div className="container mx-auto px-4 py-8">
      <header className="text-center mb-16 py-16 bg-card rounded-xl shadow-md">
        <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight text-primary font-headline">
          Craft Your Future with ResumeAI
        </h1>
        <p className="mt-4 text-lg text-muted-foreground max-w-3xl mx-auto">
          Build a professional, ATS-friendly resume in minutes. Our AI-powered platform helps you highlight your skills and experience to land your dream job.
        </p>
        <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-4">
          <Button asChild size="lg" className="rounded-full font-bold w-full sm:w-auto">
            <Link href="#templates">
              <Sparkles className="mr-2" />
              Get Started with AI
            </Link>
          </Button>
          <Button asChild size="lg" className="rounded-full font-bold w-full sm:w-auto" variant="outline">
            <Link href="#templates">
              <ArrowDown className="mr-2 animate-bounce" />
              Choose Your Template
            </Link>
          </Button>
        </div>
      </header>

      <section id="benefits" className="mb-16">
        <h2 className="text-3xl font-bold text-center mb-10 font-headline">Why Choose ResumeAI?</h2>
        <div className="grid md:grid-cols-3 gap-8 text-center">
            {benefits.map(benefit => (
                <Card key={benefit.title} className="p-6">
                    <div className="mx-auto bg-primary/10 p-4 rounded-full w-fit mb-4">
                        {benefit.icon}
                    </div>
                    <h3 className="text-xl font-bold font-headline mb-2">{benefit.title}</h3>
                    <p className="text-muted-foreground">{benefit.description}</p>
                </Card>
            ))}
        </div>
      </section>

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
