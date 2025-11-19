export type MediaType = 'video' | 'photo' | 'gif' | 'tweet' | string;

export interface Post {
  id: string;
  userId: string;
  userName: string;
  sourceUrl: string;
  embedHtml?: string | null;
  caption: string;
  thumbnailUrl?: string | null;
  mediaType: MediaType;
  isApproved: boolean;
  isPrivate: boolean;
  categoryId?: string | null;
  categoryName?: string | null;
  createdAt: string;
  updatedAt?: string | null;
  tags: string[];
  likeCount: number;
  commentCount: number;
}

export interface PostsListParams {
  userId?: string;
  tag?: string;
  search?: string;
  categoryId?: string;
  onlyApproved?: boolean;
  includePrivate?: boolean;
  includeDeleted?: boolean;
}
