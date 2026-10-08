export type NavigationItem = {
  id: string;
  label: string;
  path: string;
  icon?: string;
  children?: NavigationItem[];
  order?: number;
};
