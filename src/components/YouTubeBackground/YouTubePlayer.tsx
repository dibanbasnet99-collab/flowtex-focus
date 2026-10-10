import React, { useEffect, useRef } from 'react';

interface YouTubePlayerProps {
  videoId: string;
  volume: number; // 0 to 100
  isMuted: boolean;
  isPlaying: boolean;
  showVideo: boolean;
  blur: number;
}

export const YouTubePlayer: React.FC<YouTubePlayerProps> = ({
  videoId,
  volume,
  isMuted,
  isPlaying,
  showVideo,
  blur,
}) => {
  const iframeRef = useRef<HTMLIFrameElement>(null);

  const sendCommand = (func: string, args: any[] = []) => {
    if (iframeRef.current && iframeRef.current.contentWindow) {
      iframeRef.current.contentWindow.postMessage(
        JSON.stringify({ event: 'command', func, args }),
        '*'
      );
    }
  };

  // Sync volume & mute
  useEffect(() => {
    if (isMuted) {
      sendCommand('mute');
    } else {
      sendCommand('unMute');
      sendCommand('setVolume', [volume]);
    }
  }, [volume, isMuted]);

  // Sync play/pause
  useEffect(() => {
    if (isPlaying) {
      sendCommand('playVideo');
    } else {
      sendCommand('pauseVideo');
    }
  }, [isPlaying]);

  if (!videoId) return null;

  // YouTube embed URL with autoplay, loop, and jsapi enabled
  const embedUrl = `https://www.youtube.com/embed/${videoId}?autoplay=1&mute=${
    isMuted ? 1 : 0
  }&controls=0&loop=1&playlist=${videoId}&enablejsapi=1&playsinline=1&rel=0&showinfo=0&modestbranding=1&iv_load_policy=3`;

  return (
    <div
      className={`absolute inset-0 overflow-hidden pointer-events-none transition-opacity duration-700 ${
        showVideo ? 'opacity-100' : 'opacity-0'
      }`}
      style={{
        filter: `blur(${blur}px)`,
      }}
    >
      <iframe
        ref={iframeRef}
        src={embedUrl}
        title="YouTube Ambient Focus Stream"
        allow="autoplay; encrypted-media"
        className="w-[120vw] h-[67.5vw] min-h-[120vh] min-w-[213.33vh] absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none scale-105"
      />
    </div>
  );
};
