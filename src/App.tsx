import { Header, Modal, PostItem } from "./components";
import { useState, useEffect, useCallback } from "react";
import { useAppDispatch, useAppSelector } from './hooks/redux';
import {
  fetchAllPosts,
  incrementPostViews,
  setSearchQuery,
  selectFilteredPosts,
  selectPostsPagination,
  selectSearchQuery
} from './store/post';
import "./App.scss";
import { PostData } from "./Types/Video";

function App() {
  const dispatch = useAppDispatch();

  const [isFormVisible, setIsFormVisible] = useState(false);
  const [isLoadingMore, setIsLoadingMore] = useState(false);

  const posts = useAppSelector(selectFilteredPosts) as PostData[];
  const pagination = useAppSelector(selectPostsPagination);
  const searchQuery = useAppSelector(selectSearchQuery) as string;

  useEffect(() => {
    dispatch(fetchAllPosts({ page: 1, limit: 4 }));
  }, [dispatch]);

  const handleAddClick = () => {
    setIsFormVisible(true);
  };

  const handleCloseForm = () => {
    setIsFormVisible(false);
  };

  const handlePostView = useCallback(async (postId: string) => {
    try {
      const currentPost = posts.find(p => p._id === postId);
      if (!currentPost) return;

      const newViewCount = (currentPost.counts?.views || 0) + 1;

      dispatch(incrementPostViews({
        postId,
        viewCount: newViewCount
      }));
    } catch (error) {
      console.error('Error incrementing views:', error);
    }
  }, [dispatch, posts]);

  const loadMorePosts = useCallback(async () => {
    if (!pagination.hasNextPage || isLoadingMore) {
      return;
    }

    try {
      setIsLoadingMore(true);
      await dispatch(fetchAllPosts({
        page: pagination.currentPage + 1,
        limit: 4,
        loadMore: true
      })).unwrap();

      await new Promise(resolve => setTimeout(resolve, 100));

    } catch (error) {
      console.error('Error loading more posts:', error);
    } finally {
      setIsLoadingMore(false);
    }
  }, [dispatch, pagination.hasNextPage, pagination.currentPage, isLoadingMore]);

  const handleSearchChange = (query: string) => {
    dispatch(setSearchQuery(query));
  };

  useEffect(() => {
    if (!pagination.hasNextPage || isLoadingMore) {
      return;
    }

    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting && pagination.hasNextPage && !isLoadingMore) {
          loadMorePosts();
        }
      });
    }, {
      rootMargin: '200px',
      threshold: 0.1
    });

    const sentinel = document.createElement('div');
    sentinel.id = 'scroll-sentinel';
    sentinel.style.height = '10px';
    sentinel.style.width = '100%';

    const setupSentinel = () => {
      const mainElement = document.querySelector('main');
      const postList = document.querySelector('.post-list');

      if (mainElement && postList && posts.length > 0) {
        const existingSentinel = document.getElementById('scroll-sentinel');
        if (existingSentinel) {
          existingSentinel.remove();
        }

        mainElement.appendChild(sentinel);
        observer.observe(sentinel);
        return true;
      }
      return false;
    };

    if (!setupSentinel()) {
      const timer1 = setTimeout(() => {
        if (!setupSentinel()) {
          const timer2 = setTimeout(setupSentinel, 500);
          return () => clearTimeout(timer2);
        }
      }, 100);

      return () => {
        clearTimeout(timer1);
        const sentinelElement = document.getElementById('scroll-sentinel');
        if (sentinelElement) {
          sentinelElement.remove();
        }
        observer.disconnect();
      };
    }

    return () => {
      const sentinelElement = document.getElementById('scroll-sentinel');
      if (sentinelElement) {
        sentinelElement.remove();
      }
      observer.disconnect();
    };
  }, [pagination.hasNextPage, isLoadingMore, loadMorePosts, posts.length]);

  const handlePostCreated = (newPost: PostData) => {
    setIsFormVisible(false);
  };

  return (
      <div className="App">
        <Modal
            isVisible={isFormVisible}
            onClose={handleCloseForm}
            onPostCreated={handlePostCreated}
        />
        <Header
            onAddClick={handleAddClick}
            searchTerm={searchQuery}
            onSearchChange={handleSearchChange}
        />
        <main className="main">

          {posts.length === 0 && (
              <div className="no-posts">
                <p>No posts found.</p>
              </div>
          )}

          {posts.length > 0 && (
              <div className="post-list">
                {posts.map((post) => (
                    <PostItem
                        key={post._id}
                        id={post._id}
                        type={post.type}
                        onView={handlePostView}
                        isPreview={true}
                    />
                ))}
              </div>
          )}


          {!pagination.hasNextPage && posts.length > 0 && (
              <div className="end-message">
                <p>You've reached the end!</p>
              </div>
          )}
        </main>
      </div>
  );
}

export default App;