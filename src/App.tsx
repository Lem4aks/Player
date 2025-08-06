import { Header, Modal, PostItem } from "./components";
import { useState, useEffect, useCallback, useMemo } from "react";
import "./App.scss";
import { postApi } from "./api/postApi";
import { ViewService } from "./services/views";
import { PostData } from "./Types/Video";

function App() {
  const [isFormVisible, setIsFormVisible] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [posts, setPosts] = useState<PostData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [page, setPage] = useState(1);

  const handleAddClick = () => {
    setIsFormVisible(true);
  };

  const handleCloseForm = () => {
    setIsFormVisible(false);
  };

  const handlePostView = useCallback(async (postId: string) => {
    const result = await ViewService.incrementView(postId);

    if (result.viewCount !== undefined) {
      setPosts((prevPosts) =>
        prevPosts.map((post) =>
          post._id === postId
            ? { ...post, viewsCount: result.viewCount! }
            : post,
        ),
      );
    }
  }, []);

  const fetchPosts = async (loadMore = false) => {
    try {
      if (loadMore) {
        setIsLoadingMore(true);
      } else {
        setLoading(true);
        setError(null);
      }
      
      const currentPage = loadMore ? page : 1;
      const limit = 2;
      const response = await postApi.getAllPosts(currentPage, limit);
      const newPosts = response.posts || response;
      
      const uniquePosts = newPosts.filter((post: PostData) => 
        !posts.some(existingPost => existingPost._id === post._id)
      );
      
      if (loadMore) {
        setPosts(prev => [...prev, ...uniquePosts]);
        setHasMore(uniquePosts.length >= limit);
        setPage(prev => prev + 1);
      } else {
        setPosts(uniquePosts);
        setPage(2);
        setHasMore(uniquePosts.length >= limit);
      }
      
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || err.message || "Failed to load posts. Please try again later.";
      setError(errorMessage);
      console.error('Error fetching posts:', err);
    } finally {
      if (loadMore) {
        setIsLoadingMore(false);
      } else {
        setLoading(false);
      }
    }
  };

  const loadMorePosts = useCallback(async () => {
    if (hasMore && !isLoadingMore && !loading) {
      await fetchPosts(true);
    }
  }, [hasMore, isLoadingMore, loading]);

  useEffect(() => {
    fetchPosts();
  }, []);

  useEffect(() => {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting && hasMore && !isLoadingMore && !loading) {
          loadMorePosts();
        }
      });
    }, {
      rootMargin: '150px',
      threshold: 0.1
    });

    const sentinel = document.createElement('div');
    sentinel.style.height = '1px';
    sentinel.style.width = '100%';
    
    setTimeout(() => {
      const mainElement = document.querySelector('main');
      if (mainElement) {
        mainElement.appendChild(sentinel);
        observer.observe(sentinel);
      }
    }, 100);

    return () => {
      if (sentinel.parentNode) {
        sentinel.parentNode.removeChild(sentinel);
      }
      observer.disconnect();
    };
  }, [hasMore, isLoadingMore, loading, loadMorePosts]);

  const filteredPosts = useMemo(() => {
    if (!searchQuery.trim()) return posts;
    
    const query = searchQuery.toLowerCase();
    return posts.filter((post) =>
      post.title.toLowerCase().includes(query) ||
      post.description?.toLowerCase().includes(query) ||
      post.content?.toLowerCase().includes(query)
    );
  }, [posts, searchQuery]);

  return (
    <div className="App">
      <Modal 
        isVisible={isFormVisible} 
        onClose={handleCloseForm}
      />
      <Header
        onAddClick={handleAddClick}
        searchTerm={searchQuery}
        onSearchChange={setSearchQuery}
      />
      <main className="main">
        {!loading && !error && (
          <div className="post-list">
            {filteredPosts.map((post) => (
              <PostItem
                key={post._id}
                id={post._id}
                type={post.type}
                onView={handlePostView}
              />
            ))}
          </div>
        )}
      </main>
    </div>
  );
}

export default App;