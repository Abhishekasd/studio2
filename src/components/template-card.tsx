import Link from 'next/link';
import type { Template } from '@/lib/types';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ArrowRight } from 'lucide-react';
import ResumePreview from './resume-preview';

interface TemplateCardProps {
  template: Template;
}

const TemplateCard = ({ template }: TemplateCardProps) => {
  const href = template.type === 'free' ? `/editor/${template.id}` : `/buy/${template.id}`;

  return (
    <Link href={href}>
      <Card className="group overflow-hidden transition-all duration-300 hover:shadow-xl hover:-translate-y-1">
        <CardContent className="p-0">
          <div className="relative bg-muted/30 aspect-[400/566] w-full overflow-hidden">
            <div className="absolute inset-0 transform scale-[0.2] origin-top-left">
              <ResumePreview template={template} />
            </div>
             {template.type === 'paid' ? (
              <Badge
                className="absolute top-3 right-3 text-base"
                variant="destructive"
              >
                ₹{template.price}
              </Badge>
            ) : (
               <Badge
                className="absolute top-3 right-3"
              >
                Free
              </Badge>
            )}
          </div>
          <div className="p-4 bg-card">
            <h3 className="font-semibold text-lg truncate font-headline">{template.name}</h3>
            <Button variant="link" className="p-0 h-auto mt-2 text-primary">
              Use Template <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
};

export default TemplateCard;
