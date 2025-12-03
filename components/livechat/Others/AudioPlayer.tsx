import { Pause, Play } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';

export default function AudioPlayer({ src }: { src: string }) {
  const audioRef = useRef(new Audio(src));
  const [isPlaying, setIsPlaying] = useState(false);
  const [duration, setDuration] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);

  const audio = audioRef.current;

  useEffect(() => {
    const handleLoadedMetadata = () => {
      setDuration(audio.duration);
    };
    const handleTimeUpdate = () => setCurrentTime(audio.currentTime);
    const handleEnded = () => {
      setIsPlaying(false);
    };

    audio.addEventListener('loadedmetadata', handleLoadedMetadata);
    audio.addEventListener('timeupdate', handleTimeUpdate);
    audio.addEventListener('ended', handleEnded); // 👈 listen for audio end

    return () => {
      audio.pause();
      audio.removeEventListener('loadedmetadata', handleLoadedMetadata);
      audio.removeEventListener('timeupdate', handleTimeUpdate);
      audio.removeEventListener('ended', handleEnded); // 👈 clean up
    };
  }, [audio]);

  function togglePlay() {
    if (isPlaying) {
      audio.pause();
    } else {
      audio.play();
    }
    setIsPlaying(!isPlaying);
  }

  function handleSeek(e: React.ChangeEvent<HTMLInputElement>) {
    const time = parseFloat(e.target.value);
    audio.currentTime = time;
    setCurrentTime(time);
  }

  return (
    <div className='flex w-full max-w-sm items-center gap-3 rounded-xl bg-gray-800 p-2 text-white dark:bg-gray-700 dark:text-black'>
      {/* Play button */}
      <button
        onClick={togglePlay}
        className='flex h-10 w-10 items-center justify-center rounded-full bg-white/20 hover:bg-white/30'
      >
        {isPlaying ? (
          <Pause className='h-4 w-4 fill-white stroke-white' />
        ) : (
          <Play className='h-4 w-4 fill-white stroke-white' />
        )}
      </button>

      {/* Slider */}
      <div className='flex flex-1 items-center'>
        <input
          type='range'
          min={0}
          max={duration}
          value={currentTime}
          step={0.000000000001}
          onChange={handleSeek}
          className='h-1 w-full cursor-pointer appearance-none rounded-lg bg-white/30 accent-white'
        />
      </div>

      {/* Time */}
      <span className='text-xs text-white'>
        {isPlaying ? formatTime(currentTime) : formatTime(duration)}
      </span>
    </div>
  );
}

function formatTime(time: number) {
  const mins = Math.floor(time / 60);
  const secs = Math.floor(time % 60);
  return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
}
