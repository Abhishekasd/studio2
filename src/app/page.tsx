import { templates } from '@/lib/templates';
import TemplateCard from '@/components/template-card';
import { Card } from '@/components/ui/card';

export default function Home() {
  return (
    <div className="container mx-auto px-4 py-8">
      <header className="text-center mb-12">
        <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight text-primary font-headline">
          Create Your Professional Resume with AI
        </h1>
        <p className="mt-4 text-lg text-muted-foreground max-w-2xl mx-auto">
          Choose a template, fill in your details with AI assistance, and download your resume in minutes.
        </p>
      </header>

      <section>
        <h2 className="text-3xl font-bold text-center mb-8 font-headline">Our Templates</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
          {templates.map((template) => (
            <TemplateCard key={template.id} template={template} />
          ))}
        </div>
      </section>
    </div>
  );
}
