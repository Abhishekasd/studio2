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
import { Trash2, PlusCircle, BrainCircuit, Download, Image as ImageIcon, Loader2, Upload } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { summarizeResume } from '@/ai/flows/summarize-resume';
import { generateResumeSuggestions } from '@/ai/flows/generate-resume-suggestions';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import type { ImportResumeOutput } from '@/ai/flows/import-resume';

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

const PreviewSection = ({ title, children, className }: { title: string; children: React.ReactNode, className?: string }) => (
    <div className={`mb-4 ${className}`}>
        <h2 className="text-xl font-bold border-b-2 border-gray-300 pb-1 mb-2 tracking-wide uppercase">{title}</h2>
        {children}
    </div>
);


export default function EditorPage() {
  const router = useRouter();
  const params = useParams();
  const { toast } = useToast();
  const [template, setTemplate] = useState<Template | null>(null);
  const [isAiLoading, setIsAiLoading] = useState(false);
  const [isDownloading, setIsDownloading] = useState<'pdf' | 'png' | null>(null);
  const [isImporting, setIsImporting] = useState(false);
  const resumePreviewRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

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
    
    const canvas = await html2canvas(resumePreviewRef.current, { scale: 3 });

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
  };
  
  const handleTriggerUpload = () => {
    fileInputRef.current?.click();
  };

  const handleResumeUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsImporting(true);
    try {
      const formData = new FormData();
      formData.append('resume', file);

      const uploadResponse = await fetch('/api/import-resume', {
        method: 'POST',
        body: formData,
      });

      if (!uploadResponse.ok) {
        const errorData = await uploadResponse.json();
        throw new Error(errorData.error || 'Failed to import resume.');
      }

      const result: ImportResumeOutput = await uploadResponse.json();
      
      const { jsonData } = result;
      
      // Reset form to default before populating
      form.reset();

      if(jsonData.name) form.setValue('contact.name', jsonData.name);
      if(jsonData.email) form.setValue('contact.email', jsonData.email);
      if(jsonData.phone) form.setValue('contact.phone', jsonData.phone);
      if(jsonData.website) form.setValue('contact.website', jsonData.website);
      if(jsonData.linkedin) form.setValue('contact.linkedin', jsonData.linkedin);
      if(jsonData.summary) form.setValue('summary', jsonData.summary);
      
      if(jsonData.skills && jsonData.skills.length > 0) {
        form.setValue('skills', jsonData.skills);
      } else {
        form.setValue('skills', [{ value: '' }]);
      }
      if(jsonData.experience && jsonData.experience.length > 0) {
        form.setValue('experience', jsonData.experience);
      } else {
        form.setValue('experience', [{ title: '', company: '', dates: '', description: '' }]);
      }
      if(jsonData.education && jsonData.education.length > 0) {
        form.setValue('education', jsonData.education);
      } else {
        form.setValue('education', [{ degree: '', institution: '', dates: '' }]);
      }
      if(jsonData.certifications && jsonData.certifications.length > 0) {
        form.setValue('certifications', jsonData.certifications);
      } else {
        form.setValue('certifications', [{ name: '', source: '' }]);
      }
      if(jsonData.projects && jsonData.projects.length > 0) {
        form.setValue('projects', jsonData.projects);
      } else {
        form.setValue('projects', [{ name: '', description: '', url: '' }]);
      }
      if(jsonData.achievements && jsonData.achievements.length > 0) {
        form.setValue('achievements', jsonData.achievements);
      } else {
        form.setValue('achievements', [{ value: '' }]);
      }
      if(jsonData.publications && jsonData.publications.length > 0) {
        form.setValue('publications', jsonData.publications);
      } else {
        form.setValue('publications', [{ title: '', url: '' }]);
      }

      toast({
        title: "Resume Imported!",
        description: "Your information has been filled in. Please review and save.",
      });

    } catch (error: any) {
      console.error(error);
      toast({
        variant: 'destructive',
        title: 'Import Failed',
        description: error.message || 'An unknown error occurred.',
      });
    } finally {
      setIsImporting(false);
      // Reset file input
      if(fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

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
      case 'certifications':
        return (
          <Card>
            <CardHeader><CardTitle>Certifications</CardTitle></CardHeader>
            <CardContent>
              {certifications.map((field, index) => (
                <div key={field.id} className="space-y-4 border p-4 rounded-md mb-4 relative">
                  <FormField name={`certifications.${index}.name`} control={form.control} render={({ field }) => (<FormItem><FormLabel>Certificate Name</FormLabel><FormControl><Input placeholder="e.g., Certified JavaScript Developer" {...field} /></FormControl></FormItem>)} />
                  <FormField name={`certifications.${index}.source`} control={form.control} render={({ field }) => (<FormItem><FormLabel>Source</FormLabel><FormControl><Input placeholder="e.g., Coursera" {...field} /></FormControl></FormItem>)} />
                  <Button type="button" variant="ghost" size="icon" className="absolute top-2 right-2" onClick={() => removeCertification(index)}><Trash2 className="text-destructive" /></Button>
                </div>
              ))}
              <Button type="button" variant="outline" size="sm" onClick={() => appendCertification({ name: '', source: '' })}><PlusCircle />Add Certification</Button>
            </CardContent>
          </Card>
        );
      case 'projects':
        return (
          <Card>
            <CardHeader><CardTitle>Projects</CardTitle></CardHeader>
            <CardContent>
              <Accordion type="multiple" className="w-full">
                {projects.map((field, index) => (
                  <AccordionItem key={field.id} value={`project-${index}`}>
                    <AccordionTrigger>{form.watch(`projects.${index}.name`) || `Project #${index + 1}`}</AccordionTrigger>
                    <AccordionContent className="space-y-4 px-2">
                      <FormField name={`projects.${index}.name`} control={form.control} render={({ field }) => (<FormItem><FormLabel>Project Name</FormLabel><FormControl><Input placeholder="My Awesome App" {...field} /></FormControl></FormItem>)} />
                      <FormField name={`projects.${index}.description`} control={form.control} render={({ field }) => (<FormItem><FormLabel>Description</FormLabel><FormControl><Textarea placeholder="A short description of your project..." {...field} /></FormControl></FormItem>)} />
                      <FormField name={`projects.${index}.url`} control={form.control} render={({ field }) => (<FormItem><FormLabel>Project URL</FormLabel><FormControl><Input placeholder="https://github.com/user/project" {...field} /></FormControl></FormItem>)} />
                      <Button type="button" variant="destructive" size="sm" onClick={() => removeProject(index)}><Trash2 />Remove Project</Button>
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
              <Button type="button" variant="outline" size="sm" onClick={() => appendProject({ name: '', description: '', url: '' })} className="mt-4"><PlusCircle />Add Project</Button>
            </CardContent>
          </Card>
        );
      case 'achievements':
        return (
          <Card>
            <CardHeader><CardTitle>Achievements</CardTitle></CardHeader>
            <CardContent className="space-y-2">
              {achievements.map((field, index) => (
                <div key={field.id} className="flex items-center gap-2">
                  <FormField name={`achievements.${index}.value`} control={form.control} render={({ field }) => (<FormItem className="flex-grow"><FormControl><Input placeholder="e.g., Dean's List 2023" {...field} /></FormControl></FormItem>)} />
                  <Button type="button" variant="ghost" size="icon" onClick={() => removeAchievement(index)}><Trash2 className="text-destructive" /></Button>
                </div>
              ))}
              <Button type="button" variant="outline" size="sm" onClick={() => appendAchievement({ value: '' })}><PlusCircle />Add Achievement</Button>
            </CardContent>
          </Card>
        );
      case 'publications':
        return (
          <Card>
            <CardHeader><CardTitle>Publications</CardTitle></CardHeader>
            <CardContent>
              {publications.map((field, index) => (
                <div key={field.id} className="space-y-4 border p-4 rounded-md mb-4 relative">
                  <FormField name={`publications.${index}.title`} control={form.control} render={({ field }) => (<FormItem><FormLabel>Title</FormLabel><FormControl><Input placeholder="e.g., The Future of AI" {...field} /></FormControl></FormItem>)} />
                  <FormField name={`publications.${index}.url`} control={form.control} render={({ field }) => (<FormItem><FormLabel>URL</FormLabel><FormControl><Input placeholder="https://example.com/publication" {...field} /></FormControl></FormItem>)} />
                  <Button type="button" variant="ghost" size="icon" className="absolute top-2 right-2" onClick={() => removePublication(index)}><Trash2 className="text-destructive" /></Button>
                </div>
              ))}
              <Button type="button" variant="outline" size="sm" onClick={() => appendPublication({ title: '', url: '' })}><PlusCircle />Add Publication</Button>
            </CardContent>
          </Card>
        );
      case 'portfolio':
        return (
          <Card>
            <CardHeader><CardTitle>Portfolio</CardTitle></CardHeader>
            <CardContent>
              <FormField name="portfolio" control={form.control} render={({ field }) => (<FormItem><FormLabel>Portfolio URL</FormLabel><FormControl><Input placeholder="https://your-portfolio.com" {...field} /></FormControl><FormMessage /></FormItem>)} />
            </CardContent>
          </Card>
        );
      case 'references':
        return (
          <Card>
            <CardHeader><CardTitle>References</CardTitle></CardHeader>
            <CardContent>
              <FormField name="references" control={form.control} render={({ field }) => (<FormItem><FormControl><Textarea placeholder="e.g., Available upon request." {...field} /></FormControl><FormMessage /></FormItem>)} />
            </CardContent>
          </Card>
        );
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
            return data.summary && (
                <PreviewSection title="Summary">
                    <p className="text-sm">{data.summary}</p>
                </PreviewSection>
            );
        case 'skills':
            const skills = data.skills.map(s => s.value).filter(v => v);
            return skills.length > 0 && (
                <PreviewSection title="Skills">
                    <p className="text-sm">{skills.join(' • ')}</p>
                </PreviewSection>
            );
        case 'experience':
            return data.experience.some(e => e.title || e.company) && (
                <PreviewSection title="Experience">
                    {data.experience.map((exp, i) => (exp.title || exp.company) && (
                        <div key={i} className="mb-4 text-sm grid grid-cols-[1fr,auto] gap-x-4">
                            <div className="font-bold">{exp.title}</div>
                            <div className="font-medium text-right">{exp.dates}</div>
                            <div className="italic col-span-2">{exp.company}</div>
                            {exp.description && <ul className="mt-1 list-disc list-inside col-span-2">
                                {exp.description.split('\n').map((line, j) => line && <li key={j}>{line.replace(/•|-/g, '').trim()}</li>)}
                            </ul>}
                        </div>
                    ))}
                </PreviewSection>
            );
        case 'education':
            return data.education.some(e => e.degree || e.institution) && (
                <PreviewSection title="Education">
                    {data.education.map((edu, i) => (edu.degree || edu.institution) && (
                         <div key={i} className="mb-2 text-sm grid grid-cols-[1fr,auto] gap-x-4">
                            <div className="font-bold">{edu.degree}</div>
                            <div className="font-medium text-right">{edu.dates}</div>
                            <div className="italic col-span-2">{edu.institution}</div>
                        </div>
                    ))}
                </PreviewSection>
            );
        case 'certifications':
             return data.certifications.some(c => c.name) && (
                <PreviewSection title="Certifications">
                    {data.certifications.map((cert, i) => (cert.name) && (
                         <div key={i} className="mb-2 text-sm">
                            <span className="font-bold">{cert.name}</span>
                            {cert.source && <span className="italic"> - {cert.source}</span>}
                        </div>
                    ))}
                </PreviewSection>
            );
        case 'projects':
            return data.projects.some(p => p.name) && (
                <PreviewSection title="Projects">
                    {data.projects.map((proj, i) => (proj.name) && (
                         <div key={i} className="mb-4 text-sm">
                            <div className="flex justify-between">
                                <h3 className="font-bold">{proj.name}</h3>
                                {proj.url && <a href={proj.url} className="italic text-blue-600 hover:underline" target="_blank" rel="noreferrer">Link</a>}
                            </div>
                            <p className="mt-1">{proj.description}</p>
                        </div>
                    ))}
                </PreviewSection>
            );
        case 'achievements':
            const achievements = data.achievements.map(a => a.value).filter(v => v);
            return achievements.length > 0 && (
                <PreviewSection title="Achievements">
                    <ul className="list-disc list-inside text-sm">
                        {achievements.map((ach, i) => <li key={i}>{ach}</li>)}
                    </ul>
                </PreviewSection>
            );
        case 'publications':
             return data.publications.some(p => p.title) && (
                <PreviewSection title="Publications">
                    {data.publications.map((pub, i) => (pub.title) && (
                        <div key={i} className="mb-2 text-sm flex justify-between">
                           <span className="font-bold">{pub.title}</span>
                           {pub.url && <a href={pub.url} className="italic text-blue-600 hover:underline" target="_blank" rel="noreferrer">Link</a>}
                       </div>
                    ))}
                </PreviewSection>
            );
        case 'portfolio':
             return data.portfolio && (
                <PreviewSection title="Portfolio">
                    <a href={data.portfolio} className="text-sm text-blue-600 hover:underline" target="_blank" rel="noreferrer">{data.portfolio}</a>
                </PreviewSection>
            );
        case 'references':
            return data.references && (
                <PreviewSection title="References">
                    <p className="text-sm">{data.references}</p>
                </PreviewSection>
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
                    <input
                      type="file"
                      ref={fileInputRef}
                      onChange={handleResumeUpload}
                      className="hidden"
                      accept=".pdf,.docx,.txt"
                    />
                    <Button onClick={handleTriggerUpload} disabled={isImporting} variant="outline">
                      {isImporting ? <Loader2 className="animate-spin" /> : <Upload />}
                      Import Resume
                    </Button>
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
                    <div ref={resumePreviewRef} className="bg-white text-black p-8 rounded-md shadow-lg aspect-[8.5/11] overflow-y-auto font-sans">
                        <div className="text-center mb-6">
                            <h1 className="text-4xl font-extrabold tracking-tight">{formData.contact.name || 'Your Name'}</h1>
                            <div className="flex justify-center items-center flex-wrap gap-x-4 text-sm mt-2">
                                {formData.contact.email && <span>{formData.contact.email}</span>}
                                {formData.contact.phone && <span>{formData.contact.phone}</span>}
                                {formData.contact.website && <a href={formData.contact.website} className="text-blue-600 hover:underline">{formData.contact.website}</a>}
                                {formData.contact.linkedin && <a href={formData.contact.linkedin} className="text-blue-600 hover:underline">{formData.contact.linkedin}</a>}
                            </div>
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
