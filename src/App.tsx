import { useState, useMemo, useCallback, useEffect, type FC } from 'react';
import { ListFilter, Trash2, Download, Upload, ChevronDown, ChevronRight, Check, Target, Zap, Star, Globe, Shield, AlertTriangle, Flame, Trophy, Clock, Sparkles } from 'lucide-react';
import { watchOrder, type Phase, type WatchItem } from './data';

type EpisodeProgress = Record<string, boolean>;

const STORAGE_KEY = 'arrowverse-progress';

function loadProgress(): EpisodeProgress {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored ? JSON.parse(stored) : {};
  } catch {
    return {};
  }
}

function saveProgress(progress: EpisodeProgress) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(progress));
}

// --- Series color mapping ---
const seriesColors: Record<string, string> = {
  Arrow: 'bg-green-600',
  'The Flash': 'bg-red-600',
  Supergirl: 'bg-blue-500',
  'Legends of Tomorrow': 'bg-yellow-600',
  'Black Lightning': 'bg-indigo-600',
  Batwoman: 'bg-rose-700',
  Constantine: 'bg-amber-700',
  'Superman & Lois': 'bg-sky-600',
  Crossover: 'bg-purple-600',
};

function getSeriesColor(series: string): string {
  return seriesColors[series] || 'bg-zinc-600';
}

// --- Phase icon mapping ---
const phaseIcons: Record<string, FC<{ className?: string }>> = {
  'year-1': Target,
  'year-2': Target,
  'year-3': Zap,
  'year-4': Star,
  'year-5': Globe,
  'year-6': Shield,
  'year-7': Clock,
  'year-8': AlertTriangle,
  'year-9': Flame,
  'year-10': Sparkles,
  'year-11': Trophy,
};

// --- Episode Item ---
function EpisodeItem({
  item,
  checked,
  onToggle,
}: {
  item: WatchItem;
  checked: boolean;
  onToggle: (id: string) => void;
}) {
  return (
    <button
      onClick={() => onToggle(item.id)}
      className={`w-full flex items-start gap-3 p-3 rounded-lg text-left transition-colors ${
        checked
          ? 'bg-zinc-700/30 text-zinc-500'
          : 'bg-zinc-800/50 hover:bg-zinc-700/50 text-gray-100'
      }`}
    >
      <div
        className={`mt-0.5 flex-shrink-0 w-5 h-5 rounded border-2 flex items-center justify-center transition-colors ${
          checked
            ? 'bg-emerald-600 border-emerald-600'
            : 'border-zinc-500'
        }`}
      >
        {checked && <Check className="w-3 h-3 text-white" />}
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap">
          <span
            className={`px-2 py-0.5 text-xs font-semibold rounded ${getSeriesColor(
              item.series
            )} text-white`}
          >
            {item.series}
          </span>
          <span className={`text-sm font-medium ${checked ? 'line-through' : ''}`}>
            {item.episodes}
          </span>
        </div>
        {item.notes && (
          <p className="text-xs text-zinc-400 mt-1">{item.notes}</p>
        )}
      </div>
    </button>
  );
}

// --- Phase Card ---
function PhaseCard({
  phase,
  progress,
  onToggle,
}: {
  phase: Phase;
  progress: EpisodeProgress;
  onToggle: (id: string) => void;
}) {
  const [expanded, setExpanded] = useState(true);
  const completed = phase.items.filter((i) => progress[i.id]).length;
  const total = phase.items.length;
  const pct = total > 0 ? Math.round((completed / total) * 100) : 0;
  const allDone = completed === total;
  const PhaseIcon = phaseIcons[phase.id];

  return (
    <div className="rounded-xl border border-zinc-700/50 bg-zinc-800/30 overflow-hidden">
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full flex items-center gap-3 p-4 hover:bg-zinc-700/30 transition-colors text-left"
      >
        {expanded ? (
          <ChevronDown className="w-5 h-5 text-zinc-400 flex-shrink-0" />
        ) : (
          <ChevronRight className="w-5 h-5 text-zinc-400 flex-shrink-0" />
        )}
        <div className="flex-1 min-w-0">
          <h3 className={`text-lg font-semibold flex items-center gap-2 ${allDone ? 'text-emerald-400' : 'text-gray-100'}`}>
            {PhaseIcon && <PhaseIcon className="w-5 h-5 flex-shrink-0" />}
            {phase.phase}
          </h3>
          <div className="flex items-center gap-3 mt-1">
            <div className="flex-1 h-1.5 bg-zinc-700 rounded-full overflow-hidden">
              <div
                className="h-full bg-emerald-500 rounded-full transition-all duration-300"
                style={{ width: `${pct}%` }}
              />
            </div>
            <span className="text-xs text-zinc-400 flex-shrink-0">
              {completed}/{total}
            </span>
          </div>
        </div>
      </button>
      {expanded && (
        <div className="px-4 pb-4 space-y-2">
          {phase.items.map((item) => (
            <EpisodeItem
              key={item.id}
              item={item}
              checked={!!progress[item.id]}
              onToggle={onToggle}
            />
          ))}
        </div>
      )}
    </div>
  );
}

// --- Main App ---
export default function App() {
  const [progress, setProgress] = useState<EpisodeProgress>(loadProgress);
  const [seriesFilter, setSeriesFilter] = useState<string | null>(null);
  const [showActions, setShowActions] = useState(false);

  useEffect(() => {
    saveProgress(progress);
  }, [progress]);

  const toggleEpisode = useCallback((id: string) => {
    setProgress((prev) => {
      const next = { ...prev };
      next[id] = !next[id];
      return next;
    });
  }, []);

  // All unique series for filtering
  const allSeries = useMemo(() => {
    const set = new Set<string>();
    for (const phase of watchOrder) {
      for (const item of phase.items) {
        set.add(item.series);
      }
    }
    return Array.from(set);
  }, []);

  // Overall progress
  const totalItems = useMemo(
    () => watchOrder.reduce((sum, p) => sum + p.items.length, 0),
    []
  );
  const completedItems = useMemo(
    () =>
      watchOrder.reduce(
        (sum, p) => sum + p.items.filter((i) => progress[i.id]).length,
        0
      ),
    [progress]
  );
  const overallPct = totalItems > 0 ? Math.round((completedItems / totalItems) * 100) : 0;

  // Up Next
  const upNext = useMemo(() => {
    for (const phase of watchOrder) {
      for (const item of phase.items) {
        if (!progress[item.id]) return { phase, item };
      }
    }
    return null;
  }, [progress]);

  // Filtered phases
  const filteredPhases = useMemo(() => {
    if (!seriesFilter) return watchOrder;
    return watchOrder
      .map((p) => ({
        ...p,
        items: p.items.filter((i) => i.series === seriesFilter),
      }))
      .filter((p) => p.items.length > 0);
  }, [seriesFilter]);

  const handleReset = () => {
    if (confirm('Reset all progress? This cannot be undone.')) {
      setProgress({});
    }
  };

  const handleExport = () => {
    const blob = new Blob([JSON.stringify(progress, null, 2)], {
      type: 'application/json',
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'arrowverse-progress.json';
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleImport = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (!file) return;
      const reader = new FileReader();
      reader.onload = () => {
        try {
          const data = JSON.parse(reader.result as string);
          setProgress(data);
        } catch {
          alert('Invalid progress file.');
        }
      };
      reader.readAsText(file);
    };
    input.click();
  };

  return (
    <div className="min-h-screen bg-zinc-900 text-gray-100 p-4 sm:p-8">
      {/* Header */}
      <header className="max-w-4xl mx-auto mb-8">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
          <h1 className="text-3xl sm:text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-500">
            Arrowverse Watch Tracker
          </h1>
          <div className="relative">
            <button
              onClick={() => setShowActions(!showActions)}
              className="flex items-center gap-2 px-3 py-2 text-sm bg-zinc-700 hover:bg-zinc-600 rounded-lg transition-colors"
            >
              <ListFilter className="w-4 h-4" />
              Actions
            </button>
            {showActions && (
              <div className="absolute z-20 right-0 mt-2 w-56 bg-zinc-800 border border-zinc-700 rounded-lg shadow-xl p-2">
                <button
                  onClick={handleExport}
                  className="w-full flex items-center gap-2 py-2 px-3 hover:bg-zinc-700 rounded-md text-left text-sm"
                >
                  <Download className="w-4 h-4" /> Export Progress
                </button>
                <button
                  onClick={handleImport}
                  className="w-full flex items-center gap-2 py-2 px-3 hover:bg-zinc-700 rounded-md text-left text-sm mt-1"
                >
                  <Upload className="w-4 h-4" /> Import Progress
                </button>
                <hr className="border-zinc-700 my-2" />
                <button
                  onClick={handleReset}
                  className="w-full flex items-center gap-2 py-2 px-3 hover:bg-red-900/50 text-red-400 rounded-md text-left text-sm"
                >
                  <Trash2 className="w-4 h-4" /> Reset Progress
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Overall progress bar */}
        <div className="mb-4">
          <div className="flex justify-between text-sm text-zinc-400 mb-1">
            <span>Overall Progress</span>
            <span>
              {completedItems}/{totalItems} ({overallPct}%)
            </span>
          </div>
          <div className="h-3 bg-zinc-700 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-blue-500 to-purple-500 rounded-full transition-all duration-500"
              style={{ width: `${overallPct}%` }}
            />
          </div>
        </div>

        {/* Up Next */}
        {upNext && (
          <div className="p-3 rounded-lg bg-zinc-800 border border-zinc-700/50 mb-4">
            <p className="text-xs text-zinc-400 uppercase tracking-wider mb-1">Up Next</p>
            <p className="text-sm">
              <span
                className={`inline-block px-2 py-0.5 text-xs font-semibold rounded ${getSeriesColor(
                  upNext.item.series
                )} text-white mr-2`}
              >
                {upNext.item.series}
              </span>
              {upNext.item.episodes}
              <span className="text-zinc-500 ml-2">- {upNext.phase.phase}</span>
            </p>
          </div>
        )}

        {/* Series filter */}
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setSeriesFilter(null)}
            className={`px-3 py-1 text-xs rounded-full transition-colors ${
              !seriesFilter
                ? 'bg-zinc-100 text-zinc-900 font-semibold'
                : 'bg-zinc-700 text-zinc-300 hover:bg-zinc-600'
            }`}
          >
            All
          </button>
          {allSeries.map((s) => (
            <button
              key={s}
              onClick={() => setSeriesFilter(seriesFilter === s ? null : s)}
              className={`px-3 py-1 text-xs rounded-full transition-colors ${
                seriesFilter === s
                  ? 'bg-zinc-100 text-zinc-900 font-semibold'
                  : 'bg-zinc-700 text-zinc-300 hover:bg-zinc-600'
              }`}
            >
              {s}
            </button>
          ))}
        </div>
      </header>

      {/* Phase cards */}
      <main className="max-w-4xl mx-auto space-y-6">
        {filteredPhases.map((phase) => (
          <PhaseCard
            key={phase.id}
            phase={phase}
            progress={progress}
            onToggle={toggleEpisode}
          />
        ))}
      </main>
    </div>
  );
}
