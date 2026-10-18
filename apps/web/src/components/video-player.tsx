"use client";
import { useRef, useState } from "react";
import { Button } from "./ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from "./ui/dialog";

function timeLabel(seconds: number) {
  if (!Number.isFinite(seconds)) return "0:00";
  return `${Math.floor(seconds / 60)}:${Math.floor(seconds % 60)
    .toString()
    .padStart(2, "0")}`;
}

export default function VideoPlayer({
  src,
  expanded = false,
  startAt = 0,
}: {
  src: string;
  expanded?: boolean;
  startAt?: number;
}) {
  const video = useRef<HTMLVideoElement>(null);
  const container = useRef<HTMLDivElement>(null);
  const [playing, setPlaying] = useState(false);
  const [muted, setMuted] = useState(false);
  const [position, setPosition] = useState(0);
  const [duration, setDuration] = useState(0);
  const [error, setError] = useState("");
  const [open, setOpen] = useState(false);
  async function toggle() {
    if (!video.current) return;
    try {
      if (video.current.paused) await video.current.play();
      else video.current.pause();
    } catch {
      setError(
        "Could not play this video. Try again or open the original file.",
      );
    }
  }
  return (
    <div
      ref={container}
      className="bg-black text-white rounded overflow-hidden"
    >
      <video
        ref={video}
        src={src}
        preload="metadata"
        playsInline
        className="w-full max-h-[70dvh]"
        aria-label="Post video"
        onClick={() => void toggle()}
        onPlay={() => {
          setPlaying(true);
          setError("");
        }}
        onPause={() => setPlaying(false)}
        onTimeUpdate={(event) => setPosition(event.currentTarget.currentTime)}
        onLoadedMetadata={(event) => {
          const length = Number.isFinite(event.currentTarget.duration)
            ? event.currentTarget.duration
            : 0;
          setDuration(length);
          if (startAt && length)
            event.currentTarget.currentTime = Math.min(startAt, length);
        }}
        onDurationChange={(event) =>
          setDuration(
            Number.isFinite(event.currentTarget.duration)
              ? event.currentTarget.duration
              : 0,
          )
        }
        onVolumeChange={(event) => setMuted(event.currentTarget.muted)}
        onError={() => setError("This video could not be loaded.")}
      />
      <div className="p-2 space-y-2">
        <input
          aria-label="Video position"
          className="w-full"
          type="range"
          min={0}
          max={duration || 1}
          step={0.1}
          value={Math.min(position, duration || 1)}
          disabled={!duration}
          onChange={(event) => {
            const next = Number(event.target.value);
            if (video.current) video.current.currentTime = next;
            setPosition(next);
          }}
        />
        <div className="flex flex-wrap items-center gap-2 text-sm">
          <Button
            type="button"
            variant="secondary"
            size="sm"
            onClick={() => void toggle()}
            aria-label={playing ? "Pause video" : "Play video"}
          >
            {playing ? "Pause" : "Play"}
          </Button>
          <span>
            {timeLabel(position)} / {timeLabel(duration)}
          </span>
          <Button
            type="button"
            variant="secondary"
            size="sm"
            aria-label={muted ? "Unmute video" : "Mute video"}
            onClick={() => {
              if (video.current) video.current.muted = !video.current.muted;
            }}
          >
            {muted ? "Unmute" : "Mute"}
          </Button>
          {!expanded && (
            <Button
              type="button"
              variant="secondary"
              size="sm"
              onClick={() => {
                video.current?.pause();
                setOpen(true);
              }}
            >
              Expand video
            </Button>
          )}
          {expanded && (
            <Button
              type="button"
              variant="secondary"
              size="sm"
              onClick={async () => {
                try {
                  if (container.current?.requestFullscreen)
                    await container.current.requestFullscreen();
                  else
                    (
                      video.current as
                        | (HTMLVideoElement & {
                            webkitEnterFullscreen?: () => void;
                          })
                        | null
                    )?.webkitEnterFullscreen?.();
                } catch {
                  setError("Fullscreen is unavailable in this browser.");
                }
              }}
            >
              Fullscreen
            </Button>
          )}
        </div>
        {error && (
          <p role="alert" className="text-sm">
            {error}{" "}
            <a
              href={src}
              target="_blank"
              rel="noopener noreferrer"
              className="underline"
            >
              Open video
            </a>
          </p>
        )}
      </div>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-5xl">
          <DialogTitle>Video</DialogTitle>
          <DialogDescription className="sr-only">
            Expanded video playback
          </DialogDescription>
          {open && (
            <VideoPlayer key={src} src={src} expanded startAt={position} />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
