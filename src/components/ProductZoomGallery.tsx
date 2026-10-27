'use client';

import React, { useState, useRef } from 'react';
import {
  ZoomIn,
  Maximize2,
  X,
  ChevronLeft,
  ChevronRight,
  Play,
  Pause,
  Volume2,
  VolumeX,
  Image as ImageIcon,
  Video as VideoIcon,
} from 'lucide-react';

interface ProductZoomGalleryProps {
  images: string[];
  modelName: string;
  videoUrl?: string;
  videoTitle?: string;
}

const VIEW_LABELS = [
  'Full Profile (Side)',
  'Cockpit & Digital Display',
  'Lithium Battery & Motor',
  'Front Suspension & Disc Brakes',
];

export default function ProductZoomGallery({
  images,
  modelName,
  videoUrl = 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4',
  videoTitle,
}: ProductZoomGalleryProps) {
  const [activeTab, setActiveTab] = useState<'photos' | 'video'>('photos');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [isZoomed, setIsZoomed] = useState(false);
  const [zoomPosition, setZoomPosition] = useState({ x: 50, y: 50 });
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);

  // Video state
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(true);
  const videoRef = useRef<HTMLVideoElement>(null);
  const imageContainerRef = useRef<HTMLDivElement>(null);

  const fallbackImg = 'https://images.unsplash.com/photo-1571068316344-75bc76f77890?q=80&w=1200&auto=format&fit=crop';
  const rawImage = images[selectedIndex] || images[0];
  const activeImage = rawImage && !rawImage.startsWith('blob:') ? rawImage : fallbackImg;

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!imageContainerRef.current) return;
    const { left, top, width, height } = imageContainerRef.current.getBoundingClientRect();
    const x = ((e.clientX - left) / width) * 100;
    const y = ((e.clientY - top) / height) * 100;
    setZoomPosition({
      x: Math.min(Math.max(x, 0), 100),
      y: Math.min(Math.max(y, 0), 100),
    });
  };

  const handlePrev = () => {
    setSelectedIndex((prev) => (prev > 0 ? prev - 1 : images.length - 1));
  };

  const handleNext = () => {
    setSelectedIndex((prev) => (prev < images.length - 1 ? prev + 1 : 0));
  };

  const handleTogglePlay = () => {
    if (!videoRef.current) return;
    if (isPlaying) {
      videoRef.current.pause();
      setIsPlaying(false);
    } else {
      videoRef.current.play();
      setIsPlaying(true);
    }
  };

  const handleToggleMute = () => {
    if (!videoRef.current) return;
    videoRef.current.muted = !videoRef.current.muted;
    setIsMuted(videoRef.current.muted);
  };

  return (
    <div className="flex flex-col gap-3">
      {/* Top Media Mode Switcher (Photos vs Video) */}
      <div className="flex items-center justify-between pb-1">
        <div className="flex space-x-2 bg-slate-100 p-1 rounded-xl border border-slate-200">
          <button
            type="button"
            onClick={() => {
              setActiveTab('photos');
              if (videoRef.current) {
                videoRef.current.pause();
                setIsPlaying(false);
              }
            }}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
              activeTab === 'photos'
                ? 'bg-electric text-black shadow-electric'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <ImageIcon className="w-3.5 h-3.5" />
            <span>4-Angle Photos (Zoom)</span>
          </button>

          <button
            type="button"
            onClick={() => {
              setActiveTab('video');
              setTimeout(() => {
                if (videoRef.current) {
                  videoRef.current.play();
                  setIsPlaying(true);
                }
              }, 100);
            }}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
              activeTab === 'video'
                ? 'bg-electric text-black shadow-electric'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <VideoIcon className="w-3.5 h-3.5" />
            <span>Road Test Video</span>
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          </button>
        </div>

        <span className="text-[11px] text-slate-500 hidden sm:block">
          {activeTab === 'photos' ? 'Hover image to inspect components 2.5x' : 'Watch Ghana terrain demonstration'}
        </span>
      </div>

      {/* Main Media Stage */}
      <div className="relative rounded-2xl bg-slate-100 border border-slate-200 overflow-hidden group select-none shadow-sm">
        {activeTab === 'photos' ? (
          /* Photo Stage with Zoom */
          <div
            ref={imageContainerRef}
            onMouseEnter={() => setIsZoomed(true)}
            onMouseLeave={() => setIsZoomed(false)}
            onMouseMove={handleMouseMove}
            className="relative aspect-[4/3] w-full cursor-crosshair overflow-hidden"
          >
            {/* Base Image */}
            <img
              src={activeImage}
              alt={`${modelName} - angle ${selectedIndex + 1}`}
              className={`w-full h-full object-cover transition-opacity duration-200 ${
                isZoomed ? 'opacity-30 lg:opacity-0' : 'opacity-100'
              }`}
            />

            {/* Desktop High-Resolution Zoom Lens / Full Zoom Canvas */}
            {isZoomed && (
              <div
                className="hidden lg:block absolute inset-0 pointer-events-none bg-no-repeat transition-all duration-75"
                style={{
                  backgroundImage: `url(${activeImage})`,
                  backgroundPosition: `${zoomPosition.x}% ${zoomPosition.y}%`,
                  backgroundSize: '250%',
                }}
              />
            )}

            {/* Hint Overlay (desktop) */}
            <div className="absolute top-3 left-3 bg-black/75 backdrop-blur-md text-electric text-[11px] font-bold px-2.5 py-1 rounded-full border border-electric/30 flex items-center gap-1.5 pointer-events-none">
              <ZoomIn className="w-3.5 h-3.5" />
              <span>Hover to Zoom 2.5x</span>
            </div>

            {/* View Label */}
            <div className="absolute bottom-3 left-3 bg-black/80 backdrop-blur-md text-gray-200 text-xs px-3 py-1 rounded-lg border border-white/10 font-medium">
              {VIEW_LABELS[selectedIndex % VIEW_LABELS.length] || `Angle ${selectedIndex + 1}`}
            </div>

            {/* Fullscreen Modal Opener Button */}
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                setIsLightboxOpen(true);
              }}
              className="absolute top-3 right-3 p-2 bg-black/70 hover:bg-electric text-white hover:text-black rounded-xl border border-white/10 transition-colors shadow-lg"
              title="Open Fullscreen Lightbox"
            >
              <Maximize2 className="w-4 h-4" />
            </button>
          </div>
        ) : (
          /* Video Stage */
          <div className="relative aspect-[4/3] w-full bg-black flex items-center justify-center overflow-hidden">
            <video
              ref={videoRef}
              src={videoUrl}
              playsInline
              loop
              muted={isMuted}
              onPlay={() => setIsPlaying(true)}
              onPause={() => setIsPlaying(false)}
              className="w-full h-full object-cover"
            />

            {/* Top Video Title Tag */}
            <div className="absolute top-3 left-3 right-3 flex items-center justify-between pointer-events-none">
              <span className="bg-black/80 backdrop-blur-md text-white text-xs font-bold px-3 py-1 rounded-lg border border-white/10 flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-electric animate-pulse" />
                {videoTitle || `${modelName} — Ghana Road & Trail Demonstration`}
              </span>
            </div>

            {/* Video Controls Bar */}
            <div className="absolute bottom-3 inset-x-3 flex items-center justify-between bg-black/75 backdrop-blur-md px-3 py-2 rounded-xl border border-white/10">
              <button
                type="button"
                onClick={handleTogglePlay}
                className="p-1.5 rounded-lg bg-electric text-black font-extrabold hover:bg-electric-dark transition-all flex items-center gap-1.5 text-xs uppercase tracking-wider"
              >
                {isPlaying ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5 fill-black" />}
                <span>{isPlaying ? 'Pause' : 'Play Footage'}</span>
              </button>

              <div className="flex items-center space-x-2">
                <span className="text-[10px] text-gray-400 hidden sm:inline">Ghana Savanna & Pothole Tested</span>
                <button
                  type="button"
                  onClick={handleToggleMute}
                  className="p-1.5 rounded-lg bg-[#222] text-gray-300 hover:text-white transition-all"
                  title={isMuted ? 'Unmute' : 'Mute'}
                >
                  {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4 text-electric" />}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Mobile Navigation Arrows (for photos) */}
        {activeTab === 'photos' && (
          <>
            <button
              type="button"
              onClick={handlePrev}
              className="lg:hidden absolute left-2 top-1/2 -translate-y-1/2 p-2 rounded-full bg-black/70 text-white border border-white/10"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <button
              type="button"
              onClick={handleNext}
              className="lg:hidden absolute right-2 top-1/2 -translate-y-1/2 p-2 rounded-full bg-black/70 text-white border border-white/10"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </>
        )}
      </div>

      {/* Thumbnails Row: Photos + Video Thumbnail */}
      <div className="grid grid-cols-5 gap-2">
        {images.map((imgUrl, idx) => (
          <button
            key={idx}
            type="button"
            onClick={() => {
              setActiveTab('photos');
              setSelectedIndex(idx);
            }}
            className={`relative aspect-[4/3] rounded-xl overflow-hidden border-2 transition-all group ${
              activeTab === 'photos' && selectedIndex === idx
                ? 'border-electric shadow-electric ring-2 ring-electric/30 scale-102'
                : 'border-slate-200 opacity-80 hover:opacity-100 hover:border-slate-300'
            }`}
          >
            <img
              src={imgUrl}
              alt={`Thumb ${idx + 1}`}
              className="w-full h-full object-cover"
            />
            <span className="absolute bottom-0 inset-x-0 bg-slate-900/80 text-[9px] text-slate-100 py-0.5 text-center truncate px-1">
              {['Side', 'Cockpit', 'Battery', 'Brakes'][idx] || `Angle ${idx + 1}`}
            </span>
          </button>
        ))}

        {/* 5th slot: Video Thumbnail Button */}
        <button
          type="button"
          onClick={() => {
            setActiveTab('video');
            setTimeout(() => {
              if (videoRef.current) {
                videoRef.current.play();
                setIsPlaying(true);
              }
            }, 100);
          }}
          className={`relative aspect-[4/3] rounded-xl overflow-hidden border-2 transition-all bg-slate-100 flex flex-col items-center justify-center group ${
            activeTab === 'video'
              ? 'border-electric shadow-electric ring-2 ring-electric/30'
              : 'border-slate-200 opacity-80 hover:opacity-100 hover:border-slate-300'
          }`}
        >
          <div className="w-7 h-7 rounded-full bg-emerald-100 border border-emerald-300 flex items-center justify-center text-emerald-700 mb-1 group-hover:scale-110 transition-transform">
            <Play className="w-3.5 h-3.5 fill-emerald-600" />
          </div>
          <span className="text-[9px] font-bold text-slate-800 uppercase tracking-wider">Video</span>
        </button>
      </div>

      {/* Lightbox / High Res Modal */}
      {isLightboxOpen && (
        <div className="fixed inset-0 z-50 bg-black/95 backdrop-blur-xl flex flex-col justify-between p-4 sm:p-8 animate-in fade-in duration-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <span className="text-white font-black text-lg">{modelName}</span>
              <span className="bg-electric text-black font-extrabold text-xs px-2 py-0.5 rounded">
                High-Res View
              </span>
            </div>
            <button
              onClick={() => setIsLightboxOpen(false)}
              className="p-2 rounded-xl bg-[#222222] text-gray-300 hover:text-white hover:bg-[#333333]"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          <div className="relative flex-1 flex items-center justify-center my-4 overflow-hidden">
            <img
              src={activeImage}
              alt={modelName}
              className="max-h-[80vh] max-w-full object-contain rounded-xl shadow-2xl"
            />
            <button
              onClick={handlePrev}
              className="absolute left-4 p-3 rounded-full bg-black/60 hover:bg-electric text-white hover:text-black border border-white/20 transition-all"
            >
              <ChevronLeft className="w-6 h-6" />
            </button>
            <button
              onClick={handleNext}
              className="absolute right-4 p-3 rounded-full bg-black/60 hover:bg-electric text-white hover:text-black border border-white/20 transition-all"
            >
              <ChevronRight className="w-6 h-6" />
            </button>
          </div>

          <div className="flex justify-center gap-3">
            {images.map((img, i) => (
              <button
                key={i}
                onClick={() => setSelectedIndex(i)}
                className={`w-16 h-12 rounded-lg overflow-hidden border-2 ${
                  selectedIndex === i ? 'border-electric' : 'border-transparent opacity-60'
                }`}
              >
                <img src={img} alt="" className="w-full h-full object-cover" />
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
