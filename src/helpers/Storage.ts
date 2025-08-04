import { localStorageKeys } from '../constatns';
import { PostData } from '../Types';

export const storageHelpers = {
  getVideos: (): PostData[] | null => {
    try {
      const storedVideos = localStorage.getItem(localStorageKeys.videoList);
      return storedVideos ? JSON.parse(storedVideos) : null;
    } catch (error) {
      console.error('Failed to get:', error);
      return null;
    }
  },

  setVideos: (videos: PostData[]): boolean => {
    try {
      localStorage.setItem(localStorageKeys.videoList, JSON.stringify(videos));
      return true;
    } catch (error) {
      console.error('Failed to save', error);
      return false;
    }
  },

  clearVideos: (): boolean => {
    try {
      localStorage.removeItem(localStorageKeys.videoList);
      return true;
    } catch (error) {
      console.error('Failed to clear:', error);
      return false;
    }
  },
};
