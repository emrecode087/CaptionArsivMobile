export interface CollectionPost {
  postId: string;
  userId: string;
  userName: string;
  caption: string;
  thumbnailUrl: string;
  isApproved: boolean;
  isPrivate: boolean;
  createdAt: string;
  embedHtml?: string;
  sourceUrl?: string;
  mediaType?: string;
}

export interface Collection {
  id: string;
  userId: string;
  userName: string;
  name: string;
  description: string;
  isPrivate: boolean;
  createdAt: string;
  updatedAt: string;
  postCount: number;
  posts: CollectionPost[];
}

export interface CreateCollectionRequest {
  name: string;
  description: string;
  isPrivate: boolean;
}

export interface UpdateCollectionRequest {
  name: string;
  description: string;
  isPrivate: boolean;
}

export interface AddPostToCollectionRequest {
  postId: string;
}
