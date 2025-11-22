import { create } from 'zustand';

interface PostLikesState {
  likedPostIds: Set<string>;
  addLikedPost: (postId: string) => void;
  removeLikedPost: (postId: string) => void;
  isPostLiked: (postId: string) => boolean;
  clear: () => void;
}

export const usePostLikesStore = create<PostLikesState>((set, get) => ({
  likedPostIds: new Set<string>(),
  
  addLikedPost: (postId: string) => 
    set((state) => {
      const newSet = new Set(state.likedPostIds);
      newSet.add(postId);
      return { likedPostIds: newSet };
    }),
  
  removeLikedPost: (postId: string) => 
    set((state) => {
      const newSet = new Set(state.likedPostIds);
      newSet.delete(postId);
      return { likedPostIds: newSet };
    }),
  
  isPostLiked: (postId: string) => get().likedPostIds.has(postId),
  
  clear: () => set({ likedPostIds: new Set<string>() }),
}));
