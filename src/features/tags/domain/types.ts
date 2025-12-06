export interface Tag {
  id: string;
  name: string;
  slug: string;
  isFeatured: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface CreateTagDto {
  name: string;
  isFeatured?: boolean;
}

export interface UpdateTagDto {
  name?: string;
  isFeatured?: boolean;
}
