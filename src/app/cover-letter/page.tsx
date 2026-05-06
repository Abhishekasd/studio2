"use client";

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Sparkles, Copy, CheckCircle2, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/components/ui/use-toast';

export default function CoverLetterPage() {
  const [resumeText, setResumeText] = useState('');
  const [jobDescription, setJobDescription] = useState('');
  const [coverLetter, setCoverLetter] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [isCopied, setIsCopied] = useState(false);
  const { toast } = useToast();

  const handleGenerate = async () => {
    if (!resumeText.trim() || !jobDescription.trim()) {
      toast({
        title: "Missing Information",
        description: "Please provide both your resume and the job description.",
        variant: "destructive",
      });
      return;
    }

    setIsGenerating(true);
    setCoverLetter('');
    setIsCopied(false);

    try {
      const response = await fetch('/api/cover-letter', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ resumeText, jobDescription }),
      });

      if (!response.ok) {
        throw new Error('Failed to generate cover letter');
      }

      const data = await response.json();
      setCoverLetter(data.coverLetter);
      toast({
        title: "Success!",
        description: "Your personalized cover letter has been generated.",
      });
    } catch (error) {
      console.error(error);
      toast({
        title: "Error",
        description: "An error occurred while generating your cover letter. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const handleCopy = () => {
    if (coverLetter) {
      navigator.clipboard.writeText(coverLetter);
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2000);
      toast({
        title: "Copied!",
        description: "Cover letter copied to clipboard.",
      });
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-gray-800 dark:text-gray-100 transition-colors duration-300 py-12">
      {/* Background Orbs */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
        <motion.div 
          className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] bg-blue-400/20 dark:bg-blue-900/30 rounded-full mix-blend-multiply filter blur-[100px]"
          animate={{ x: [0, 100, 0], y: [0, 50, 0] }}
          transition={{ repeat: Infinity, duration: 15, ease: "easeInOut" }}
        />
        <motion.div 
          className="absolute bottom-[-10%] right-[-10%] w-[500px] h-[500px] bg-purple-400/20 dark:bg-purple-900/30 rounded-full mix-blend-multiply filter blur-[100px]"
          animate={{ x: [0, -100, 0], y: [0, -50, 0] }}
          transition={{ repeat: Infinity, duration: 20, ease: "easeInOut", delay: 2 }}
        />
      </div>

      <div className="container mx-auto px-4 relative z-10 max-w-5xl">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <h1 className="text-4xl md:text-5xl font-extrabold font-headline mb-4 text-transparent bg-clip-text bg-gradient-to-r from-blue-700 to-purple-600 dark:from-blue-400 dark:to-purple-400">
            AI Cover Letter Generator
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
            Instantly write a highly personalized, professional cover letter tailored to your dream job.
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 gap-8">
          {/* Input Section */}
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="flex flex-col gap-6"
          >
            <Card className="bg-white/70 dark:bg-slate-900/70 backdrop-blur-md border-white/20 dark:border-white/10 shadow-xl">
              <CardHeader>
                <CardTitle className="text-xl">1. Your Experience</CardTitle>
                <CardDescription>Paste the raw text of your resume here.</CardDescription>
              </CardHeader>
              <CardContent>
                <Textarea 
                  placeholder="Paste your resume content here..." 
                  className="min-h-[200px] bg-white/50 dark:bg-slate-950/50 resize-y"
                  value={resumeText}
                  onChange={(e) => setResumeText(e.target.value)}
                />
              </CardContent>
            </Card>

            <Card className="bg-white/70 dark:bg-slate-900/70 backdrop-blur-md border-white/20 dark:border-white/10 shadow-xl">
              <CardHeader>
                <CardTitle className="text-xl">2. The Job</CardTitle>
                <CardDescription>Paste the job description you are applying for.</CardDescription>
              </CardHeader>
              <CardContent>
                <Textarea 
                  placeholder="Paste the job description here..." 
                  className="min-h-[200px] bg-white/50 dark:bg-slate-950/50 resize-y"
                  value={jobDescription}
                  onChange={(e) => setJobDescription(e.target.value)}
                />
              </CardContent>
            </Card>

            <Button 
              size="lg" 
              className="w-full text-lg h-14 shadow-lg shadow-blue-500/25 transition-all hover:-translate-y-1 rounded-xl"
              onClick={handleGenerate}
              disabled={isGenerating || !resumeText.trim() || !jobDescription.trim()}
            >
              {isGenerating ? (
                <span className="flex items-center gap-2 animate-pulse">
                  <Sparkles className="h-5 w-5 animate-spin" /> Generating Magic...
                </span>
              ) : (
                <span className="flex items-center gap-2">
                  <Sparkles className="h-5 w-5" /> Generate Cover Letter <ArrowRight className="h-5 w-5 ml-1" />
                </span>
              )}
            </Button>
          </motion.div>

          {/* Output Section */}
          <motion.div 
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="flex flex-col h-full"
          >
            <Card className="flex-1 bg-white/70 dark:bg-slate-900/70 backdrop-blur-md border-white/20 dark:border-white/10 shadow-xl flex flex-col overflow-hidden relative">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <div>
                  <CardTitle className="text-xl flex items-center gap-2">
                    <Sparkles className="h-5 w-5 text-amber-500" /> Your Cover Letter
                  </CardTitle>
                </div>
                {coverLetter && (
                  <Button variant="ghost" size="sm" onClick={handleCopy} className="h-8 hover:bg-slate-200 dark:hover:bg-slate-800">
                    {isCopied ? <CheckCircle2 className="h-4 w-4 text-green-500 mr-2" /> : <Copy className="h-4 w-4 mr-2" />}
                    {isCopied ? 'Copied' : 'Copy'}
                  </Button>
                )}
              </CardHeader>
              <CardContent className="flex-1 p-0 relative">
                {!coverLetter && !isGenerating && (
                  <div className="absolute inset-0 flex items-center justify-center text-center p-6 text-gray-400 dark:text-gray-500">
                    <p>Fill out your details on the left and hit generate to see your custom cover letter here.</p>
                  </div>
                )}
                {isGenerating && (
                  <div className="absolute inset-0 flex flex-col items-center justify-center bg-white/50 dark:bg-slate-950/50 backdrop-blur-sm z-10">
                    <Sparkles className="h-10 w-10 text-blue-500 animate-spin mb-4" />
                    <p className="font-medium animate-pulse text-lg">Crafting the perfect pitch...</p>
                  </div>
                )}
                <div className="p-6 h-full overflow-y-auto">
                  {coverLetter ? (
                    <div className="whitespace-pre-wrap font-body text-gray-700 dark:text-gray-300 leading-relaxed text-[15px]">
                      {coverLetter}
                    </div>
                  ) : (
                    <div className="h-full min-h-[400px]"></div>
                  )}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
