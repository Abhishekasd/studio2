"use client";

import { useEffect, useState, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { templates } from '@/lib/templates';
import type { Template, Section } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Trash2, PlusCircle, BrainCircuit, Download, Image as ImageIcon, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { summarizeResume } from '@/ai/flows/summarize-resume';
import { generateResumeSuggestions } from '@/ai/flows/generate-resume-suggestions';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';

const formSchema = z.object({
  contact: z.object({
    name: z.string().min(1, 'Name is required'),
    email: z.string().email('Invalid email address'),
    phone: z.string(),
    website: z.string().url().optional().or(z.literal('')),
    linkedin: z.string().url().optional().or(z.literal('')),
  }),
  summary: z.string(),
  skills: z.array(z.object({ value: z.string() })),
  experience: z.array(z.object({
    title: z.string(),
    company: z.string(),
    dates: z.string(),
    description: z.string(),
  })),
  education: z.array(z.object({
    degree: z.string(),
    institution: z.string(),
    dates: z.string(),
  })),
  certifications: z.array(z.object({ name: z.string(), source: z.string() })),
  projects: z.array(z.object({ name: z.string(), description: z.string(), url: z.string().url().optional().or(z.literal('')) })),
  achievements: z.array(z.object({ value: z.string() })),
  publications: z.array(z.object({ title: z.string(), url: z.string().url().optional().or(z.literal('')) })),
  portfolio: z.string().url().optional().or(z.literal('')),
  references: z.string(),
});

type FormData = z.infer<typeof formSchema>;

export default function EditorPage() {
  const router = useRouter();
  const params = useParams();
  const { toast } = useToast();
  const [template, setTemplate] = useState<Template | null>(null);
  const [isAiLoading, setIsAiLoading] = useState(false);
  const [isDownloading, setIsDownloading] = useState<'pdf' | 'png' | null>(null);
  const resumePreviewRef = useRef<HTMLDivElement>(null);

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      contact: { name: '', email: '', phone: '', website: '', linkedin: '' },
      summary: '',
      skills: [{ value: '' }],
      experience: [{ title: '', company: '', dates: '', description: '' }],
      education: [{ degree: '', institution: '', dates: '' }],
      certifications: [{ name: '', source: '' }],
      projects: [{ name: '', description: '', url: '' }],
      achievements: [{ value: '' }],
      publications: [{ title: '', url: '' }],
      portfolio: '',
      references: 'Available upon request.',
    },
  });

  const { fields: skills, append: appendSkill, remove: removeSkill } = useFieldArray({ control: form.control, name: "skills" });
  const { fields: experience, append: appendExperience, remove: removeExperience } = useFieldArray({ control: form.control, name: "experience" });
  const { fields: education, append: appendEducation, remove: removeEducation } = useFieldArray({ control: form.control, name: "education" });
  const { fields: certifications, append: appendCertification, remove: removeCertification } = useFieldArray({ control: form.control, name: "certifications" });
  const { fields: projects, append: appendProject, remove: removeProject } = useFieldArray({ control: form.control, name: "projects" });
  const { fields: achievements, append: appendAchievement, remove: removeAchievement } = useFieldArray({ control: form.control, name: "achievements" });
  const { fields: publications, append: appendPublication, remove: removePublication } = useFieldArray({ control: form.control, name: "publications" });
  
  useEffect(() => {
    const templateId = params.templateId as string;
    const foundTemplate = templates.find((t) => t.id === templateId);
    if (!foundTemplate) {
      router.push('/');
      return;
    }

    if (foundTemplate.type === 'paid') {
      const unlocked = JSON.parse(localStorage.getItem('purchased_templates_v2') || '[]');
      if (!unlocked.includes(templateId)) {
        router.push(`/buy/${templateId}`);
        return;
      }
    }
    
    setTemplate(foundTemplate);
  }, [params.templateId, router]);

  const handleGenerateSummary = async () => {
    setIsAiLoading(true);
    try {
      const values = form.getValues();
      const hasExperience = values.experience.some(e => e.title || e.company);

      if (!values.contact.name || !hasExperience) {
        toast({ 
          variant: 'destructive', 
          title: 'Missing Information', 
          description: 'Please fill in your name and at least one experience entry to generate a summary.' 
        });
        return;
      }

      const input = {
        name: values.contact.name,
        skills: values.skills.map(s => s.value).join(', '),
        education: values.education.map(e => `${e.degree} at ${e.institution}`).join('; '),
        experience: values.experience.map(e => `${e.title} at ${e.company}: ${e.description}`).join('; '),
      };

      const result = await summarizeResume(input);
      form.setValue('summary', result.summary);
      toast({ title: 'Success', description: 'AI-powered summary has been generated!' });
    } catch (error) {
      console.error(error);
      toast({ variant: 'destructive', title: 'Error', description: 'Failed to generate summary. Please check your API key and try again.' });
    } finally {
      setIsAiLoading(false);
    }
  };
  
  const handleDownload = async (format: 'pdf' | 'png') => {
    if (!resumePreviewRef.current) return;
    setIsDownloading(format);
    
    const canvas = await html2canvas(resumePreviewRef.current, { scale: 2 });

    if(format === 'png') {
      const imgData = canvas.toDataURL('image/png');
      const link = document.createElement('a');
      link.download = `${form.getValues().contact.name.replace(' ', '_')}_resume.png`;
      link.href = imgData;
      link.click();
    } else {
      const pdf = new jsPDF({
        orientation: 'p',
        unit: 'px',
        format: [canvas.width, canvas.height]
      });
      pdf.addImage(canvas.toDataURL('image/png'), 'PNG', 0, 0, canvas.width, canvas.height);
      pdf.save(`${form.getValues().contact.name.replace(' ', '_')}_resume.pdf`);
    }

    setIsDownloading(null);
  }

  const renderSection = (section: Section) => {
    switch (section) {
      case 'contact':
        return (
          <Card>
            <CardHeader><CardTitle>Contact Information</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <FormField name="contact.name" control={form.control} render={({ field }) => (<FormItem><FormLabel>Full Name</FormLabel><FormControl><Input placeholder="John Doe" {...field} /></FormControl><FormMessage /></FormItem>)} />
              <FormField name="contact.email" control={form.control} render={({ field }) => (<FormItem><FormLabel>Email</FormLabel><FormControl><Input placeholder="john.doe@email.com" {...field} /></FormControl><FormMessage /></FormItem>)} />
              <FormField name="contact.phone" control={form.control} render={({ field }) => (<FormItem><FormLabel>Phone</FormLabel><FormControl><Input placeholder="+1 234 567 890" {...field} /></FormControl><FormMessage /></FormItem>)} />
              <FormField name="contact.website" control={form.control} render={({ field }) => (<FormItem><FormLabel>Website/Portfolio</FormLabel><FormControl><Input placeholder="https://yourportfolio.com" {...field} /></FormControl><FormMessage /></FormItem>)} />
              <FormField name="contact.linkedin" control={form.control} render={({ field }) => (<FormItem><FormLabel>LinkedIn</FormLabel><FormControl><Input placeholder="https://linkedin.com/in/yourprofile" {...field} /></FormControl><FormMessage /></FormItem>)} />
            </CardContent>
          </Card>
        );
      case 'summary':
        return (
          <Card>
            <CardHeader>
                <div className="flex justify-between items-center">
                    <CardTitle>Professional Summary</CardTitle>
                    <Button type="button" size="sm" onClick={handleGenerateSummary} disabled={isAiLoading}>
                        {isAiLoading ? <Loader2 className="animate-spin" /> : <BrainCircuit />}
                        Generate with AI
                    </Button>
                </div>
            </CardHeader>
            <CardContent>
              <FormField name="summary" control={form.control} render={({ field }) => (<FormItem><FormControl><Textarea placeholder="A brief summary of your professional background..." rows={5} {...field} /></FormControl><FormMessage /></FormItem>)} />
            </CardContent>
          </Card>
        );
      case 'skills':
        return (
          <Card>
            <CardHeader><CardTitle>Skills</CardTitle></CardHeader>
            <CardContent className="space-y-2">
              {skills.map((field, index) => (
                <div key={field.id} className="flex items-center gap-2">
                  <FormField name={`skills.${index}.value`} control={form.control} render={({ field }) => (<FormItem className="flex-grow"><FormControl><Input placeholder="e.g., JavaScript" {...field} /></FormControl></FormItem>)} />
                  <Button type="button" variant="ghost" size="icon" onClick={() => removeSkill(index)}><Trash2 className="text-destructive" /></Button>
                </div>
              ))}
              <Button type="button" variant="outline" size="sm" onClick={() => appendSkill({ value: '' })}><PlusCircle />Add Skill</Button>
            </CardContent>
          </Card>
        );
      case 'experience':
        return (
            <Card>
                <CardHeader><CardTitle>Work Experience</CardTitle></CardHeader>
                <CardContent>
                    <Accordion type="multiple" className="w-full">
                        {experience.map((field, index) => (
                            <AccordionItem key={field.id} value={`item-${index}`}>
                                <AccordionTrigger>{form.watch(`experience.${index}.title`) || `Experience #${index + 1}`}</AccordionTrigger>
                                <AccordionContent className="space-y-4 px-2">
                                    <FormField name={`experience.${index}.title`} control={form.control} render={({ field }) => (<FormItem><FormLabel>Job Title</FormLabel><FormControl><Input placeholder="Software Engineer" {...field} /></FormControl></FormItem>)} />
                                    <FormField name={`experience.${index}.company`} control={form.control} render={({ field }) => (<FormItem><FormLabel>Company</FormLabel><FormControl><Input placeholder="Tech Corp" {...field} /></FormControl></FormItem>)} />
                                    <FormField name={`experience.${index}.dates`} control={form.control} render={({ field }) => (<FormItem><FormLabel>Dates</FormLabel><FormControl><Input placeholder="Jan 2022 - Present" {...field} /></FormControl></FormItem>)} />
                                    <FormField name={`experience.${index}.description`} control={form.control} render={({ field }) => (<FormItem><FormLabel>Description</FormLabel><FormControl><Textarea placeholder="Your responsibilities and achievements..." {...field} /></FormControl></FormItem>)} />
                                    <Button type="button" variant="destructive" size="sm" onClick={() => removeExperience(index)}><Trash2 />Remove Experience</Button>
                                </AccordionContent>
                            </AccordionItem>
                        ))}
                    </Accordion>
                    <Button type="button" variant="outline" size="sm" onClick={() => appendExperience({ title: '', company: '', dates: '', description: '' })} className="mt-4"><PlusCircle />Add Experience</Button>
                </CardContent>
            </Card>
        );
      case 'education':
        return (
            <Card>
                <CardHeader><CardTitle>Education</CardTitle></CardHeader>
                <CardContent>
                    {education.map((field, index) => (
                        <div key={field.id} className="space-y-4 border p-4 rounded-md mb-4 relative">
                            <FormField name={`education.${index}.degree`} control={form.control} render={({ field }) => (<FormItem><FormLabel>Degree/Certificate</FormLabel><FormControl><Input placeholder="B.S. in Computer Science" {...field} /></FormControl></FormItem>)} />
                            <FormField name={`education.${index}.institution`} control={form.control} render={({ field }) => (<FormItem><FormLabel>Institution</FormLabel><FormControl><Input placeholder="University of Technology" {...field} /></FormControl></FormItem>)} />
                            <FormField name={`education.${index}.dates`} control={form.control} render={({ field }) => (<FormItem><FormLabel>Dates</FormLabel><FormControl><Input placeholder="2018 - 2022" {...field} /></FormControl></FormItem>)} />
                            <Button type="button" variant="ghost" size="icon" className="absolute top-2 right-2" onClick={() => removeEducation(index)}><Trash2 className="text-destructive"/></Button>
                        </div>
                    ))}
                    <Button type="button" variant="outline" size="sm" onClick={() => appendEducation({ degree: '', institution: '', dates: '' })}><PlusCircle />Add Education</Button>
                </CardContent>
            </Card>
        );
      // Other cases will be added in future steps
      default:
        return null;
    }
  };

  if (!template) {
    return <div className="flex justify-center items-center h-screen"><Loader2 className="h-8 w-8 animate-spin" /></div>;
  }
  
  const formData = form.watch();

  const renderPreviewSection = (section: Section, data: FormData) => {
    if (!template?.sections.includes(section)) return null;

    switch (section) {
        case 'summary':
            return (
                <div className="mb-6">
                    <h2 className="text-xl font-bold border-b-2 border-gray-300 pb-1 mb-2">Summary</h2>
                    <p className="text-sm">{data.summary}</p>
                </div>
            );
        case 'skills':
            return (
                <div className="mb-6">
                    <h2 className="text-xl font-bold border-b-2 border-gray-300 pb-1 mb-2">Skills</h2>
                    <p className="text-sm">{data.skills.map(s => s.value).filter(v => v).join(' • ')}</p>
                </div>
            );
        case 'experience':
            return (
                <div className="mb-6">
                    <h2 className="text-xl font-bold border-b-2 border-gray-300 pb-1 mb-2">Experience</h2>
                    {data.experience.map((exp, i) => (exp.title || exp.company) && (
                        <div key={i} className="mb-4 text-sm">
                            <h3 className="font-bold">{exp.title}</h3>
                            <div className="flex justify-between">
                                <p className="italic">{exp.company}</p>
                                <p className="italic">{exp.dates}</p>
                            </div>
                            <p className="mt-1">{exp.description}</p>
                        </div>
                    ))}
                </div>
            );
        case 'education':
            return (
                <div className="mb-6">
                    <h2 className="text-xl font-bold border-b-2 border-gray-300 pb-1 mb-2">Education</h2>
                    {data.education.map((edu, i) => (edu.degree || edu.institution) && (
                         <div key={i} className="mb-2 text-sm">
                            <div className="flex justify-between">
                                <h3 className="font-bold">{edu.degree}</h3>
                                <p className="italic">{edu.dates}</p>
                            </div>
                            <p>{edu.institution}</p>
                        </div>
                    ))}
                </div>
            );
        case 'certifications':
             return (
                <div className="mb-6">
                    <h2 className="text-xl font-bold border-b-2 border-gray-300 pb-1 mb-2">Certifications</h2>
                    {data.certifications.map((cert, i) => (cert.name) && (
                         <div key={i} className="mb-2 text-sm">
                            <h3 className="font-bold">{cert.name}</h3>
                            <p>{cert.source}</p>
                        </div>
                    ))}
                </div>
            );
        case 'projects':
            return (
                <div className="mb-6">
                    <h2 className="text-xl font-bold border-b-2 border-gray-300 pb-1 mb-2">Projects</h2>
                    {data.projects.map((proj, i) => (proj.name) && (
                         <div key={i} className="mb-4 text-sm">
                            <div className="flex justify-between">
                                <h3 className="font-bold">{proj.name}</h3>
                                {proj.url && <a href={proj.url} className="italic text-blue-600 hover:underline" target="_blank" rel="noreferrer">Link</a>}
                            </div>
                            <p className="mt-1">{proj.description}</p>
                        </div>
                    ))}
                </div>
            );
        case 'achievements':
            return (
                <div className="mb-6">
                    <h2 className="text-xl font-bold border-b-2 border-gray-300 pb-1 mb-2">Achievements</h2>
                    <ul className="list-disc list-inside text-sm">
                        {data.achievements.map((ach, i) => ach.value && <li key={i}>{ach.value}</li>)}
                    </ul>
                </div>
            );
        case 'publications':
             return (
                <div className="mb-6">
                    <h2 className="text-xl font-bold border-b-2 border-gray-300 pb-1 mb-2">Publications</h2>
                    {data.publications.map((pub, i) => (pub.title) && (
                        <div key={i} className="mb-2 text-sm">
                           <div className="flex justify-between">
                               <h3 className="font-bold">{pub.title}</h3>
                               {pub.url && <a href={pub.url} className="italic text-blue-600 hover:underline" target="_blank" rel="noreferrer">Link</a>}
                           </div>
                       </div>
                    ))}
                </div>
            );
        case 'portfolio':
             return data.portfolio && (
                <div className="mb-6">
                    <h2 className="text-xl font-bold border-b-2 border-gray-300 pb-1 mb-2">Portfolio</h2>
                    <a href={data.portfolio} className="text-sm text-blue-600 hover:underline" target="_blank" rel="noreferrer">{data.portfolio}</a>
                </div>
            );
        case 'references':
            return (
                <div className="mb-6">
                    <h2 className="text-xl font-bold border-b-2 border-gray-300 pb-1 mb-2">References</h2>
                    <p className="text-sm">{data.references}</p>
                </div>
            );
        default:
            return null;
    }
  }


  return (
    <div className="container mx-auto px-4 py-8">
      <div className="grid lg:grid-cols-2 gap-8">
        <div className="space-y-6">
            <header className="flex justify-between items-center">
                <h1 className="text-3xl font-bold font-headline">Editing: {template.name}</h1>
                 <div className="flex gap-2">
                    <Button onClick={() => handleDownload('png')} disabled={!!isDownloading}>
                        {isDownloading === 'png' ? <Loader2 className="animate-spin" /> : <ImageIcon />}
                        PNG
                    </Button>
                    <Button onClick={() => handleDownload('pdf')} disabled={!!isDownloading}>
                        {isDownloading === 'pdf' ? <Loader2 className="animate-spin" /> : <Download />}
                        PDF
                    </Button>
                </div>
            </header>
            <Form {...form}>
                <form className="space-y-6">
                    {template.sections.map(section => (
                        <div key={section}>{renderSection(section)}</div>
                    ))}
                </form>
            </Form>
        </div>
        <div className="sticky top-8 h-fit">
            <Card>
                <CardHeader><CardTitle>Live Preview</CardTitle></CardHeader>
                <CardContent>
                    <div ref={resumePreviewRef} className="bg-white text-black p-8 rounded-md shadow-lg aspect-[8.5/11] overflow-y-auto">
                        {/* A simple resume template structure */}
                        <div className="text-center mb-8">
                            <h1 className="text-4xl font-bold">{formData.contact.name || 'Your Name'}</h1>
                            <p className="text-sm">
                                {formData.contact.email} {formData.contact.phone && `| ${formData.contact.phone}`}
                                {formData.contact.website && ` | ${formData.contact.website}`}
                                {formData.contact.linkedin && ` | ${formData.contact.linkedin}`}
                            </p>
                        </div>
                        
                        {template.sections.map(section => (
                            <div key={`preview-${section}`}>
                                {renderPreviewSection(section, formData)}
                            </div>
                        ))}
                    </div>
                </CardContent>
            </Card>
        </div>
      </div>
    </div>
  );
}
