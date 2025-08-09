import { templates } from '@/lib/templates';
import TemplateCard from '@/components/template-card';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { Sparkles, ArrowDown, Star, Zap, Gem, Users } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from '@/components/ui/carousel';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import Image from 'next/image';

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

const reviews = [
    {
        name: 'Priya Sharma',
        title: 'Software Engineer',
        review: 'ResumeAI helped me create a professional resume in minutes. The AI suggestions were spot-on and saved me hours of work!',
        avatar: 'https://placehold.co/100x100.png',
        rating: 5
    },
    {
        name: 'Rahul Kumar',
        title: 'Marketing Manager',
        review: 'The templates are modern and stylish. I got two interview calls within a week of using my new resume. Highly recommended!',
        avatar: 'https://placehold.co/100x100.png',
        rating: 5
    },
    {
        name: 'Anjali Singh',
        title: 'Recent Graduate',
        review: 'As a fresher, I was struggling to build my resume. ResumeAI made it so easy. The premium template was worth every penny.',
        avatar: 'https://placehold.co/100x100.png',
        rating: 4
    },
     {
        name: 'Vikram Mehta',
        title: 'UX Designer',
        review: 'A fantastic tool for creating visually appealing resumes. The live preview feature is a game-changer. So much better than a standard Word doc.',
        avatar: 'https://placehold.co/100x100.png',
        rating: 5
    }
]

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

      <section id="reviews" className="mb-16 bg-card py-12 rounded-xl shadow-md">
         <h2 className="text-3xl font-bold text-center mb-10 font-headline flex items-center justify-center gap-3">
          <Users className="w-8 h-8" />
          Loved by Job Seekers
          </h2>
          <Carousel
            opts={{
              align: "start",
              loop: true,
            }}
            className="w-full max-w-4xl mx-auto"
          >
            <CarouselContent>
              {reviews.map((review, index) => (
                <CarouselItem key={index} className="md:basis-1/2 lg:basis-1/3">
                  <div className="p-1 h-full">
                    <Card className="flex flex-col justify-between h-full p-6 text-center">
                       <div className="flex justify-center mb-2">
                          {Array(review.rating).fill(0).map((_, i) => <Star key={i} className="w-5 h-5 text-amber-400 fill-amber-400" />)}
                       </div>
                        <p className="text-muted-foreground italic mb-4 flex-grow">"{review.review}"</p>
                        <div className="flex items-center justify-center">
                            <Avatar className="h-10 w-10 mr-4">
                                <AvatarImage src={review.avatar} alt={review.name} data-ai-hint="person photo" />
                                <AvatarFallback>{review.name.charAt(0)}</AvatarFallback>
                            </Avatar>
                            <div>
                                <p className="font-semibold">{review.name}</p>
                                <p className="text-sm text-muted-foreground">{review.title}</p>
                            </div>
                        </div>
                    </Card>
                  </div>
                </CarouselItem>
              ))}
            </CarouselContent>
            <CarouselPrevious />
            <CarouselNext />
          </Carousel>
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
