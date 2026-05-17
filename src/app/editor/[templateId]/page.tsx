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
import { Trash2, PlusCircle, BrainCircuit, Download, Image as ImageIcon, Loader2, Upload, Cloud, CloudUpload, Check, Phone, Mail, Globe, Linkedin } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { summarizeResume } from '@/ai/flows/summarize-resume';
import { generateResumeSuggestions } from '@/ai/flows/generate-resume-suggestions';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import type { ImportResumeOutput } from '@/ai/flows/import-resume';
import { useAuth } from '@/components/auth/auth-provider';
import { saveResume } from '@/lib/firestore';

const formSchema = z.object({
  contact: z.object({
    name: z.string().min(1, 'Name is required'),
    email: z.string().email('Invalid email address'),
    phone: z.string(),
    website: z.string().url().optional().or(z.literal('')),
    linkedin: z.string().url().optional().or(z.literal('')),
    image: z.string().optional(),
    dob: z.string().optional(),
    address: z.string().optional(),
    nationality: z.string().optional(),
    languages: z.string().optional(),
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
    description: z.string().optional().or(z.literal('')),
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

const parseMarkdownTable = (text: string) => {
  if (!text) return null;
  const lines = text.split('\n').map(l => l.trim()).filter(l => l.length > 0);
  const tableLines = lines.filter(line => line.startsWith('|'));
  if (tableLines.length < 2) return null;
  
  const headers = tableLines[0].split('|').map(h => h.trim()).filter((h, idx, arr) => idx > 0 && idx < arr.length - 1);
  
  const rows = tableLines.slice(1)
    .filter(line => !line.match(/^\|[\s-——:|]*$/))
    .map(line => line.split('|').map(c => c.trim()).filter((c, idx, arr) => idx > 0 && idx < arr.length - 1));
    
  return { headers, rows };
};

const renderBulletsOrText = (text: string) => {
  const lines = text.split('\n').map(l => l.trim()).filter(l => l.length > 0);
  
  return (
    <ul className="list-disc list-inside space-y-1 text-xs text-slate-700 mt-2">
      {lines.map((line, j) => {
        const cleanLine = line.replace(/^[•\-\*]\s*/, '');
        return <li key={j} className="leading-relaxed">{cleanLine}</li>;
      })}
    </ul>
  );
};

const renderEducationDescription = (description: string) => {
  if (!description) return null;
  
  const lines = description.split('\n');
  const tableStartIndex = lines.findIndex(line => line.trim().startsWith('|') && lines[lines.indexOf(line) + 1]?.trim().startsWith('|'));
  
  if (tableStartIndex !== -1) {
    const tableLines: string[] = [];
    const nonTableLinesBefore: string[] = [];
    const nonTableLinesAfter: string[] = [];
    
    lines.forEach(line => {
      if (line.trim().startsWith('|')) {
        tableLines.push(line);
      } else if (tableLines.length === 0) {
        nonTableLinesBefore.push(line);
      } else {
        nonTableLinesAfter.push(line);
      }
    });
    
    const parsedTable = parseMarkdownTable(tableLines.join('\n'));
    
    return (
      <div className="space-y-2 mt-2 w-full">
        {nonTableLinesBefore.filter(l => l.trim()).length > 0 && renderBulletsOrText(nonTableLinesBefore.join('\n'))}
        
        {parsedTable && (
          <div className="overflow-x-auto my-3 w-full">
            <table className="min-w-full border-collapse border border-slate-300 text-xs">
              <thead>
                <tr className="bg-[#0f2942] text-white">
                  {parsedTable.headers.map((h, i) => (
                    <th key={i} className="border border-slate-300 px-3 py-2 text-center font-bold">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {parsedTable.rows.map((row, i) => (
                  <tr key={i} className={i % 2 === 1 ? 'bg-slate-50' : 'bg-white'}>
                    {row.map((cell, j) => (
                      <td key={j} className="border border-slate-300 px-3 py-2 text-center text-slate-700 font-medium">{cell}</td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        
        {nonTableLinesAfter.filter(l => l.trim()).length > 0 && renderBulletsOrText(nonTableLinesAfter.join('\n'))}
      </div>
    );
  }
  
  return renderBulletsOrText(description);
};


export default function EditorPage() {
  const router = useRouter();
  const params = useParams();
  const { toast } = useToast();
  const [template, setTemplate] = useState<Template | null>(null);
  const [isAiLoading, setIsAiLoading] = useState(false);
  const [isDownloading, setIsDownloading] = useState<'pdf' | 'png' | null>(null);
  const [isImporting, setIsImporting] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);
  const resumePreviewRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { user } = useAuth();

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      contact: { name: '', email: '', phone: '', website: '', linkedin: '', image: '', dob: '', address: '', nationality: '', languages: '' },
      summary: '',
      skills: [{ value: '' }],
      experience: [{ title: '', company: '', dates: '', description: '' }],
      education: [{ degree: '', institution: '', dates: '', description: '' }],
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

  useEffect(() => {
    if (template?.id === 'law-scholar') {
      const currentName = form.getValues('contact.name');
      // If name is empty, pre-fill with Trapti's demo data
      if (!currentName) {
        form.reset({
          contact: {
            name: 'TRAPTI SHARMA',
            email: 'traptis623@gmail.com',
            phone: '7983993160',
            website: '',
            linkedin: '',
            image: '', // Can be uploaded by user
            dob: '06-02-2006',
            address: 'Aligarh, Uttar Pradesh',
            nationality: 'Indian',
            languages: 'English, Hindi',
          },
          summary: 'A responsible and organized law student with a strong academic record and proven ability to improve project productivity. Seeking to contribute effectively to a professional organization through dedication, discipline, and teamwork.',
          skills: [
            { value: 'Time Management' },
            { value: 'Team Collaboration' },
            { value: 'Research & Analysis' },
            { value: 'Discipline & Positive Attitude' }
          ],
          experience: [
            {
              title: 'Internship Objective',
              company: 'Law Firm / Legal Department',
              dates: 'Summer 2024',
              description: 'To obtain an internship opportunity where I can apply my legal knowledge, enhance my practical skills, and contribute to the organization while learning from experienced professionals.'
            },
            {
              title: 'Key Strengths',
              company: 'Vivekananda College of Law',
              dates: '2023 - Present',
              description: '• Strong academic foundation in law with consistent performance\n• Analytical mindset with attention to detail\n• Eager to learn and take on new challenges\n• Good communication and interpersonal skills'
            },
            {
              title: 'Declaration',
              company: 'Self',
              dates: 'Date: 17-05-2026',
              description: 'I hereby declare that the information provided above is true and correct to the best of my knowledge and belief.'
            }
          ],
          education: [
            {
              degree: 'Bachelor of Arts and Bachelor of Laws (B.A.LL.B.)',
              institution: 'Vivekananda College of Law, Aligarh',
              dates: '2023 - Present',
              description: '| Semester | Marks | Percentage | Year |\n|---|---|---|---|\n| 1st | 389 / 500 | 77.8% | 2023-24 |\n| 2nd | 380 / 500 | 76% | 2024 |\n| 3rd | 408 / 500 | 81.6% | 2024 |\n| 4th | 450 / 500 | 90% | 2025 |\n| 5th | 444 / 500 | 88.8% | 2025 |\n\n• Intermediate (Commerce): 421 / 500 - 84.2% - Saraswati Vidya Mandir Sr. Sec. School, Aligarh\n• High School: 372 / 500 - 74.4% - Saraswati Vidya Mandir Sr. Sec. School, Aligarh'
            }
          ],
          certifications: [
            { name: 'Moot Court Participant', source: 'National Moot Court Competition' }
          ],
          projects: [
            { name: '', description: '', url: '' }
          ],
          achievements: [
            { value: 'Participant, National Moot Court Competition' },
            { value: 'Winner, Debate Competition' },
            { value: 'Essay Writing, Dance, and Speech Competitions' }
          ],
          publications: [
            { title: '', url: '' }
          ],
          portfolio: '',
          references: 'Available upon request.',
        });
      }
    }
  }, [template, form]);

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
    const element = resumePreviewRef.current;
    if (!element) return;
    setIsDownloading(format);
    
    // Save original styles & scroll state to restore later
    const originalScrollTop = element.scrollTop;
    const originalScrollLeft = element.scrollLeft;
    
    const originalHeight = element.style.height;
    const originalMaxHeight = element.style.maxHeight;
    const originalOverflow = element.style.overflow;
    const originalOverflowY = element.style.overflowY;
    const originalAspectRatio = element.style.aspectRatio;

    // Temporarily scroll to the absolute top/left to avoid clipping/offset bugs in html2canvas
    element.scrollTop = 0;
    element.scrollLeft = 0;

    // Force parent element to expand to its full natural content height
    element.style.height = 'auto';
    element.style.maxHeight = 'none';
    element.style.overflow = 'visible';
    element.style.overflowY = 'visible';
    element.style.aspectRatio = 'auto';

    // Find all internally scrollable children and temporarily override their styles
    const scrollableElements = element.querySelectorAll('.overflow-y-auto, [class*="overflow-y-auto"], .overflow-auto, [class*="overflow-auto"]');
    const originalChildStyles = Array.from(scrollableElements).map((el: any) => ({
      el,
      height: el.style.height,
      maxHeight: el.style.maxHeight,
      overflow: el.style.overflow,
      overflowY: el.style.overflowY,
    }));

    scrollableElements.forEach((el: any) => {
      el.style.height = 'auto';
      el.style.maxHeight = 'none';
      el.style.overflow = 'visible';
      el.style.overflowY = 'visible';
    });

    // Wait a brief tick for the browser layout to recalculate
    await new Promise((resolve) => setTimeout(resolve, 100));

    try {
      const canvas = await html2canvas(element, {
        scale: 3, // Premium high-resolution print scaling
        useCORS: true, // Crucial to load cross-origin images without truncation
        allowTaint: true,
        scrollX: 0,
        scrollY: 0,
        windowWidth: element.scrollWidth,
        windowHeight: element.scrollHeight,
        backgroundColor: '#ffffff', // Guarantee solid background color
      });

      // Restore original parent styles & scroll state immediately
      element.style.height = originalHeight;
      element.style.maxHeight = originalMaxHeight;
      element.style.overflow = originalOverflow;
      element.style.overflowY = originalOverflowY;
      element.style.aspectRatio = originalAspectRatio;
      element.scrollTop = originalScrollTop;
      element.scrollLeft = originalScrollLeft;

      // Restore original scrollable child styles
      originalChildStyles.forEach(({ el, height, maxHeight, overflow, overflowY }) => {
        el.style.height = height;
        el.style.maxHeight = maxHeight;
        el.style.overflow = overflow;
        el.style.overflowY = overflowY;
      });

      const nameSlug = (form.getValues().contact.name || 'resume').trim().replace(/\s+/g, '_');

      if (format === 'png') {
        const imgData = canvas.toDataURL('image/png');
        const link = document.createElement('a');
        link.download = `${nameSlug}_resume.png`;
        link.href = imgData;
        link.click();
      } else {
        const imgWidth = canvas.width;
        const imgHeight = canvas.height;
        
        // Create jsPDF using exact canvas dimensions
        const pdf = new jsPDF({
          orientation: imgWidth > imgHeight ? 'l' : 'p',
          unit: 'px',
          format: [imgWidth, imgHeight]
        });
        
        pdf.addImage(canvas.toDataURL('image/png'), 'PNG', 0, 0, imgWidth, imgHeight, undefined, 'FAST');
        pdf.save(`${nameSlug}_resume.pdf`);
      }
    } catch (error) {
      console.error('Download generation error:', error);
      
      // Safety recovery in case of error
      element.style.height = originalHeight;
      element.style.maxHeight = originalMaxHeight;
      element.style.overflow = originalOverflow;
      element.style.overflowY = originalOverflowY;
      element.style.aspectRatio = originalAspectRatio;
      element.scrollTop = originalScrollTop;
      element.scrollLeft = originalScrollLeft;
      originalChildStyles.forEach(({ el, height, maxHeight, overflow, overflowY }) => {
        el.style.height = height;
        el.style.maxHeight = maxHeight;
        el.style.overflow = overflow;
        el.style.overflowY = overflowY;
      });
    } finally {
      setIsDownloading(null);
    }
  };
  
  const handleTriggerUpload = () => {
    fileInputRef.current?.click();
  };

  const handleSaveToCloud = async () => {
    if (!user) {
      toast({ title: 'Sign In Required', description: 'Please sign in to save your resume to the cloud.', variant: 'destructive' });
      return;
    }
    if (!template) return;
    setIsSaving(true);
    try {
      const formData = form.getValues();
      await saveResume(user.uid, template.id, template.name, formData);
      setSavedSuccess(true);
      toast({ title: '✅ Saved!', description: 'Your resume has been saved to the cloud.' });
      setTimeout(() => setSavedSuccess(false), 3000);
    } catch (error) {
      console.error(error);
      toast({ title: 'Save Failed', description: 'Could not save resume. Please try again.', variant: 'destructive' });
    } finally {
      setIsSaving(false);
    }
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

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        form.setValue('contact.image', reader.result as string);
      };
      reader.readAsDataURL(file);
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
              
              <div className="border-t pt-4 mt-4 space-y-4">
                <h3 className="font-semibold text-sm text-muted-foreground">Additional Details (Optional)</h3>
                
                <FormItem>
                  <FormLabel>Profile Photo</FormLabel>
                  <FormControl>
                    <div className="flex items-center gap-4">
                      <Input type="file" accept="image/*" onChange={handlePhotoUpload} className="cursor-pointer" />
                      {form.watch('contact.image') && (
                        <div className="relative w-12 h-12 border rounded overflow-hidden flex items-center justify-center bg-muted">
                          <img src={form.watch('contact.image')} alt="Preview" className="w-full h-full object-cover" />
                          <Button type="button" variant="destructive" size="icon" className="absolute -top-1 -right-1 w-5 h-5 rounded-full p-0 flex items-center justify-center text-xs" onClick={() => form.setValue('contact.image', '')}>×</Button>
                        </div>
                      )}
                    </div>
                  </FormControl>
                </FormItem>

                <FormField name="contact.dob" control={form.control} render={({ field }) => (<FormItem><FormLabel>Date of Birth</FormLabel><FormControl><Input placeholder="e.g., 06-02-2006" {...field} /></FormControl></FormItem>)} />
                <FormField name="contact.address" control={form.control} render={({ field }) => (<FormItem><FormLabel>Address</FormLabel><FormControl><Input placeholder="e.g., Aligarh, Uttar Pradesh" {...field} /></FormControl></FormItem>)} />
                <FormField name="contact.nationality" control={form.control} render={({ field }) => (<FormItem><FormLabel>Nationality</FormLabel><FormControl><Input placeholder="e.g., Indian" {...field} /></FormControl></FormItem>)} />
                <FormField name="contact.languages" control={form.control} render={({ field }) => (<FormItem><FormLabel>Languages</FormLabel><FormControl><Input placeholder="e.g., English, Hindi" {...field} /></FormControl></FormItem>)} />
              </div>
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
                            <FormField name={`education.${index}.description`} control={form.control} render={({ field }) => (<FormItem><FormLabel>Details / Markdown Table / Bullets (Optional)</FormLabel><FormControl><Textarea placeholder="Any additional details, bullet points, or semester marks table..." {...field} /></FormControl></FormItem>)} />
                            <Button type="button" variant="ghost" size="icon" className="absolute top-2 right-2" onClick={() => removeEducation(index)}><Trash2 className="text-destructive"/></Button>
                        </div>
                    ))}
                    <Button type="button" variant="outline" size="sm" onClick={() => appendEducation({ degree: '', institution: '', dates: '', description: '' })}><PlusCircle />Add Education</Button>
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
                         <div key={i} className="mb-4 text-sm grid grid-cols-[1fr,auto] gap-x-4">
                            <div className="font-bold">{edu.degree}</div>
                            <div className="font-medium text-right">{edu.dates}</div>
                            <div className="italic col-span-2">{edu.institution}</div>
                            {edu.description && <div className="col-span-2">{renderEducationDescription(edu.description)}</div>}
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
            <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <h1 className="text-2xl md:text-3xl font-bold font-headline">Editing: {template.name}</h1>
                 <div className="flex flex-wrap gap-2">
                    <input
                      type="file"
                      ref={fileInputRef}
                      onChange={handleResumeUpload}
                      className="hidden"
                      accept=".pdf,.docx,.txt,.jpg,.jpeg,.png"
                    />
                    <Button onClick={handleTriggerUpload} disabled={isImporting} variant="outline">
                      {isImporting ? <Loader2 className="animate-spin" /> : <Upload />}
                      Import Resume
                    </Button>
                    <Button onClick={handleSaveToCloud} disabled={isSaving} variant={savedSuccess ? 'default' : 'outline'} className={savedSuccess ? 'bg-green-600 hover:bg-green-700 text-white border-0' : ''}>
                      {isSaving ? <Loader2 className="animate-spin" /> : savedSuccess ? <Check className="h-4 w-4" /> : <CloudUpload className="h-4 w-4" />}
                      {savedSuccess ? 'Saved!' : 'Save to Cloud'}
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
                <CardContent className="overflow-x-auto pb-4">
                    {/* ── Harvard ATS Preview ── */}
                    {template.id === 'harvard-ats' && (
                      <div ref={resumePreviewRef} className="bg-white text-black p-8 rounded-md shadow-lg aspect-[8.5/11] min-w-[700px] overflow-y-auto font-serif mx-auto">
                        {/* Header */}
                        <div className="text-center mb-4 pb-3 border-b-2 border-black">
                          <h1 className="text-3xl font-bold tracking-tight uppercase">{formData.contact.name || 'Your Name'}</h1>
                          <div className="flex justify-center items-center flex-wrap gap-x-3 text-xs mt-1">
                            {formData.contact.email && <span>{formData.contact.email}</span>}
                            {formData.contact.phone && <><span className="text-gray-400">|</span><span>{formData.contact.phone}</span></>}
                            {formData.contact.linkedin && <><span className="text-gray-400">|</span><span>{formData.contact.linkedin}</span></>}
                            {formData.contact.website && <><span className="text-gray-400">|</span><span>{formData.contact.website}</span></>}
                          </div>
                        </div>
                        {/* Summary */}
                        {formData.summary && <div className="mb-4"><h2 className="text-sm font-bold uppercase tracking-widest border-b border-black mb-1">Summary</h2><p className="text-xs leading-relaxed">{formData.summary}</p></div>}
                        {/* Experience */}
                        {formData.experience.some(e => e.title || e.company) && (
                          <div className="mb-4"><h2 className="text-sm font-bold uppercase tracking-widest border-b border-black mb-2">Experience</h2>
                            {formData.experience.map((exp, i) => (exp.title || exp.company) && (
                              <div key={i} className="mb-3 text-xs">
                                <div className="flex justify-between font-bold"><span>{exp.title}</span><span>{exp.dates}</span></div>
                                <div className="italic mb-1">{exp.company}</div>
                                {exp.description && <ul className="list-disc list-inside space-y-0.5">{exp.description.split('\n').map((line, j) => line && <li key={j}>{line.replace(/•|-/g,'').trim()}</li>)}</ul>}
                              </div>
                            ))}
                          </div>
                        )}
                        {/* Education */}
                        {formData.education.some(e => e.degree || e.institution) && (
                          <div className="mb-4"><h2 className="text-sm font-bold uppercase tracking-widest border-b border-black mb-2">Education</h2>
                            {formData.education.map((edu, i) => (edu.degree || edu.institution) && (
                              <div key={i} className="mb-2 text-xs flex justify-between"><div><div className="font-bold">{edu.degree}</div><div className="italic">{edu.institution}</div></div><div className="font-bold">{edu.dates}</div></div>
                            ))}
                          </div>
                        )}
                        {/* Skills */}
                        {formData.skills.filter(s => s.value).length > 0 && (
                          <div className="mb-4"><h2 className="text-sm font-bold uppercase tracking-widest border-b border-black mb-1">Skills</h2><p className="text-xs">{formData.skills.map(s=>s.value).filter(v=>v).join(' • ')}</p></div>
                        )}
                        {/* Certifications */}
                        {formData.certifications.some(c => c.name) && (
                          <div className="mb-4"><h2 className="text-sm font-bold uppercase tracking-widest border-b border-black mb-1">Certifications</h2>
                            {formData.certifications.map((cert, i) => cert.name && <div key={i} className="text-xs"><span className="font-bold">{cert.name}</span>{cert.source && <span className="italic"> — {cert.source}</span>}</div>)}
                          </div>
                        )}
                        {/* Achievements */}
                        {formData.achievements.filter(a=>a.value).length > 0 && (
                          <div className="mb-4"><h2 className="text-sm font-bold uppercase tracking-widest border-b border-black mb-1">Achievements</h2>
                            <ul className="list-disc list-inside text-xs">{formData.achievements.map((a,i)=>a.value&&<li key={i}>{a.value}</li>)}</ul>
                          </div>
                        )}
                      </div>
                    )}

                    {/* ── Creative Sidebar Preview ── */}
                    {template.id === 'creative-sidebar' && (
                      <div ref={resumePreviewRef} className="bg-white text-black rounded-md shadow-lg aspect-[8.5/11] min-w-[700px] overflow-y-auto font-sans mx-auto flex">
                        {/* Left sidebar */}
                        <div className="w-[38%] bg-slate-800 text-white p-6 flex flex-col gap-5">
                          <div>
                            <h1 className="text-2xl font-extrabold leading-tight">{formData.contact.name || 'Your Name'}</h1>
                            {formData.summary && <p className="text-xs text-slate-300 mt-2 leading-relaxed line-clamp-4">{formData.summary}</p>}
                          </div>
                          {/* Contact */}
                          <div>
                            <h2 className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-2">Contact</h2>
                            {formData.contact.email && (
                              <p className="text-xs text-slate-200 mb-1.5 break-all flex items-center gap-2">
                                <Mail className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                                <span>{formData.contact.email}</span>
                              </p>
                            )}
                            {formData.contact.phone && (
                              <p className="text-xs text-slate-200 mb-1.5 flex items-center gap-2">
                                <Phone className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                                <span>{formData.contact.phone}</span>
                              </p>
                            )}
                            {formData.contact.linkedin && (
                              <p className="text-xs text-slate-200 mb-1.5 break-all flex items-center gap-2">
                                <Linkedin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                                <span>{formData.contact.linkedin}</span>
                              </p>
                            )}
                            {formData.contact.website && (
                              <p className="text-xs text-slate-200 mb-1.5 break-all flex items-center gap-2">
                                <Globe className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                                <span>{formData.contact.website}</span>
                              </p>
                            )}
                          </div>
                          {/* Skills */}
                          {formData.skills.filter(s=>s.value).length > 0 && (
                            <div>
                              <h2 className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-2">Skills</h2>
                              <div className="flex flex-wrap gap-1">
                                {formData.skills.map(s=>s.value).filter(v=>v).map((skill,i)=>(
                                  <span key={i} className="text-xs bg-slate-600 text-slate-100 px-2 py-0.5 rounded-full">{skill}</span>
                                ))}
                              </div>
                            </div>
                          )}
                          {/* Education */}
                          {formData.education.some(e=>e.degree||e.institution) && (
                            <div>
                              <h2 className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-2">Education</h2>
                              {formData.education.map((edu,i)=>(edu.degree||edu.institution)&&(
                                <div key={i} className="mb-2 text-xs"><div className="font-bold text-white">{edu.degree}</div><div className="text-slate-300">{edu.institution}</div><div className="text-slate-400">{edu.dates}</div></div>
                              ))}
                            </div>
                          )}
                          {/* Achievements */}
                          {formData.achievements.filter(a=>a.value).length > 0 && (
                            <div>
                              <h2 className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-2">Achievements</h2>
                              <ul className="text-xs text-slate-200 space-y-1">{formData.achievements.map((a,i)=>a.value&&<li key={i} className="flex gap-1"><span className="text-amber-400">▸</span>{a.value}</li>)}</ul>
                            </div>
                          )}
                        </div>
                        {/* Right main content */}
                        <div className="flex-1 p-6 flex flex-col gap-5 overflow-y-auto">
                          {/* Experience */}
                          {formData.experience.some(e=>e.title||e.company) && (
                            <div>
                              <h2 className="text-sm font-bold uppercase tracking-widest text-slate-800 border-b-2 border-amber-400 pb-1 mb-3">Experience</h2>
                              {formData.experience.map((exp,i)=>(exp.title||exp.company)&&(
                                <div key={i} className="mb-4 text-xs">
                                  <div className="flex justify-between items-start"><span className="font-bold text-slate-800 text-sm">{exp.title}</span><span className="text-slate-500 text-[10px]">{exp.dates}</span></div>
                                  <div className="text-amber-600 font-medium mb-1">{exp.company}</div>
                                  {exp.description && <ul className="list-disc list-inside space-y-0.5 text-slate-600">{exp.description.split('\n').map((line,j)=>line&&<li key={j}>{line.replace(/•|-/g,'').trim()}</li>)}</ul>}
                                </div>
                              ))}
                            </div>
                          )}
                          {/* Projects */}
                          {formData.projects.some(p=>p.name) && (
                            <div>
                              <h2 className="text-sm font-bold uppercase tracking-widest text-slate-800 border-b-2 border-amber-400 pb-1 mb-3">Projects</h2>
                              {formData.projects.map((proj,i)=>proj.name&&(
                                <div key={i} className="mb-3 text-xs">
                                  <div className="flex justify-between"><span className="font-bold text-slate-800">{proj.name}</span>{proj.url&&<a href={proj.url} className="text-amber-600 underline">Link</a>}</div>
                                  <p className="text-slate-600 mt-0.5">{proj.description}</p>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                     {/* ── Law Scholar Preview ── */}
                    {template.id === 'law-scholar' && (
                      <div ref={resumePreviewRef} className="bg-white text-[#0f2942] rounded-md shadow-lg aspect-[8.5/11] min-w-[700px] overflow-y-auto font-sans mx-auto flex border border-slate-200">
                        {/* Left Column (Sidebar) - Light blue/slate */}
                        <div className="w-[32%] bg-[#f0f4f8] p-5 flex flex-col gap-6 border-r border-slate-200">
                          {/* Image Box */}
                          <div className="w-full flex justify-center mb-1">
                            <div className="w-32 h-36 border-2 border-[#0f2942] bg-white flex items-center justify-center overflow-hidden relative">
                              {formData.contact.image ? (
                                <img src={formData.contact.image} alt="Profile" className="w-full h-full object-cover block shrink-0 max-w-full max-h-full" style={{ objectFit: 'cover' }} />
                              ) : (
                                <div className="text-slate-400 text-xs text-center px-2">Photo Placeholder</div>
                              )}
                            </div>
                          </div>

                          {/* Personal Details */}
                          {(formData.contact.dob || formData.contact.address || formData.contact.nationality) && (
                            <div>
                              <h2 className="text-xs font-bold uppercase tracking-wider text-[#0f2942] border-b border-[#0f2942] pb-1 mb-2">Personal Details</h2>
                              <div className="space-y-1.5 text-xs text-slate-700">
                                {formData.contact.dob && (
                                  <div>
                                    <span className="font-semibold block text-[10px] text-slate-500 uppercase">Date of Birth</span>
                                    <span>{formData.contact.dob}</span>
                                  </div>
                                )}
                                {formData.contact.address && (
                                  <div>
                                    <span className="font-semibold block text-[10px] text-slate-500 uppercase">Address</span>
                                    <span>{formData.contact.address}</span>
                                  </div>
                                )}
                                {formData.contact.nationality && (
                                  <div>
                                    <span className="font-semibold block text-[10px] text-slate-500 uppercase">Nationality</span>
                                    <span>{formData.contact.nationality}</span>
                                  </div>
                                )}
                              </div>
                            </div>
                          )}

                          {/* Skills */}
                          {formData.skills.filter(s => s.value).length > 0 && (
                            <div>
                              <h2 className="text-xs font-bold uppercase tracking-wider text-[#0f2942] border-b border-[#0f2942] pb-1 mb-2">Skills</h2>
                              <ul className="list-disc list-inside text-xs text-slate-700 space-y-1">
                                {formData.skills.filter(s => s.value).map((s, i) => (
                                  <li key={i} className="leading-relaxed">{s.value}</li>
                                ))}
                              </ul>
                            </div>
                          )}

                          {/* Achievements */}
                          {formData.achievements.filter(a => a.value).length > 0 && (
                            <div>
                              <h2 className="text-xs font-bold uppercase tracking-wider text-[#0f2942] border-b border-[#0f2942] pb-1 mb-2">Achievements</h2>
                              <ul className="list-disc list-inside text-xs text-slate-700 space-y-1">
                                {formData.achievements.filter(a => a.value).map((a, i) => (
                                  <li key={i} className="leading-relaxed">{a.value}</li>
                                ))}
                              </ul>
                            </div>
                          )}

                          {/* Languages */}
                          {formData.contact.languages && (
                            <div>
                              <h2 className="text-xs font-bold uppercase tracking-wider text-[#0f2942] border-b border-[#0f2942] pb-1 mb-2">Languages</h2>
                              <p className="text-xs text-slate-700 leading-relaxed">{formData.contact.languages}</p>
                            </div>
                          )}
                        </div>

                        {/* Right Main Column (White background) */}
                        <div className="flex-1 p-6 flex flex-col gap-5 overflow-y-auto">
                          {/* Centered Name and Contacts */}
                          <div className="text-center pb-3 mb-2 border-b border-[#0f2942]/20">
                            <h1 className="text-2xl font-extrabold text-[#0f2942] uppercase tracking-wide">{formData.contact.name || 'Your Name'}</h1>
                            
                            <div className="flex justify-center items-center gap-x-4 text-xs mt-2 text-slate-600">
                              {formData.contact.phone && (
                                <span className="inline-flex items-center gap-1.5 align-middle">
                                  <span className="w-4 h-4 rounded-full bg-[#0f2942] text-white inline-flex items-center justify-center shrink-0 align-middle select-none">
                                    <Phone className="w-2.5 h-2.5 text-white shrink-0" />
                                  </span>
                                  <span>{formData.contact.phone}</span>
                                </span>
                              )}
                              {formData.contact.email && (
                                <span className="inline-flex items-center gap-1.5 align-middle">
                                  <span className="w-4 h-4 rounded-full bg-[#0f2942] text-white inline-flex items-center justify-center shrink-0 align-middle select-none">
                                    <Mail className="w-2.5 h-2.5 text-white shrink-0" />
                                  </span>
                                  <span className="break-all">{formData.contact.email}</span>
                                </span>
                              )}
                            </div>
                          </div>

                          {/* Career Objective */}
                          {formData.summary && (
                            <div>
                              <h2 className="text-xs font-bold uppercase tracking-wider text-[#0f2942] flex items-center gap-2 mb-1.5">
                                <span className="w-2.5 h-2.5 rounded-full bg-[#0f2942] inline-flex shrink-0 align-middle"></span>
                                <span>Career Objective</span>
                              </h2>
                              <div className="w-full h-[1px] bg-slate-300 mb-2"></div>
                              <p className="text-xs text-slate-700 leading-relaxed pl-1">{formData.summary}</p>
                            </div>
                          )}

                          {/* Education */}
                          {formData.education.some(e => e.degree || e.institution) && (
                            <div>
                              <h2 className="text-xs font-bold uppercase tracking-wider text-[#0f2942] flex items-center gap-2 mb-1.5">
                                <span className="w-2.5 h-2.5 rounded-full bg-[#0f2942] inline-flex shrink-0 align-middle"></span>
                                <span>Education</span>
                              </h2>
                              <div className="w-full h-[1px] bg-slate-300 mb-2"></div>
                              
                              <div className="space-y-4 pl-1">
                                {formData.education.map((edu, i) => (edu.degree || edu.institution) && (
                                  <div key={i} className="text-xs">
                                    <div className="flex justify-between font-bold text-[#0f2942] text-sm">
                                      <span>{edu.institution}</span>
                                      <span className="text-slate-500 font-normal">{edu.dates}</span>
                                    </div>
                                    <div className="italic text-slate-600 mb-1">{edu.degree}</div>
                                    {edu.description && (
                                      <div className="mt-2 w-full">
                                        {renderEducationDescription(edu.description)}
                                      </div>
                                    )}
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}

                          {/* Experience / Internship Objective / Strengths */}
                          {formData.experience.some(e => e.title || e.company) && (
                            <div className="space-y-5">
                              {formData.experience.map((exp, i) => (exp.title || exp.company) && (
                                <div key={i}>
                                  <h2 className="text-xs font-bold uppercase tracking-wider text-[#0f2942] flex items-center gap-2 mb-1.5">
                                    <span className="w-2.5 h-2.5 rounded-full bg-[#0f2942] inline-flex shrink-0 align-middle"></span>
                                    <span>{exp.title}</span>
                                  </h2>
                                  <div className="w-full h-[1px] bg-slate-300 mb-2"></div>
                                  
                                  <div className="text-xs pl-1">
                                    {/* Handle Signature block specially for Declaration section */}
                                    {exp.title.toLowerCase().includes('declaration') ? (
                                      <div className="space-y-6">
                                        <p className="text-slate-700 leading-relaxed italic">{exp.description}</p>
                                        <div className="flex flex-col items-end pr-4">
                                          <span className="font-serif italic text-base text-[#0f2942] tracking-wider pr-2 select-none">
                                            {formData.contact.name}
                                          </span>
                                          <div className="w-36 h-[1px] bg-slate-400 mt-1"></div>
                                          <span className="text-[10px] text-slate-500 font-semibold mt-1 uppercase">Signature</span>
                                          <span className="text-xs text-slate-700 font-bold mt-1">({formData.contact.name})</span>
                                        </div>
                                      </div>
                                    ) : (
                                      <div className="space-y-1">
                                        {exp.company && (
                                          <div className="font-semibold text-slate-700">{exp.company} <span className="font-normal text-slate-500 text-[10px]">({exp.dates})</span></div>
                                        )}
                                        {exp.description && (
                                          <ul className="list-disc list-inside space-y-1 text-slate-700 mt-1">
                                            {exp.description.split('\n').map((line, j) => line && (
                                              <li key={j} className="leading-relaxed">{line.replace(/^[•\-\*]\s*/, '')}</li>
                                            ))}
                                          </ul>
                                        )}
                                      </div>
                                    )}
                                  </div>
                                </div>
                              ))}
                            </div>
                          )}

                          {/* Certifications */}
                          {formData.certifications.some(c => c.name) && (
                            <div>
                              <h2 className="text-xs font-bold uppercase tracking-wider text-[#0f2942] flex items-center gap-2 mb-1.5">
                                <span className="w-2.5 h-2.5 rounded-full bg-[#0f2942] inline-flex shrink-0 align-middle"></span>
                                <span>Certifications & Activities</span>
                              </h2>
                              <div className="w-full h-[1px] bg-slate-300 mb-2"></div>
                              <ul className="list-disc list-inside text-xs text-slate-700 pl-1 space-y-1">
                                {formData.certifications.map((cert, i) => cert.name && (
                                  <li key={i} className="leading-relaxed">
                                    <span className="font-bold">{cert.name}</span>
                                    {cert.source && <span className="italic"> — {cert.source}</span>}
                                  </li>
                                ))}
                              </ul>
                            </div>
                          )}
                        </div>
                      </div>
                    )}

                    {/* ── Default Preview (all other templates) ── */}
                    {template.id !== 'harvard-ats' && template.id !== 'creative-sidebar' && template.id !== 'law-scholar' && (
                      <div ref={resumePreviewRef} className="bg-white text-black p-4 md:p-8 rounded-md shadow-lg aspect-[8.5/11] min-w-[700px] overflow-y-auto font-sans mx-auto">
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
                    )}
                </CardContent>
            </Card>
        </div>
      </div>
    </div>
  );
}

