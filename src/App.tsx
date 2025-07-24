import React, { useRef, useState, useEffect } from 'react';
import './App.css';
import { Aside, Footer, Header } from "./components";

function App() {
    const videoRef = useRef<HTMLVideoElement>(null);
    const appRef = useRef<HTMLDivElement>(null);
    const [isFullscreen, setIsFullscreen] = useState(false);

    const toggleFullscreen = () => {
        const appElement = appRef.current;
        if (!appElement) return;

        if (!document.fullscreenElement) {
            appElement.requestFullscreen();
        } else {
            document.exitFullscreen();
        }
    };

    useEffect(() => {
        const handleFullscreenChange = () => setIsFullscreen(!!document.fullscreenElement);
        document.addEventListener('fullscreenchange', handleFullscreenChange);
        return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
    }, []);

    return (
        <div className="App" ref={appRef}>
            <Header/>
            <main className="main">
                <Aside/>
                <div className="contents">
                    <video
                        ref={videoRef}
                        src="https://www.w3schools.com/html/mov_bbb.mp4"
                    />
                </div>
            </main>
            <Footer
                videoRef={videoRef}
                isFullscreen={isFullscreen}
                toggleFullscreen={toggleFullscreen}
            />
        </div>
    );
}

export default App;