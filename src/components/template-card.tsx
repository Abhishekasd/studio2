"use client";

import { useRouter } from 'next/navigation';
import type { Template } from '@/lib/types';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Sparkles } from 'lucide-react';
import ResumePreview from './resume-preview';

interface TemplateCardProps {
  template: Template;
}

const TemplateCard = ({ template }: TemplateCardProps) => {
  const router = useRouter();
  const href = template.type === 'free' ? `/editor/${template.id}` : `/buy/${template.id}`;

  const handleClick = () => {
    router.push(href);
  };

  return (
    <div onClick={handleClick} className="block group cursor-pointer">
      <Card className="overflow-hidden transition-all duration-300 hover:shadow-2xl hover:-translate-y-2 rounded-lg">
        <CardContent className="p-0">
          <div className="relative bg-muted w-full overflow-hidden aspect-[400/566]">
            <div className="absolute inset-0 transform scale-[0.5] origin-top-left -translate-x-1/2 left-1/2">
              <ResumePreview template={template} />
            </div>
             {template.type === 'paid' ? (
              <Badge
                className="absolute top-3 right-3 text-sm font-bold bg-amber-400 text-black shadow"
              >
                <Sparkles className="w-4 h-4 mr-1.5 fill-black" />
                ₹{template.price}
              </Badge>
            ) : (
               <Badge
                className="absolute top-3 right-3 text-sm font-semibold"
              >
                Free
              </Badge>
            )}
            <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
          </div>
          <div className="p-4 bg-card border-t">
            <h3 className="font-semibold text-lg truncate font-headline">{template.name}</h3>
            <p className="text-sm text-muted-foreground mt-1">Click to use this template</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default TemplateCard;
