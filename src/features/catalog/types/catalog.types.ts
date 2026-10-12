export type Product = {
  id: string;
  name: string;
  slug: string;
  description?: string;
  price: number;
  image?: string;
};

export type Category = {
  id: string;
  name: string;
  slug: string;
  description?: string;
};

export type Menu = {
  id: string;
  name: string;
  description?: string;
};
