import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function PrivacyPage() {
  return (
    <div className="container mx-auto px-4 py-12">
      <header className="text-center mb-12">
        <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight text-primary font-headline">
          Privacy Policy
        </h1>
        <p className="mt-4 text-lg text-muted-foreground">Last updated: {new Date().toLocaleDateString()}</p>
      </header>
      <Card>
        <CardHeader>
          <CardTitle className="font-headline">Our Commitment to Your Privacy</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4 text-muted-foreground">
          <p>ResumeAI ("we," "us," or "our") is committed to protecting your privacy. This Privacy Policy explains how we handle your information when you use our website and services.</p>
          
          <h2 className="text-xl font-semibold text-foreground pt-4">Information We Do Not Collect</h2>
          <p>A core principle of our service is privacy by design. We do not require you to create an account, and we do not store your personal resume data—such as your name, contact details, work history, or skills—on our servers. All resume data you enter is processed and stored locally in your browser's sessionStorage or localStorage.</p>

          <h2 className="text-xl font-semibold text-foreground pt-4">Information We Collect</h2>
          <p>When you use our AI features, the non-personally identifiable parts of your resume content (like skills, job descriptions) may be sent to our AI service provider to generate summaries or suggestions. We do not log or store this information after the request is completed.</p>
          <p>For premium template purchases, we use Razorpay. We do not handle or store your payment card information. This is handled securely by Razorpay.</p>
          
          <h2 className="text-xl font-semibold text-foreground pt-4">Client-Side Storage</h2>
          <p>Your resume data is saved in your browser's storage. This means your data remains on your device. If you clear your browser's cache or use a different browser/device, this data will be lost. You are in full control of your data.</p>
          
          <h2 className="text-xl font-semibold text-foreground pt-4">Third-Party Services</h2>
          <p>We use third-party services like Google Fonts and Razorpay. These services have their own privacy policies, and we encourage you to review them.</p>
          
          <h2 className="text-xl font-semibold text-foreground pt-4">Changes to This Policy</h2>
          <p>We may update our Privacy Policy from time to time. We will notify you of any changes by posting the new Privacy Policy on this page.</p>
        </CardContent>
      </Card>
    </div>
  );
}
