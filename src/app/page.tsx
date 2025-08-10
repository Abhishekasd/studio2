import { templates } from '@/lib/templates';
import TemplateCard from '@/components/template-card';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { Sparkles, ArrowDown, Gem, Zap, CheckCircle, BarChart, Users } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from '@/components/ui/carousel';

const testimonials = [
  {
    quote: "ResumeAI transformed my job search. I created a professional resume in 10 minutes and got 3 interviews within a week!",
    name: "Sarah L.",
    title: "Marketing Manager",
  },
  {
    quote: "As a developer, I wanted a clean, modern template. ResumeAI delivered. The AI suggestions were spot on.",
    name: "David C.",
    title: "Software Engineer",
  },
  {
    quote: "I was struggling to get noticed. The ATS-friendly templates from ResumeAI made all the difference. Highly recommended!",
    name: "Maria G.",
    title: "Project Manager",
  },
  {
    quote: "The best resume builder I've used. Simple, powerful, and the results are outstanding.",
    name: "James K.",
    title: "Graphic Designer",
  },
];


export default function Home() {
  return (
    <div className="bg-white text-gray-800">
      <section className="relative text-center py-20 md:py-32 bg-white">
        <div 
          className="absolute inset-0 bg-gradient-to-br from-blue-50 to-indigo-100 opacity-50"
          style={{ clipPath: 'polygon(0 0, 100% 0, 100% 80%, 0 100%)' }}
        ></div>
        <div className="container mx-auto px-4 relative">
            <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight text-primary animate-fade-in-down font-headline">
            Craft Your Future with ResumeAI
            </h1>
            <p className="mt-4 text-lg md:text-xl font-bold text-gray-700 max-w-2xl mx-auto animate-fade-in-up">
            Your career journey starts here – powered by AI.
            </p>
            <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-4 animate-fade-in">
            <Button asChild size="lg" className="font-bold w-full sm:w-auto transition-transform hover:scale-105">
                <Link href="#templates">
                <Sparkles className="mr-2" />
                Get Started with AI
                </Link>
            </Button>
            <Button asChild size="lg" className="font-bold w-full sm:w-auto transition-transform hover:scale-105" variant="outline">
                <Link href="#templates">
                Choose Your Template
                </Link>
            </Button>
            </div>
        </div>
      </section>

      <section className="py-12 bg-white">
        <div className="container mx-auto px-4">
            <div className="grid grid-cols-2 md:grid-cols-3 gap-8 text-center max-w-4xl mx-auto">
                <div className="flex items-center justify-center gap-2">
                    <BarChart className="w-6 h-6 text-primary" />
                    <span className="font-semibold text-gray-600">10,000+ resumes built</span>
                </div>
                <div className="flex items-center justify-center gap-2">
                    <CheckCircle className="w-6 h-6 text-primary" />
                     <span className="font-semibold text-gray-600">95% user satisfaction</span>
                </div>
                <div className="flex items-center justify-center gap-2 col-span-2 md:col-span-1">
                    <Users className="w-6 h-6 text-primary" />
                     <span className="font-semibold text-gray-600">Trusted in 20+ countries</span>
                </div>
            </div>
        </div>
      </section>

      <section id="templates" className="py-16 bg-blue-50/30">
        <div className="container mx-auto px-4">
            <h2 className="text-3xl font-bold text-center mb-10 font-headline flex items-center justify-center gap-3 text-gray-800">
            <Sparkles className="w-8 h-8 text-amber-400" />
            Select a Template to Begin
            <Sparkles className="w-8 h-8 text-amber-400" />
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-x-6 gap-y-10">
            {templates.map((template) => (
                <TemplateCard key={template.id} template={template} />
            ))}
            </div>
        </div>
      </section>

      <section id="testimonials" className="py-16 bg-white">
        <div className="container mx-auto px-4">
             <h2 className="text-3xl font-bold text-center mb-10 font-headline text-gray-800">Success Stories</h2>
             <Carousel
                opts={{
                    align: "start",
                    loop: true,
                }}
                className="w-full max-w-4xl mx-auto"
            >
                <CarouselContent>
                    {testimonials.map((testimonial, index) => (
                    <CarouselItem key={index} className="md:basis-1/2">
                        <Card className="h-full">
                            <CardContent className="flex flex-col items-center justify-center p-6 text-center">
                                <p className="text-gray-600 italic">"{testimonial.quote}"</p>
                                <p className="mt-4 font-bold text-primary">{testimonial.name}</p>
                                <p className="text-sm text-gray-500">{testimonial.title}</p>
                            </CardContent>
                        </Card>
                    </CarouselItem>
                    ))}
                </CarouselContent>
                <CarouselPrevious />
                <CarouselNext />
            </Carousel>
        </div>
      </section>
    </div>
  );
}
