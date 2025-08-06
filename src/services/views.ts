import { postApi } from '../api/postApi';

const viewedPosts = new Set<string>();

export const ViewService = {
  hasBeenViewed: (postId: string): boolean => {
    return viewedPosts.has(postId);
  },

  incrementView: async (postId: string): Promise<{ success: boolean; viewCount?: number }> => {
    if (viewedPosts.has(postId)) {
      return { success: false };
    }

    try {
      const response = await postApi.recordView(postId);
      viewedPosts.add(postId);
      return { 
        success: true, 
        viewCount: response.viewCount 
      };
    } catch (error) {
      console.error('Error recording view:', error);
      return { success: false };
    }
  },

  clearViewCache: (): void => {
    viewedPosts.clear();
  },

  getSessionViewStats: (): { viewedCount: number; viewedPostIds: string[] } => {
    return {
      viewedCount: viewedPosts.size,
      viewedPostIds: Array.from(viewedPosts)
    };
  }
};