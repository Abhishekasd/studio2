import type { Template } from './types';

export const templates: Template[] = [
  {
    id: 'classic-minimalist',
    name: 'Classic Minimalist',
    type: 'free',
    sections: ['contact', 'summary', 'skills', 'experience', 'education'],
  },
  {
    id: 'modern-professional',
    name: 'Modern Professional',
    type: 'paid',
    price: 99,
    sections: ['contact', 'summary', 'skills', 'experience', 'education', 'certifications', 'projects'],
  },
  {
    id: 'creative-compact',
    name: 'Creative Compact',
    type: 'free',
    sections: ['contact', 'summary', 'skills', 'experience', 'education'],
  },
  {
    id: 'developers-delight',
    name: 'Developer\'s Delight',
    type: 'paid',
    price: 149,
    sections: ['contact', 'summary', 'skills', 'experience', 'education', 'certifications', 'projects', 'achievements', 'publications', 'portfolio'],
  },
  {
    id: 'elegant-simple',
    name: 'Elegant Simple',
    type: 'free',
    sections: ['contact', 'summary', 'skills', 'experience', 'education'],
  },
  {
    id: 'executive-bold',
    name: 'Executive Bold',
    type: 'paid',
    price: 99,
    sections: ['contact', 'summary', 'skills', 'experience', 'education', 'certifications', 'projects'],
  },
  {
    id: 'clean-slate',
    name: 'Clean Slate',
    type: 'free',
    sections: ['contact', 'summary', 'skills', 'experience', 'education'],
  },
  {
    id: 'corporate-consultant',
    name: 'Corporate Consultant',
    type: 'paid',
    price: 149,
    sections: ['contact', 'summary', 'skills', 'experience', 'education', 'certifications', 'projects', 'achievements', 'publications', 'portfolio', 'references'],
  },
];
