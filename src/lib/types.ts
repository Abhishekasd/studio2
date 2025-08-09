export type Section =
  | 'contact'
  | 'summary'
  | 'skills'
  | 'experience'
  | 'education'
  | 'certifications'
  | 'projects'
  | 'achievements'
  | 'publications'
  | 'portfolio'
  | 'references';

export type Template = {
  id: string;
  name: string;
  image: string;
  type: 'free' | 'paid';
  price?: number;
  sections: Section[];
};
