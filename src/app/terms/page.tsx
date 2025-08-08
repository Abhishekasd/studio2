import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function TermsPage() {
  return (
    <div className="container mx-auto px-4 py-12">
      <header className="text-center mb-12">
        <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight text-primary font-headline">
          Terms of Service
        </h1>
        <p className="mt-4 text-lg text-muted-foreground">Last updated: {new Date().toLocaleDateString()}</p>
      </header>
      <Card>
        <CardHeader>
          <CardTitle className="font-headline">Agreement to Terms</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4 text-muted-foreground">
          <p>By using ResumeAI ("we," "us," or "our"), you agree to be bound by these Terms of Service. If you do not agree to these terms, please do not use our services.</p>
          
          <h2 className="text-xl font-semibold text-foreground pt-4">Use of Service</h2>
          <p>ResumeAI provides resume templates and AI-powered tools for personal, non-commercial use. You agree not to misuse the service or help anyone else to do so.</p>

          <h2 className="text-xl font-semibold text-foreground pt-4">User Data</h2>
          <p>We use client-side storage (localStorage/sessionStorage) to manage your resume data. We do not store your personal resume information on our servers. You are responsible for the data you input and for maintaining its confidentiality.</p>
          
          <h2 className="text-xl font-semibold text-foreground pt-4">Payments</h2>
          <p>For premium templates, we use Razorpay, a third-party payment gateway. All payments are subject to Razorpay's terms and conditions. We offer one-time purchases and do not offer refunds.</p>

          <h2 className="text-xl font-semibold text-foreground pt-4">Intellectual Property</h2>
          <p>The website and its original content, features, and functionality are owned by ResumeAI and are protected by international copyright, trademark, and other intellectual property laws.</p>
          
          <h2 className="text-xl font-semibold text-foreground pt-4">Limitation of Liability</h2>
          <p>In no event shall ResumeAI be liable for any indirect, incidental, special, consequential or punitive damages, including without limitation, loss of profits, data, use, goodwill, or other intangible losses, resulting from your access to or use of or inability to access or use the service.</p>
          
          <h2 className="text-xl font-semibold text-foreground pt-4">Changes to Terms</h2>
          <p>We reserve the right to modify these terms at any time. We will notify you of any changes by posting the new Terms of Service on this page.</p>
        </CardContent>
      </Card>
    </div>
  );
}
