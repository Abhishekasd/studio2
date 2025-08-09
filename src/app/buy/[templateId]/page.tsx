"use client";

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Image from 'next/image';
import { templates } from '@/lib/templates';
import type { Template } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { CheckCircle, Loader2, ArrowRight } from 'lucide-react';
import { Input } from '@/components/ui/input';

export default function BuyPage() {
  const router = useRouter();
  const params = useParams();
  const { toast } = useToast();
  const [template, setTemplate] = useState<Template | null>(null);
  const [loading, setLoading] = useState(false);
  const [isPurchased, setIsPurchased] = useState(false);
  const upiId = "9027442522@axl";

  useEffect(() => {
    const templateId = params.templateId as string;
    const foundTemplate = templates.find((t) => t.id === templateId);
    if (foundTemplate && foundTemplate.type === 'paid') {
      setTemplate(foundTemplate);
      const purchased = JSON.parse(localStorage.getItem('unlocked_templates') || '[]');
      if (purchased.includes(templateId)) {
        setIsPurchased(true);
      }
    } else {
      router.push('/');
    }
  }, [params.templateId, router]);

  const handlePurchaseConfirmation = () => {
    if (!template) return;
    setLoading(true);

    // Simulate a confirmation process
    setTimeout(() => {
      toast({
        title: "Purchase Confirmed!",
        description: "You've unlocked the template.",
      });

      const purchased = JSON.parse(localStorage.getItem('unlocked_templates') || '[]');
      if (!purchased.includes(template.id)) {
          purchased.push(template.id);
          localStorage.setItem('unlocked_templates', JSON.stringify(purchased));
      }
      setIsPurchased(true);
      setLoading(false);
      router.push(`/editor/${template.id}`);
    }, 1000); 
  };
  
  const copyToClipboard = () => {
    navigator.clipboard.writeText(upiId);
    toast({
      title: "Copied to clipboard!",
      description: "UPI ID has been copied.",
    });
  }

  if (!template) {
    return (
      <div className="flex justify-center items-center h-screen">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="grid md:grid-cols-2 gap-8 lg:gap-12 items-center">
        <div>
          <Card className="overflow-hidden">
            <Image
              src={template.image}
              alt={template.name}
              width={500}
              height={707}
              className="w-full h-auto"
              data-ai-hint="resume design"
            />
          </Card>
        </div>
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-3xl font-bold font-headline">{template.name}</CardTitle>
              <CardDescription>Unlock this premium template to create a standout resume.</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-5xl font-extrabold text-primary mb-6">₹{template.price}
                <span className="text-lg font-medium text-muted-foreground"> one-time payment</span>
              </div>
              {isPurchased ? (
                <>
                <div className="flex items-center text-green-600 p-3 bg-green-100 rounded-md mb-4">
                  <CheckCircle className="h-5 w-5 mr-2" />
                  <p className="font-medium">You have already purchased this template.</p>
                </div>
                <Button size="lg" className="w-full" asChild>
                  <a href={`/editor/${template.id}`}>Go to Editor</a>
                </Button>
                </>
              ) : (
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="upiId">Pay using UPI</Label>
                    <div className="flex gap-2">
                      <Input id="upiId" value={upiId} readOnly />
                      <Button onClick={copyToClipboard} variant="outline">Copy</Button>
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">Make a payment of ₹{template.price} to the UPI ID above. After payment, click the button below.</p>
                  </div>
                  <Button onClick={handlePurchaseConfirmation} disabled={loading} size="lg" className="w-full">
                    {loading ? (
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    ) : (
                      <ArrowRight className="mr-2 h-4 w-4" />
                    )}
                    I've Paid, Unlock Template
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
