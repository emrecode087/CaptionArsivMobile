export interface Category {
  id: string;
  name: string;
  description?: string | null;
  iconUrl?: string | null;
  isDeleted?: boolean;
  createdAt?: string;
  updatedAt?: string;
  postCount?: number;
  followerCount?: number;
  isFollowing?: boolean;
}

export interface CategoryFollowStatus {
  categoryId: string;
  categoryName: string;
  isFollowing: boolean;
  followerCount: number;
}

export interface CategoryListParams {
  search?: string;
  includeDeleted?: boolean;
}

export interface CreateCategoryRequest {
  name: string;
  description?: string;
}

export interface UpdateCategoryRequest {
  name: string;
  description?: string;
}
