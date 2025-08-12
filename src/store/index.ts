import { configureStore } from '@reduxjs/toolkit';
import authReducer from './auth';
import commentsReducer from './comment';
import postsReducer from './post';

export const store = configureStore({
  reducer: {
    posts: postsReducer,
    auth: authReducer,
    comments: commentsReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
