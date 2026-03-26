"use client";
import VideoPlayer from "@/components/videoPlayer";

interface FullPageVideoPlayerProps {
  src: string;
  poster?: string;
}

export default function FullPageVideoPlayer({ src, poster }: FullPageVideoPlayerProps) {
  return (
    <div className="w-full max-w-4xl mx-auto">
      <VideoPlayer
        src={src}
        poster={poster}
        className="w-full aspect-video"
        autoPlay={false}
      />
    </div>
  );
}
