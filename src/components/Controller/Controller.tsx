import React, { useEffect, useState, useRef, useCallback, FC, RefObject } from 'react';
import classes from './styles.module.scss';
import {
  BackwardIcon,
  ExitFullscreenIcon,
  ForwardIcon,
  FullscreenIcon,
  MuteIcon,
  PauseIcon,
  PlayIcon,
  UnmuteIcon,
} from '../../assets/svg';

interface Props {
  videoRef: RefObject<HTMLVideoElement | null>;
  isFullscreen: boolean;
  toggleFullscreen: () => void;
  isInline?: boolean;
}

const Controller: FC<Props> = ({ videoRef, isFullscreen, toggleFullscreen, isInline = false }) => {
  const timelineRef = useRef<HTMLDivElement>(null);
  const volumeBarRef = useRef<HTMLDivElement>(null);

  const [isPlaying, setIsPlaying] = useState(false);
  const [volume, setVolume] = useState(1);
  const [lastVolume, setLastVolume] = useState(1);
  const [rate, setRate] = useState(1);
  const [isMuted, setIsMuted] = useState(false);
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);

  const [isSeeking, setIsSeeking] = useState(false);
  const [isAdjustingVolume, setIsAdjustingVolume] = useState(false);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const syncState = () => {
      setIsPlaying(!video.paused);
      setRate(video.playbackRate);
      setVolume(video.volume);
      setIsMuted(video.muted);
      setDuration(video.duration);
      setCurrentTime(video.currentTime);
      setProgress((video.currentTime / video.duration) * 100 || 0);
      if (video.volume > 0) {
        setLastVolume(video.volume);
      }
    };

    syncState();

    const onTimeUpdate = () => {
      if (video && !isSeeking) {
        setProgress((video.currentTime / video.duration) * 100 || 0);
        setCurrentTime(video.currentTime);
      }
    };
    const onDurationChange = () => video && setDuration(video.duration);
    const onVolumeChange = () => {
      if (video) {
        setVolume(video.volume);
        setIsMuted(video.muted || video.volume === 0);
        if (!video.muted && video.volume > 0) {
          setLastVolume(video.volume);
        }
      }
    };
    const onPlay = () => setIsPlaying(true);
    const onPause = () => setIsPlaying(false);

    video.addEventListener('timeupdate', onTimeUpdate);
    video.addEventListener('durationchange', onDurationChange);
    video.addEventListener('volumechange', onVolumeChange);
    video.addEventListener('play', onPlay);
    video.addEventListener('pause', onPause);

    return () => {
      video.removeEventListener('timeupdate', onTimeUpdate);
      video.removeEventListener('durationchange', onDurationChange);
      video.removeEventListener('volumechange', onVolumeChange);
      video.removeEventListener('play', onPlay);
      video.removeEventListener('pause', onPause);
    };
  }, [videoRef, isFullscreen, isSeeking]);

  const handleTimelineUpdate = useCallback(
    (event: MouseEvent) => {
      if (!videoRef.current || !timelineRef.current || !videoRef.current.duration) return;
      const timeline = timelineRef.current;
      const rect = timeline.getBoundingClientRect();
      const position = event.clientX - rect.left;
      let newProgress = position / rect.width;

      if (newProgress < 0) newProgress = 0;
      if (newProgress > 1) newProgress = 1;

      const newTime = newProgress * videoRef.current.duration;
      videoRef.current.currentTime = newTime;
      setProgress(newProgress * 100);
      setCurrentTime(newTime);
    },
    [videoRef]
  );

  const handleVolumeUpdate = useCallback(
    (event: MouseEvent) => {
      if (!videoRef.current || !volumeBarRef.current) return;
      const volumeBar = volumeBarRef.current;
      const rect = volumeBar.getBoundingClientRect();
      const position = event.clientX - rect.left;
      let newVolume = position / rect.width;

      if (newVolume < 0) newVolume = 0;
      if (newVolume > 1) newVolume = 1;

      if (newVolume > 0) {
        setLastVolume(newVolume);
      }

      videoRef.current.volume = newVolume;
      videoRef.current.muted = newVolume === 0;
    },
    [videoRef]
  );

  useEffect(() => {
    const handleMouseMove = (event: MouseEvent) => {
      if (isSeeking) {
        handleTimelineUpdate(event);
      } else if (isAdjustingVolume) {
        handleVolumeUpdate(event);
      }
    };

    const handleMouseUp = () => {
      setIsSeeking(false);
      setIsAdjustingVolume(false);
    };

    if (isSeeking || isAdjustingVolume) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
    }

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isSeeking, isAdjustingVolume, handleTimelineUpdate, handleVolumeUpdate]);

  const handleTimelineMouseDown = (event: React.MouseEvent<HTMLDivElement>) => {
    event.stopPropagation();
    setIsSeeking(true);
    handleTimelineUpdate(event.nativeEvent);
  };

  const handleVolumeMouseDown = (event: React.MouseEvent<HTMLDivElement>) => {
    event.stopPropagation();
    setIsAdjustingVolume(true);
    handleVolumeUpdate(event.nativeEvent);
  };

  const togglePlay = useCallback(() => {
    if (videoRef.current) {
      isPlaying ? videoRef.current.pause() : videoRef.current.play();
    }
  }, [videoRef, isPlaying]);

  useEffect(() => {
    if (!isFullscreen && !isInline) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      const target = event.target as HTMLElement;
      if (
        target.tagName === 'INPUT' ||
        target.tagName === 'TEXTAREA' ||
        target.tagName === 'SELECT'
      ) {
        return;
      }

      if (event.key === ' ' && isFullscreen) {
        event.preventDefault();
        togglePlay();
      }
    };

    document.addEventListener('keydown', handleKeyDown);

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [togglePlay, isFullscreen, isInline]);

  const changeRateChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    event.stopPropagation();
    const newRate = parseFloat(event.target.value);
    if (videoRef.current) {
      videoRef.current.playbackRate = newRate;
      setRate(newRate);
    }
  };

  const toggleMute = (event?: React.MouseEvent<HTMLButtonElement>) => {
    if (event) event.stopPropagation();
    if (videoRef.current) {
      if (videoRef.current.muted || videoRef.current.volume === 0) {
        const volumeToRestore = lastVolume > 0 ? lastVolume : 1;
        videoRef.current.volume = volumeToRestore;
        videoRef.current.muted = false;
      } else {
        videoRef.current.muted = true;
      }
    }
  };

  const formatTime = (timeInSeconds: number) => {
    if (isNaN(timeInSeconds) || timeInSeconds < 0) return '0:00';
    const minutes = Math.floor(timeInSeconds / 60);
    const seconds = Math.floor(timeInSeconds % 60)
      .toString()
      .padStart(2, '0');
    return `${minutes}:${seconds}`;
  };

  const skipForward = (event?: React.MouseEvent<HTMLButtonElement>) => {
    if (event) event.stopPropagation();
    if (videoRef.current) videoRef.current.currentTime += 10;
  };

  const skipBackward = (event?: React.MouseEvent<HTMLButtonElement>) => {
    if (event) event.stopPropagation();
    if (videoRef.current) videoRef.current.currentTime -= 10;
  };

  const handleTogglePlay = (event?: React.MouseEvent<HTMLButtonElement>) => {
    if (event) event.stopPropagation();
    togglePlay();
  };

  const handleToggleFullscreen = (event?: React.MouseEvent<HTMLButtonElement>) => {
    if (event) event.stopPropagation();
    toggleFullscreen();
  };

  return (
    <div
      className={`${classes.controller} ${isInline ? classes.inline : ''}`}
      onClick={e => e.stopPropagation()}
    >
      <div className={classes.left}>
        <button className={classes.stdbutton} onClick={toggleMute}>
          {isMuted ? <MuteIcon /> : <UnmuteIcon />}
        </button>
        {!isInline && (
          <div ref={volumeBarRef} className={classes.soudlap} onMouseDown={handleVolumeMouseDown}>
            <div className={classes.played} style={{ width: `${isMuted ? 0 : volume * 100}%` }}>
              <div className={classes.current}></div>
            </div>
          </div>
        )}
      </div>
      <div className={classes.center}>
        <div className={classes.player}>
          <button className={classes.stdbutton} onClick={skipBackward}>
            <BackwardIcon />
          </button>
          <button className={classes.playandstop} onClick={handleTogglePlay}>
            {isPlaying ? <PauseIcon /> : <PlayIcon />}
          </button>
          <button className={classes.stdbutton} onClick={skipForward}>
            <ForwardIcon />
          </button>
        </div>
        <div className={classes.timer}>
          <p>{formatTime(currentTime)}</p>
          <div ref={timelineRef} className={classes.timelaps} onMouseDown={handleTimelineMouseDown}>
            <div className={classes.played} style={{ width: `${progress}%` }}>
              <div className={classes.current}></div>
            </div>
          </div>
          <p>{formatTime(duration)}</p>
        </div>
      </div>
      <div className={classes.right}>
        {!isInline && (
          <select className={classes.range} value={rate} onChange={changeRateChange}>
            <option value={0.5}>0.5x</option>
            <option value={1}>1x</option>
            <option value={1.5}>1.5x</option>
            <option value={2}>2x</option>
          </select>
        )}
        <button className={classes.stdbutton} onClick={handleToggleFullscreen}>
          {isFullscreen ? <ExitFullscreenIcon /> : <FullscreenIcon />}
        </button>
      </div>
    </div>
  );
};

export default Controller;
