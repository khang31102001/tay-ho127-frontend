export type Article = {
  id: string;
  title: string;
  slug: string;
  content: string;
  excerpt?: string;
  coverImage?: string;
  categoryId?: string;
  tags?: string[];
  publishedAt?: string;
};

export type Page = {
  id: string;
  title: string;
  slug: string;
  content: string;
  sections?: unknown[];
};

export type Banner = {
  id: string;
  title: string;
  image: string;
  link?: string;
};
