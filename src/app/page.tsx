"use client";

import { templates } from '@/lib/templates';
import TemplateCard from '@/components/template-card';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { Sparkles, ArrowDown, Gem, Zap, CheckCircle, BarChart, Users } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from '@/components/ui/carousel';
import { motion } from 'framer-motion';

const testimonials = [
  {
    quote: "Resume Master AI transformed my job search. I created a professional resume in 10 minutes and got 3 interviews within a week!",
    name: "Sarah L.",
    title: "Marketing Manager",
  },
  {
    quote: "As a developer, I wanted a clean, modern template. Resume Master AI delivered. The AI suggestions were spot on.",
    name: "David C.",
    title: "Software Engineer",
  },
  {
    quote: "I was struggling to get noticed. The ATS-friendly templates from Resume Master AI made all the difference. Highly recommended!",
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
    <div className="bg-white text-gray-800 overflow-hidden">
      {/* Hero Section with Glassmorphism & Framer Motion Orbs */}
      <section className="relative text-center py-20 md:py-32 bg-slate-50/50">
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <motion.div 
            className="absolute top-10 left-1/4 w-72 h-72 bg-blue-300 rounded-full mix-blend-multiply filter blur-3xl opacity-30"
            animate={{ x: [0, 50, 0], y: [0, 30, 0] }}
            transition={{ repeat: Infinity, duration: 8, ease: "easeInOut" }}
          />
          <motion.div 
            className="absolute top-20 right-1/4 w-72 h-72 bg-purple-300 rounded-full mix-blend-multiply filter blur-3xl opacity-30"
            animate={{ x: [0, -50, 0], y: [0, 50, 0] }}
            transition={{ repeat: Infinity, duration: 10, ease: "easeInOut", delay: 1 }}
          />
        </div>

        <div className="container mx-auto px-4 relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
          >
            <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight font-headline text-transparent bg-clip-text bg-gradient-to-r from-blue-700 via-indigo-600 to-purple-600 pb-2">
              Craft Your Future with Resume Master AI
            </h1>
            <p className="mt-4 text-lg md:text-xl font-medium text-gray-600 max-w-2xl mx-auto">
              Your career journey starts here – powered by artificial intelligence and stunning design.
            </p>
          </motion.div>

          <motion.div 
            className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-4"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2, ease: "easeOut" }}
          >
            <Button asChild size="lg" className="font-bold w-full sm:w-auto shadow-lg shadow-blue-500/30 transition-all hover:-translate-y-1 hover:shadow-xl hover:shadow-blue-500/40 rounded-full px-8">
                <Link href="#templates">
                <Sparkles className="mr-2 h-5 w-5" />
                Get Started with AI
                </Link>
            </Button>
            <Button asChild size="lg" variant="outline" className="font-bold w-full sm:w-auto transition-all hover:-translate-y-1 rounded-full px-8 border-2 border-gray-200 hover:border-blue-200 hover:bg-blue-50">
                <Link href="#templates">
                Choose Your Template
                </Link>
            </Button>
          </motion.div>
        </div>
      </section>

      {/* Stats Section with Scroll Reveal */}
      <section className="py-12 bg-white relative z-10">
        <div className="container mx-auto px-4">
            <motion.div 
              className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8 text-center max-w-4xl mx-auto"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 0.6 }}
            >
                <div className="flex flex-col items-center justify-center gap-3 p-4 rounded-2xl hover:bg-slate-50 transition-colors">
                    <div className="p-3 bg-blue-100 rounded-full text-blue-600 mb-2"><BarChart className="w-6 h-6" /></div>
                    <span className="font-bold text-gray-800 text-xl">10,000+</span>
                    <span className="text-sm font-medium text-gray-500 uppercase tracking-wider">Resumes Built</span>
                </div>
                <div className="flex flex-col items-center justify-center gap-3 p-4 rounded-2xl hover:bg-slate-50 transition-colors">
                    <div className="p-3 bg-green-100 rounded-full text-green-600 mb-2"><CheckCircle className="w-6 h-6" /></div>
                     <span className="font-bold text-gray-800 text-xl">95%</span>
                     <span className="text-sm font-medium text-gray-500 uppercase tracking-wider">User Satisfaction</span>
                </div>
                <div className="flex flex-col items-center justify-center gap-3 p-4 rounded-2xl hover:bg-slate-50 transition-colors sm:col-span-2 md:col-span-1">
                    <div className="p-3 bg-purple-100 rounded-full text-purple-600 mb-2"><Users className="w-6 h-6" /></div>
                     <span className="font-bold text-gray-800 text-xl">20+</span>
                     <span className="text-sm font-medium text-gray-500 uppercase tracking-wider">Countries Trusted</span>
                </div>
            </motion.div>
        </div>
      </section>

      {/* Templates Section with Staggered Reveal */}
      <section id="templates" className="py-20 bg-slate-50/50 border-t border-gray-100">
        <div className="container mx-auto px-4">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
            >
              <h2 className="text-3xl md:text-4xl font-bold text-center mb-12 font-headline flex items-center justify-center gap-3 text-gray-800">
                <Sparkles className="w-8 h-8 text-amber-400" />
                Select a Template to Begin
                <Sparkles className="w-8 h-8 text-amber-400" />
              </h2>
            </motion.div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-x-6 gap-y-10">
            {templates.map((template, index) => (
                <motion.div
                  key={template.id}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: "-50px" }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  whileHover={{ y: -5 }}
                >
                  <TemplateCard template={template} />
                </motion.div>
            ))}
            </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section id="testimonials" className="py-24 bg-white relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-blue-50 via-white to-white pointer-events-none"></div>
        <div className="container mx-auto px-4 relative z-10">
             <motion.h2 
               className="text-3xl md:text-4xl font-bold text-center mb-12 font-headline text-gray-800"
               initial={{ opacity: 0, y: 20 }}
               whileInView={{ opacity: 1, y: 0 }}
               viewport={{ once: true }}
             >
               Success Stories
             </motion.h2>
             <motion.div
               initial={{ opacity: 0, scale: 0.95 }}
               whileInView={{ opacity: 1, scale: 1 }}
               viewport={{ once: true }}
               transition={{ duration: 0.6 }}
             >
               <Carousel
                  opts={{
                      align: "start",
                      loop: true,
                  }}
                  className="w-full max-w-4xl mx-auto"
              >
                  <CarouselContent>
                      {testimonials.map((testimonial, index) => (
                      <CarouselItem key={index} className="md:basis-1/2 lg:basis-1/2 p-4">
                          <Card className="h-full border-0 shadow-lg shadow-gray-200/50 hover:shadow-xl transition-shadow bg-white/80 backdrop-blur-sm">
                              <CardContent className="flex flex-col items-center justify-center p-8 text-center h-full">
                                  <div className="mb-6 text-blue-400 opacity-50">
                                    <svg width="40" height="40" viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg"><path d="M14.017 21L16.417 14.59C16.89 13.31 17.13 12.01 17.13 10.7C17.13 7.55 15.11 5.38 11.53 5.38C10.74 5.38 9.94 5.56 9.17 5.92L9.89 8.23C10.37 8.04 10.81 7.95 11.23 7.95C13.2 7.95 14.33 9.07 14.33 10.96C14.33 11.45 14.26 11.96 14.12 12.49L10 12.49L10 21L14.017 21ZM5.01697 21L7.41697 14.59C7.88997 13.31 8.12997 12.01 8.12997 10.7C8.12997 7.55 6.10997 5.38 2.52997 5.38C1.73997 5.38 0.939971 5.56 0.169971 5.92L0.889971 8.23C1.36997 8.04 1.80997 7.95 2.22997 7.95C4.19997 7.95 5.32997 9.07 5.32997 10.96C5.32997 11.45 5.25997 11.96 5.11997 12.49L1.00697 12.49L1.00697 21L5.01697 21Z"/></svg>
                                  </div>
                                  <p className="text-gray-700 italic text-lg leading-relaxed mb-6">"{testimonial.quote}"</p>
                                  <div className="mt-auto">
                                    <p className="font-bold text-gray-900">{testimonial.name}</p>
                                    <p className="text-sm text-blue-600 font-medium">{testimonial.title}</p>
                                  </div>
                              </CardContent>
                          </Card>
                      </CarouselItem>
                      ))}
                  </CarouselContent>
                  <CarouselPrevious className="-left-4 md:-left-12" />
                  <CarouselNext className="-right-4 md:-right-12" />
              </Carousel>
             </motion.div>
        </div>
      </section>
    </div>
  );
}
