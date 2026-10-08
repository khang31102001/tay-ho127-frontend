export type User = {
  id: string;
  email: string;
  fullName: string;
  roles: string[];
  permissions: string[];
  enabled: boolean;
};

export type Role = {
  id: string;
  name: string;
  description?: string;
  permissions: string[];
};

export type Permission = {
  id: string;
  code: string;
  name: string;
  description?: string;
};
