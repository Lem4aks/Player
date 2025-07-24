import React, { useRef, useState, useEffect } from 'react';
import './App.css';
import { Footer, Form, Header } from "./components";

interface Video {
    id: number;
    src: string;
    title: string;
}

const LOCAL_STORAGE_KEY = 'VideoList';

const DEFAULT_VIDEO_DATA: Video[] = [
    { id: 1, src: 'https://www.w3schools.com/html/mov_bbb.mp4', title: 'Bunny' },
    { id: 2, src: 'https://interactive-examples.mdn.mozilla.net/media/cc0-videos/flower.mp4', title: 'Flower' },
    { id: 3, src: 'https://storage.googleapis.com/gtv-videos-bucket/sample/ForBiggerJoyrides.mp4', title: 'Joyrides' }
];

function App() {
    const [isFormVisible, setIsFormVisible] = useState(false);
    const [videoData, setVideoData] = useState<Video[]>([]);

    const appRef = useRef<HTMLDivElement>(null);
    const videoRefs = useRef<{ [key: number]: HTMLVideoElement }>({});
    const activeVideoRef = useRef<HTMLVideoElement | null>(null);

    const [selectedVideoId, setSelectedVideoId] = useState<number | null>(null);
    const [isFullscreen, setIsFullscreen] = useState(false);

    useEffect(() => {
        try {
            const storedVideos = localStorage.getItem(LOCAL_STORAGE_KEY);
            if (storedVideos) {
                setVideoData(JSON.parse(storedVideos));
            } else {
                localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(DEFAULT_VIDEO_DATA));
                setVideoData(DEFAULT_VIDEO_DATA);
            }
        } catch (error) {
            console.error("Failed:", error);
            setVideoData(DEFAULT_VIDEO_DATA);
        }
    }, []);

    const handleAddClick = () => {
        setIsFormVisible(true);
    };

    const handleCloseForm = () => {
        setIsFormVisible(false);
    };

    useEffect(() => {
        const handleKeyDown = (event: KeyboardEvent) => {
            if (event.key === 'Escape') {
                handleCloseForm();
            }
        };

        if (isFormVisible) {
            document.addEventListener('keydown', handleKeyDown);
        }

        return () => {
            document.removeEventListener('keydown', handleKeyDown);
        };
    }, [isFormVisible]);


    const toggleFullscreen = () => {
        if (!appRef.current) return;
        if (document.fullscreenElement) {
            document.exitFullscreen();
        } else {
            appRef.current.requestFullscreen();
        }
    };

    const handleVideoClick = (videoId: number) => {
        const videoElement = videoRefs.current[videoId];
        if (!videoElement) return;
        setSelectedVideoId(videoId);
        activeVideoRef.current = videoElement;
        toggleFullscreen();
    };

    useEffect(() => {
        const handleFullscreenChange = () => {
            const isCurrentlyFullscreen = !!document.fullscreenElement;
            setIsFullscreen(isCurrentlyFullscreen);

            if (isCurrentlyFullscreen) {
                activeVideoRef.current?.play();
            } else {
                activeVideoRef.current?.pause();
                setSelectedVideoId(null);
                activeVideoRef.current = null;
            }
        };

        document.addEventListener('fullscreenchange', handleFullscreenChange);
        return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
    }, []);

    return (
        <div ref={appRef} className={`App ${isFullscreen ? 'video-is-fullscreen' : ''}`}>
            {isFormVisible && (
                <>
                    <div className="form-overlay" onClick={handleCloseForm}></div>
                    <Form onClose={handleCloseForm} />
                </>
            )}

            <Header onAddClick={handleAddClick} />
            <main className="main">
                <div className="video-list">
                    {videoData.map(video => (
                        <div key={video.id} className={`video-item ${selectedVideoId === video.id ? 'is-active' : ''}`}>
                            <p>{video.title}</p>
                            <video
                                ref={el => {
                                    if (el) videoRefs.current[video.id] = el;
                                }}
                                src={video.src}
                                onClick={() => handleVideoClick(video.id)}
                                muted
                                loop
                            />
                        </div>
                    ))}
                </div>
            </main>
            <Footer
                videoRef={activeVideoRef}
                isFullscreen={isFullscreen}
                toggleFullscreen={toggleFullscreen}
            />
        </div>
    );
}

export default App;