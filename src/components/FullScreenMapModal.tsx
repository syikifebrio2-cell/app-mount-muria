import { useState } from "react";
import { X, ZoomIn, ZoomOut, RotateCcw, Mountain, Droplets, AlertTriangle, Compass } from "lucide-react";

export function FullScreenMapModal({
  isOpen,
  onClose,
  imageSrc,
}: {
  isOpen: boolean;
  onClose: () => void;
  imageSrc: string;
}) {
  const [scale, setScale] = useState(1);

  if (!isOpen) return null;

  function handleZoomIn() {
    setScale((prev) => Math.min(prev + 0.3, 3));
  }

  function handleZoomOut() {
    setScale((prev) => Math.max(prev - 0.3, 0.8));
  }

  function handleReset() {
    setScale(1);
  }

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-black/95 text-white animate-in fade-in duration-200">
      {/* Top Bar */}
      <div className="flex items-center justify-between px-5 pt-[max(0.75rem,env(safe-area-inset-top))] pb-3 border-b border-white/10 bg-black/40 backdrop-blur-md">
        <div className="flex items-center gap-2">
          <Compass className="h-4 w-4 text-amber-400" />
          <div>
            <h2 className="text-xs font-extrabold uppercase tracking-wider text-white">
              Peta Topografi Gunung Muria
            </h2>
            <p className="text-[10px] text-white/60">Jalur Resmi Rahtawu & Puncak 29</p>
          </div>
        </div>
        <button
          onClick={onClose}
          className="flex h-8 w-8 items-center justify-center rounded-full bg-white/15 text-white hover:bg-white/25 active:scale-95 transition-all"
        >
          <X className="h-4 w-4" />
        </button>
      </div>

      {/* Map Viewport */}
      <div className="flex-1 overflow-auto flex items-center justify-center p-2 cursor-grab active:cursor-grabbing">
        <div
          className="transition-transform duration-200 ease-out origin-center"
          style={{ transform: `scale(${scale})` }}
        >
          <img
            src={imageSrc}
            alt="Peta Topografi Lengkap Jalur Gunung Muria"
            className="max-h-[75vh] w-auto max-w-none rounded-xl object-contain shadow-2xl"
          />
        </div>
      </div>

      {/* Bottom Floating Legend & Zoom Controls */}
      <div className="border-t border-white/10 bg-black/60 px-5 pt-3 pb-[max(1rem,env(safe-area-inset-bottom))] backdrop-blur-md flex flex-col gap-2.5">
        {/* Legend */}
        <div className="flex flex-wrap items-center justify-center gap-3 text-[10px] text-white/80">
          <span className="flex items-center gap-1">
            <span className="h-2 w-2 rounded-full bg-emerald-400" /> Pos 1 s/d Pos 4
          </span>
          <span className="flex items-center gap-1">
            <Droplets className="h-3 w-3 text-sky-400" /> Sendang Bunton (Air)
          </span>
          <span className="flex items-center gap-1">
            <AlertTriangle className="h-3 w-3 text-amber-400" /> Jalur Naga (Jurang)
          </span>
          <span className="flex items-center gap-1">
            <Mountain className="h-3 w-3 text-rose-400" /> Puncak 29 (1.602 mdpl)
          </span>
        </div>

        {/* Zoom Controls */}
        <div className="flex items-center justify-center gap-2">
          <button
            onClick={handleZoomOut}
            className="flex items-center gap-1 rounded-xl bg-white/15 px-3 py-1.5 text-xs font-semibold hover:bg-white/25 active:scale-95"
            title="Zoom Out"
          >
            <ZoomOut className="h-3.5 w-3.5" />
          </button>
          <button
            onClick={handleReset}
            className="flex items-center gap-1 rounded-xl bg-white/15 px-3.5 py-1.5 text-xs font-semibold hover:bg-white/25 active:scale-95 font-mono"
            title="Reset Zoom"
          >
            <RotateCcw className="h-3.5 w-3.5 mr-1" /> {Math.round(scale * 100)}%
          </button>
          <button
            onClick={handleZoomIn}
            className="flex items-center gap-1 rounded-xl bg-white/15 px-3 py-1.5 text-xs font-semibold hover:bg-white/25 active:scale-95"
            title="Zoom In"
          >
            <ZoomIn className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
}
