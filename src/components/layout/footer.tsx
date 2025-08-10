import Link from 'next/link';
import { FileText } from 'lucide-react';

const Footer = () => {
  const currentYear = new Date().getFullYear();
  return (
    <footer className="bg-primary text-primary-foreground">
      <div className="container mx-auto px-4 py-6">
        <div className="flex flex-col md:flex-row justify-between items-center">
          <div className="flex items-center gap-2 mb-4 md:mb-0">
            <FileText className="h-6 w-6 text-white" />
            <span className="font-bold text-lg font-headline">ResumeAI</span>
          </div>
          <p className="text-sm text-primary-foreground/80">
            &copy; {currentYear} ResumeAI. All rights reserved.
          </p>
          <div className="flex space-x-4 mt-4 md:mt-0">
            <Link href="/terms" className="text-sm text-primary-foreground/80 hover:text-white">
              Terms of Service
            </Link>
            <Link href="/privacy" className="text-sm text-primary-foreground/80 hover:text-white">
              Privacy Policy
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
