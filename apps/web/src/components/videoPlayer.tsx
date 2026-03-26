"use client";
import { useState, useRef, useEffect, useCallback } from "react";
import { cn } from "@/lib/utils";
import {
  PlayIcon,
  PauseIcon,
  Volume2Icon,
  VolumeXIcon,
  MaximizeIcon,
  MinimizeIcon,
  VideoOff,
  LoaderIcon,
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

interface VideoPlayerProps {
  src: string;
  poster?: string;
  className?: string;
  autoPlay?: boolean;
}

export default function VideoPlayer({
  src,
  poster,
  className,
  autoPlay = false,
}: VideoPlayerProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const progressRef = useRef<HTMLDivElement>(null);
  const hideControlsTimer = useRef<NodeJS.Timeout | null>(null);

  const [isPlaying, setIsPlaying] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(1);
  const [isMuted, setIsMuted] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showControls, setShowControls] = useState(true);
  const [isHovering, setIsHovering] = useState(false);
  const [hoverTime, setHoverTime] = useState(0);

  const formatTime = (time: number) => {
    const mins = Math.floor(time / 60);
    const secs = Math.floor(time % 60);
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  const handleLoadedMetadata = () => {
    if (videoRef.current) {
      setDuration(videoRef.current.duration);
      setIsLoading(false);
    }
  };

  const handleTimeUpdate = () => {
    if (videoRef.current) {
      setCurrentTime(videoRef.current.currentTime);
    }
  };

  const handleCanPlay = () => {
    setIsLoading(false);
  };

  const handleWaiting = () => {
    setIsLoading(true);
  };

  const handleError = () => {
    setHasError(true);
    setIsLoading(false);
  };

  const togglePlay = useCallback(() => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause();
      } else {
        videoRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  }, [isPlaying]);

  const handleProgressClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (progressRef.current && videoRef.current) {
      const rect = progressRef.current.getBoundingClientRect();
      const pos = (e.clientX - rect.left) / rect.width;
      videoRef.current.currentTime = pos * duration;
    }
  };

  const handleProgressHover = (e: React.MouseEvent<HTMLDivElement>) => {
    if (progressRef.current) {
      const rect = progressRef.current.getBoundingClientRect();
      const pos = (e.clientX - rect.left) / rect.width;
      setHoverTime(pos * duration);
    }
  };

  const toggleMute = () => {
    if (videoRef.current) {
      videoRef.current.muted = !isMuted;
      setIsMuted(!isMuted);
    }
  };

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newVolume = parseFloat(e.target.value);
    if (videoRef.current) {
      videoRef.current.volume = newVolume;
      setVolume(newVolume);
      setIsMuted(newVolume === 0);
    }
  };

  const toggleFullscreen = async () => {
    if (!containerRef.current) return;
    if (!document.fullscreenElement) {
      await containerRef.current.requestFullscreen();
      setIsFullscreen(true);
    } else {
      await document.exitFullscreen();
      setIsFullscreen(false);
    }
  };

  const handleMouseMove = () => {
    setShowControls(true);
    if (hideControlsTimer.current) {
      clearTimeout(hideControlsTimer.current);
    }
    hideControlsTimer.current = setTimeout(() => {
      if (isPlaying) {
        setShowControls(false);
      }
    }, 3000);
  };

  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    document.addEventListener("fullscreenchange", handleFullscreenChange);
    return () => {
      document.removeEventListener("fullscreenchange", handleFullscreenChange);
    };
  }, []);

  useEffect(() => {
    if (autoPlay && videoRef.current) {
      videoRef.current.play().catch(() => {});
      setIsPlaying(true);
    }
  }, [autoPlay]);

  useEffect(() => {
    return () => {
      if (hideControlsTimer.current) {
        clearTimeout(hideControlsTimer.current);
      }
    };
  }, []);

  if (hasError) {
    return (
      <div
        className={cn(
          "w-full bg-gray-100 border-2 border-dashed border-gray-300 flex-col items-center justify-center text-gray-500 rounded",
          className,
        )}
      >
        <VideoOff className="w-8 h-8 mb-2" />
        <p className="text-sm text-center px-4">
          Sorry, we can't play this video right now
        </p>
      </div>
    );
  }

  const progress = duration > 0 ? (currentTime / duration) * 100 : 0;

  return (
    <div
      ref={containerRef}
      className={cn(
        "relative bg-black rounded-lg overflow-hidden group",
        isFullscreen ? "fixed inset-0 z-[100] rounded-none" : "",
        className,
      )}
      onMouseMove={handleMouseMove}
      onMouseLeave={() => isPlaying && setShowControls(false)}
    >
      <video
        ref={videoRef}
        src={src}
        poster={poster}
        className="w-full h-full object-contain"
        onClick={togglePlay}
        onLoadedMetadata={handleLoadedMetadata}
        onTimeUpdate={handleTimeUpdate}
        onCanPlay={handleCanPlay}
        onWaiting={handleWaiting}
        onError={handleError}
        onPlay={() => setIsPlaying(true)}
        onPause={() => setIsPlaying(false)}
        onEnded={() => setIsPlaying(false)}
        playsInline
      />

      <AnimatePresence>
        {isLoading && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 flex items-center justify-center bg-black/30"
          >
            <LoaderIcon className="w-10 h-10 animate-spin text-white" />
          </motion.div>
        )}
      </AnimatePresence>

      {!isPlaying && !isLoading && (
        <motion.button
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.8 }}
          onClick={togglePlay}
          className="absolute inset-0 flex items-center justify-center bg-black/20 hover:bg-black/30 transition-colors cursor-pointer"
        >
          <div className="bg-white/90 rounded-full p-4 shadow-lg">
            <PlayIcon className="w-10 h-10 text-gray-900" />
          </div>
        </motion.button>
      )}

      <AnimatePresence>
        {showControls && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-4 pt-12"
          >
            <div
              ref={progressRef}
              className="relative h-1.5 bg-white/30 rounded-full cursor-pointer group/progress mb-3"
              onClick={handleProgressClick}
              onMouseMove={handleProgressHover}
              onMouseEnter={() => setIsHovering(true)}
              onMouseLeave={() => setIsHovering(false)}
            >
              <div
                className="absolute h-full bg-blue-500 rounded-full"
                style={{ width: `${progress}%` }}
              />
              <div
                className="absolute h-4 w-4 bg-white rounded-full top-1/2 -translate-y-1/2 opacity-0 group-hover/progress:opacity-100 transition-opacity shadow-md"
                style={{ left: `calc(${progress}% - 8px)` }}
              />
              {isHovering && (
                <div
                  className="absolute bottom-full mb-2 px-2 py-1 bg-black/90 text-white text-xs rounded transform -translate-x-1/2"
                  style={{
                    left: `${Math.max(0, Math.min(100, (hoverTime / duration) * 100))}%`,
                  }}
                >
                  {formatTime(hoverTime)}
                </div>
              )}
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <button
                  onClick={togglePlay}
                  className="text-white hover:text-white/80 transition-colors"
                >
                  {isPlaying ? (
                    <PauseIcon className="w-5 h-5" />
                  ) : (
                    <PlayIcon className="w-5 h-5" />
                  )}
                </button>

                <button
                  onClick={toggleMute}
                  className="text-white hover:text-white/80 transition-colors"
                >
                  {isMuted || volume === 0 ? (
                    <VolumeXIcon className="w-5 h-5" />
                  ) : (
                    <Volume2Icon className="w-5 h-5" />
                  )}
                </button>

                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.1"
                  value={isMuted ? 0 : volume}
                  onChange={handleVolumeChange}
                  className="w-16 h-1 accent-white bg-white/30 rounded appearance-none cursor-pointer"
                />

                <span className="text-white text-sm font-mono">
                  {formatTime(currentTime)} / {formatTime(duration)}
                </span>
              </div>

              <button
                onClick={toggleFullscreen}
                className="text-white hover:text-white/80 transition-colors"
              >
                {isFullscreen ? (
                  <MinimizeIcon className="w-5 h-5" />
                ) : (
                  <MaximizeIcon className="w-5 h-5" />
                )}
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
