import React, {useEffect, useState} from 'react'
import './styles.css';
import PlayIcon from "../../icon/PlayIcon";
import PauseIcon from "../../icon/PauseIcon";

interface FooterProps {
    videoRef: React.RefObject<HTMLVideoElement | null>;
}

const Footer = ({ videoRef }: FooterProps) => {
    const [isPlaying, setIsPlaying] = useState(false);
    const [volume, setVolume] = useState(1);
    const [rate, setRate] = useState(1);
    const [isMuted, setIsMuted] = useState(false);
    const [progress, setProgress] = useState(0);
    const [duration, setDuration] = useState(0);
    const [currentTime, setCurrentTime] = useState(0);

    useEffect(() => {
        const video = videoRef.current;

        const handleTimeUpdate = () => {
            if (video) {
                setProgress((video.currentTime / video.duration) * 100);
                setCurrentTime(video.currentTime);
            }
        };

        const handleDurationChange = () => {
            if (video) {
                setDuration(video.duration);
            }
        };

        const handlePlay = () => setIsPlaying(true);
        const handlePause = () => setIsPlaying(false);

        if (video) {
            video.addEventListener('timeupdate', handleTimeUpdate);
            video.addEventListener('durationchange', handleDurationChange);
            video.addEventListener('play', handlePlay);
            video.addEventListener('pause', handlePause);
        }

        return () => {
            if (video) {
                video.removeEventListener('timeupdate', handleTimeUpdate);
                video.removeEventListener('durationchange', handleDurationChange);
                video.removeEventListener('play', handlePlay);
                video.removeEventListener('pause', handlePause);
            }
        };
    }, [videoRef]);

    const togglePlay = () => {
        if (videoRef.current) {
            if (isPlaying) {
                videoRef.current.pause();
            } else {
                videoRef.current.play();
            }
        }
    };

    const handleTimelineChange = (event: React.MouseEvent<HTMLDivElement>) => {
        if (videoRef.current) {
            const timeline = event.currentTarget;
            const rect = timeline.getBoundingClientRect();
            const clickPosition = event.clientX - rect.left;
            const newProgress = (clickPosition / rect.width);
            videoRef.current.currentTime = newProgress * videoRef.current.duration;
        }
    };

    const handleVolumeChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const newVolume = parseFloat(event.target.value);
        if (videoRef.current) {
            videoRef.current.volume = newVolume;
            setVolume(newVolume);
            setIsMuted(newVolume === 0);
        }
    };

    const handleRateChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
        const newRate = parseFloat(event.target.value);
        if (videoRef.current) {
            videoRef.current.playbackRate = newRate;
            setRate(newRate);
        }
    };

    const toggleMute = () => {
        if (videoRef.current) {
            const newMutedState = !videoRef.current.muted;
            videoRef.current.muted = newMutedState;
            setIsMuted(newMutedState);
            if(newMutedState) {
                setVolume(0);
            } else {
                setVolume(videoRef.current.volume);
            }
        }
    };

    const toggleFullscreen = () => {
        const videoContainer = videoRef.current?.parentElement;
        if (!videoContainer) return;

        if (!document.fullscreenElement) {
            videoContainer.requestFullscreen().catch(err => {
                alert(`Error attempting to enable full-screen mode: ${err.message} (${err.name})`);
            });
        } else {
            document.exitFullscreen();
        }
    };

    const formatTime = (timeInSeconds: number) => {
        if (isNaN(timeInSeconds)) return '0:00';
        const minutes = Math.floor(timeInSeconds / 60);
        const seconds = Math.floor(timeInSeconds % 60).toString().padStart(2, '0');
        return `${minutes}:${seconds}`;
    };

    const skipForward = () => {
        if (videoRef.current) {
            videoRef.current.currentTime += 10;
        }
    };

    const skipBackward = () => {
        if (videoRef.current) {
            videoRef.current.currentTime -= 10;
        }
    };

    return(
        <div className="footer">
            <div className="left">
                <p>Name</p>
            </div>
            <div className="center">
                <div className="player">
                    <button onClick={skipBackward}>10s back</button>
                    <button className="playandstop" onClick={togglePlay}>
                        {isPlaying ? <PauseIcon /> : <PlayIcon />}
                    </button>
                    <button onClick={skipForward}>10s forward</button>
                </div>
                <div className="timer">
                    <p>{formatTime(currentTime)}</p>
                    <div className="timelaps" onClick={handleTimelineChange}>
                        <div className="played" style={{ width: `${progress}%` }}>
                            <div className="current"></div>
                        </div>
                    </div>
                    <p>{formatTime(duration)}</p>
                </div>
            </div>
            <div className="right">
                <select value={rate} onChange={handleRateChange}>
                    <option value={0.5}>0.5x</option>
                    <option value={1}>1x</option>
                    <option value={1.5}>1.5x</option>
                    <option value={2}>2x</option>
                </select>
                <button onClick={toggleMute}>{isMuted ? 'Unmute' : 'Mute'}</button>
                <button onClick={toggleFullscreen}>Full Screen</button>
                <input type="range" min="0" max="1" step="0.01" value={volume} onChange={handleVolumeChange} />
            </div>
        </div>
)
}

export default Footer;