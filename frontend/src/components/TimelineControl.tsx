import type { TimeIndex } from "../types/ocean";
import { DEMO_TIME_STEPS, formatDemoTime, formatDemoTimeShort } from "../data/demoTime";
import { Play, Pause, ChevronLeft, ChevronRight } from "lucide-react";

interface TimelineControlProps {
  activeTimeIndex: TimeIndex;
  isPlaying: boolean;
  playbackSpeed: 0.5 | 1 | 2;
  onPrevious: () => void;
  onNext: () => void;
  onTogglePlay: () => void;
  onTimeIndexChange: (timeIndex: TimeIndex) => void;
  onPlaybackSpeedChange: (speed: 0.5 | 1 | 2) => void;
}

export function TimelineControl({
  activeTimeIndex,
  isPlaying,
  playbackSpeed,
  onPrevious,
  onNext,
  onTogglePlay,
  onTimeIndexChange,
  onPlaybackSpeedChange,
}: TimelineControlProps) {
  const activeTimeIso = DEMO_TIME_STEPS[activeTimeIndex];

  return (
    <div className="bg-slate-900 border-t border-slate-700 p-4 text-white flex flex-col gap-4">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="font-bold text-lg">Ocean Time Explorer</h2>
          <div className="text-sm text-slate-400 mt-1">
            <span className="bg-blue-900/50 text-blue-300 px-2 py-0.5 rounded text-xs font-semibold mr-2 border border-blue-800">
              Demo time series
            </span>
            {formatDemoTime(activeTimeIso)}
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div className="flex items-center bg-slate-800 rounded-lg p-1 border border-slate-700">
            <button
              onClick={onPrevious}
              className="p-2 hover:bg-slate-700 rounded transition-colors text-slate-300 hover:text-white"
              aria-label="Previous time step"
              title="Previous time step"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <button
              onClick={onTogglePlay}
              className="p-2 hover:bg-slate-700 rounded transition-colors text-slate-300 hover:text-white mx-1"
              aria-label={isPlaying ? "Pause time animation" : "Play time animation"}
              title={isPlaying ? "Pause time animation" : "Play time animation"}
            >
              {isPlaying ? <Pause className="w-5 h-5 fill-current" /> : <Play className="w-5 h-5 fill-current" />}
            </button>
            <button
              onClick={onNext}
              className="p-2 hover:bg-slate-700 rounded transition-colors text-slate-300 hover:text-white"
              aria-label="Next time step"
              title="Next time step"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>

          <select
            value={playbackSpeed}
            onChange={(e) => onPlaybackSpeedChange(Number(e.target.value) as 0.5 | 1 | 2)}
            className="bg-slate-800 border border-slate-700 text-sm rounded-lg px-3 py-2 text-slate-300 focus:outline-none focus:border-blue-500"
            aria-label="Playback speed"
            title="Playback speed"
          >
            <option value={0.5}>0.5&times;</option>
            <option value={1}>1&times;</option>
            <option value={2}>2&times;</option>
          </select>
        </div>
      </div>

      <div className="flex items-center gap-4 w-full">
        <span className="text-xs text-slate-400 w-24 text-right">
          {formatDemoTimeShort(DEMO_TIME_STEPS[0])}
        </span>
        <input
          type="range"
          min={0}
          max={7}
          step={1}
          value={activeTimeIndex}
          onChange={(e) => onTimeIndexChange(Number(e.target.value) as TimeIndex)}
          className="flex-1 accent-blue-500 h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer"
          aria-label="Time step selector"
        />
        <span className="text-xs text-slate-400 w-24">
          {formatDemoTimeShort(DEMO_TIME_STEPS[7])}
        </span>
      </div>
      
      <div className="text-xs text-slate-500 text-center">
        Demo time series &bull; deterministic local data
      </div>
    </div>
  );
}
