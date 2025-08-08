import Link from 'next/link';
import Image from 'next/image';
import type { Template } from '@/lib/types';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ArrowRight } from 'lucide-react';

interface TemplateCardProps {
  template: Template;
}

const TemplateCard = ({ template }: TemplateCardProps) => {
  const href = template.type === 'free' ? `/editor/${template.id}` : `/buy/${template.id}`;

  return (
    <Link href={href}>
      <Card className="group overflow-hidden transition-all duration-300 hover:shadow-xl hover:-translate-y-1">
        <CardContent className="p-0">
          <div className="relative">
            <Image
              src={template.image}
              alt={template.name}
              width={400}
              height={566}
              className="w-full h-auto object-cover transition-transform duration-300 group-hover:scale-105"
              data-ai-hint="resume design"
            />
            <Badge
              className="absolute top-3 right-3"
              variant={template.type === 'paid' ? 'destructive' : 'default'}
            >
              {template.type === 'paid' ? `₹${template.price}` : 'Free'}
            </Badge>
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
