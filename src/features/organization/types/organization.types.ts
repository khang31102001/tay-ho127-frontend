export type Organization = {
  id: string;
  name: string;
  code?: string;
  parentId?: string;
};

export type BrandProfile = {
  id: string;
  name: string;
  logo?: string;
  website?: string;
  description?: string;
};
