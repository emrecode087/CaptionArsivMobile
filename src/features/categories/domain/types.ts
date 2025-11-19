export interface Category {
  id: string;
  name: string;
  description?: string | null;
  isDeleted?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface CategoryListParams {
  includeDeleted?: boolean;
}
