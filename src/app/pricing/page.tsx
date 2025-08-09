import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Check, Sparkles } from "lucide-react";
import Link from "next/link";

const freeFeatures = [
  "Access to all free templates",
  "AI-assisted content suggestions",
  "Dynamic resume preview",
  "PDF and Image downloads",
  "Basic section customization",
];

const premiumFeatures = [
  "All features from the Free plan",
  "Access to exclusive premium templates",
  "Advanced sections (e.g. Achievements, Portfolio)",
  "One-time payment per template",
  "Priority email support",
];

export default function PricingPage() {
  return (
    <div className="container mx-auto px-4 py-12">
      <header className="text-center mb-12">
        <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight text-primary font-headline">
          Simple, Transparent Pricing
        </h1>
        <p className="mt-4 text-lg text-muted-foreground max-w-2xl mx-auto">
          Choose a plan that works for you. Get started for free or unlock premium designs with a one-time purchase.
        </p>
      </header>
      <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto items-stretch">
        <Card className="flex flex-col rounded-lg">
          <CardHeader className="text-center">
            <CardTitle className="text-3xl font-headline">Free</CardTitle>
            <CardDescription>Perfect for getting started</CardDescription>
            <div className="text-5xl font-bold pt-4">₹0</div>
          </CardHeader>
          <CardContent className="flex-grow">
            <ul className="space-y-4">
              {freeFeatures.map(feature => (
                <li key={feature} className="flex items-center">
                  <Check className="h-5 w-5 text-green-500 mr-3 flex-shrink-0" />
                  <span className="text-muted-foreground">{feature}</span>
                </li>
              ))}
            </ul>
          </CardContent>
          <CardFooter>
            <Button asChild size="lg" className="w-full" variant="outline">
              <Link href="/">Get Started</Link>
            </Button>
          </CardFooter>
        </Card>
        <Card className="border-2 border-primary flex flex-col rounded-lg shadow-lg">
          <CardHeader className="text-center">
            <CardTitle className="text-3xl font-headline flex items-center justify-center gap-2">
              <Sparkles className="w-7 h-7 text-amber-400 fill-amber-400" />
              Premium
              <Sparkles className="w-7 h-7 text-amber-400 fill-amber-400" />
              </CardTitle>
            <CardDescription>Unlock exclusive designs & features</CardDescription>
             <div className="text-5xl font-bold pt-4">
               ₹49 <span className="text-lg font-normal text-muted-foreground">/ template</span>
            </div>
          </CardHeader>
          <CardContent className="flex-grow">
             <ul className="space-y-4">
              {premiumFeatures.map(feature => (
                <li key={feature} className="flex items-center">
                  <Check className="h-5 w-5 text-green-500 mr-3 flex-shrink-0" />
                  <span className="text-muted-foreground">{feature}</span>
                </li>
              ))}
            </ul>
          </CardContent>
          <CardFooter>
            <Button asChild size="lg" className="w-full">
              <Link href="/">Browse Premium Templates</Link>
            </Button>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}
