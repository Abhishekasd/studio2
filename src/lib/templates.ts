import type { Template } from './types';

export const templates: Template[] = [
  {
    id: 'classic-minimalist',
    name: 'Classic Minimalist',
    type: 'free',
    sections: ['contact', 'summary', 'skills', 'experience', 'education', 'certifications', 'projects', 'achievements', 'publications', 'portfolio', 'references'],
  },
  {
    id: 'modern-professional',
    name: 'Modern Professional',
    type: 'paid',
    price: 49,
    sections: ['contact', 'summary', 'skills', 'experience', 'education', 'certifications', 'projects'],
  },
  {
    id: 'creative-compact',
    name: 'Creative Compact',
    type: 'free',
    sections: ['contact', 'summary', 'skills', 'experience', 'education', 'projects', 'achievements', 'publications'],
  },
  {
    id: 'developers-delight',
    name: 'Developer\'s Delight',
    type: 'paid',
    price: 49,
    sections: ['contact', 'summary', 'skills', 'experience', 'education', 'certifications', 'projects', 'achievements', 'publications', 'portfolio'],
  },
  {
    id: 'elegant-simple',
    name: 'Elegant & Simple',
    type: 'free',
    sections: ['contact', 'summary', 'skills', 'experience', 'education', 'certifications', 'references'],
  },
  {
    id: 'executive-bold',
    name: 'Executive Bold',
    type: 'paid',
    price: 49,
    sections: ['contact', 'summary', 'skills', 'experience', 'education', 'achievements', 'certifications', 'projects'],
  },
  {
    id: 'clean-slate',
    name: 'Clean Slate',
    type: 'free',
    sections: ['contact', 'summary', 'skills', 'experience', 'education', 'references', 'portfolio', 'projects'],
  },
  {
    id: 'corporate-consultant',
    name: 'Corporate Consultant',
    type: 'paid',
    price: 49,
    sections: ['contact', 'summary', 'skills', 'experience', 'education', 'certifications', 'projects', 'achievements', 'publications', 'portfolio', 'references'],
  },
];
