export type CommonQuery = {
  search?: string;
  page?: number;
  pageSize?: number;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
};

export type CommonResponse<T> = {
  data: T[];
  total: number;
  page: number;
  pageSize: number;
};
