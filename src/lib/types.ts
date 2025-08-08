export type Template = {
  id: string;
  name: string;
  image: string;
  type: 'free' | 'paid';
  price?: number;
};
