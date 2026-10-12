export type Redirect = {
  id: string;
  from: string;
  to: string;
  status: 301 | 302 | 307 | 308;
};
