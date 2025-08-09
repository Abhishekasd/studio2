import type { Template } from './types';

export const templates: Template[] = [
  {
    id: 'classic-minimalist',
    name: 'Classic Minimalist',
    image: 'https://placehold.co/400x566.png?text=Classic+Minimalist',
    type: 'free',
    sections: ['contact', 'summary', 'skills', 'experience', 'education'],
  },
  {
    id: 'modern-professional',
    name: 'Modern Professional',
    image: 'https://placehold.co/400x566.png?text=Modern+Professional',
    type: 'paid',
    price: 99,
    sections: ['contact', 'summary', 'skills', 'experience', 'education', 'certifications', 'projects'],
  },
  {
    id: 'creative-compact',
    name: 'Creative Compact',
    image: 'https://placehold.co/400x566.png?text=Creative+Compact',
    type: 'free',
    sections: ['contact', 'summary', 'skills', 'experience', 'education'],
  },
  {
    id: 'developers-delight',
    name: 'Developer\'s Delight',
    image: 'https://placehold.co/400x566.png?text=Developer\\\'s+Delight',
    type: 'paid',
    price: 199,
    sections: ['contact', 'summary', 'skills', 'experience', 'education', 'certifications', 'projects', 'achievements', 'publications', 'portfolio'],
  },
  {
    id: 'elegant-simple',
    name: 'Elegant Simple',
    image: 'https://placehold.co/400x566.png?text=Elegant+Simple',
    type: 'free',
    sections: ['contact', 'summary', 'skills', 'experience', 'education'],
  },
  {
    id: 'executive-bold',
    name: 'Executive Bold',
    image: 'https://placehold.co/400x566.png?text=Executive+Bold',
    type: 'paid',
    price: 99,
    sections: ['contact', 'summary', 'skills', 'experience', 'education', 'certifications', 'projects'],
  },
  {
    id: 'clean-slate',
    name: 'Clean Slate',
    image: 'https://placehold.co/400x566.png?text=Clean+Slate',
    type: 'free',
    sections: ['contact', 'summary', 'skills', 'experience', 'education'],
  },
  {
    id: 'corporate-consultant',
    name: 'Corporate Consultant',
    image: 'https://placehold.co/400x566.png?text=Corporate+Consultant',
    type: 'paid',
    price: 199,
    sections: ['contact', 'summary', 'skills', 'experience', 'education', 'certifications', 'projects', 'achievements', 'publications', 'portfolio', 'references'],
  },
];
