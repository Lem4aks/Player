import { Header, Modal, VideoItem, TextItem, ImageItem } from './components';
import { useState, useEffect } from 'react';
import './App.scss';
import { PostData } from './Types';
import { postApi } from './api/postApi';

function App() {
  const [isFormVisible, setIsFormVisible] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [posts, setPosts] = useState<PostData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const handleAddClick = () => {
    setIsFormVisible(true);
  };

  const handleCloseForm = () => {
    setIsFormVisible(false);
  };

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        setLoading(true);
        const response = await postApi.getAllPosts(1, 50);
        setPosts(response.posts || response);
        setError(null);
      } catch (err) {
        setError('Failed to load posts. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchPosts();
  }, []);

  return (
    <div className='App'>
      <Modal isVisible={isFormVisible} onClose={handleCloseForm} />
      <Header
        onAddClick={handleAddClick}
        searchTerm={searchQuery}
        onSearchChange={setSearchQuery}
      />
      <main className='main'>
        {loading && <div className='loading'>Loading posts...</div>}
        {error && <div className='error'>{error}</div>}
        {!loading && !error && (
          <div className='post-list'>
            {posts
              .filter(post => 
                post.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                post.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                post.content?.toLowerCase().includes(searchQuery.toLowerCase())
              )
              .map(post => {
                switch (post.type) {
                  case 'video':
                    return (
                      <VideoItem
                        key={post._id}
                        id={post._id}
                        src={post.src || ''}
                        title={post.title}
                        description={post.description}
                        onVideoClick={() => {}}
                      />
                    );
                  case 'text':
                    return <TextItem key={post._id} id={post._id} title={post.title} content={post.content || ''} />;
                  case 'image':
                    return (
                      <ImageItem
                        key={post._id}
                        id={post._id}
                        title={post.title}
                        description={post.description || ''}
                        src={post.src || ''}
                      />
                    );
                  default:
                    return null;
                }
              })}
            {posts.filter(post => 
              post.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
              post.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
              post.content?.toLowerCase().includes(searchQuery.toLowerCase())
            ).length === 0 && searchQuery && (
              <div className='no-results'>No posts found matching "{searchQuery}"</div>
            )}
          </div>
        )}
      </main>
    </div>
  );
}

export default App;
