"use client";

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Image from 'next/image';
import { templates } from '@/lib/templates';
import type { Template } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { CheckCircle, CreditCard, Loader2 } from 'lucide-react';

declare global {
  interface Window {
    Razorpay: any;
  }
}

export default function BuyPage() {
  const router = useRouter();
  const params = useParams();
  const { toast } = useToast();
  const [template, setTemplate] = useState<Template | null>(null);
  const [loading, setLoading] = useState(false);
  const [isPurchased, setIsPurchased] = useState(false);

  useEffect(() => {
    const templateId = params.templateId as string;
    const foundTemplate = templates.find((t) => t.id === templateId);
    if (foundTemplate && foundTemplate.type === 'paid') {
      setTemplate(foundTemplate);
      // Check if already purchased
      const purchased = JSON.parse(localStorage.getItem('unlocked_templates') || '[]');
      if (purchased.includes(templateId)) {
        setIsPurchased(true);
      }
    } else {
      router.push('/');
    }
  }, [params.templateId, router]);

  const handlePayment = async () => {
    if (!template) return;
    setLoading(true);

    const options = {
      key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID || 'rzp_test_1234567890ABCD', // Use a test key
      amount: template.price! * 100, // Amount in paise
      currency: "INR",
      name: "ResumeAI",
      description: `Purchase of ${template.name} Template`,
      image: "https://placehold.co/100x100.png",
      handler: function (response: any) {
        toast({
          title: "Payment Successful!",
          description: "You've unlocked the template.",
        });

        const purchased = JSON.parse(localStorage.getItem('unlocked_templates') || '[]');
        if (!purchased.includes(template.id)) {
            purchased.push(template.id);
            localStorage.setItem('unlocked_templates', JSON.stringify(purchased));
        }

        router.push(`/editor/${template.id}`);
      },
      prefill: {
        name: "Test User",
        email: "test.user@example.com",
        contact: "9999999999",
      },
      notes: {
        address: "ResumeAI Corporate Office",
      },
      theme: {
        color: "#29ABE2",
      },
    };

    try {
      const rzp = new window.Razorpay(options);
      rzp.open();
      rzp.on('payment.failed', function (response: any) {
        toast({
          variant: "destructive",
          title: "Payment Failed",
          description: response.error.description,
        });
        setLoading(false);
      });
    } catch (error) {
        toast({
            variant: "destructive",
            title: "Error",
            description: "Could not initialize payment gateway. Please try again.",
        });
        setLoading(false);
    }
  };

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
                <Button onClick={handlePayment} disabled={loading} size="lg" className="w-full">
                  {loading ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : (
                    <CreditCard className="mr-2 h-4 w-4" />
                  )}
                  Buy Now
                </Button>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
