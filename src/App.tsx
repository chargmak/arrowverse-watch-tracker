import { useState, useMemo, useCallback, useEffect, useRef, type FC } from 'react';
import { ListFilter, Trash2, Download, Upload, ChevronDown, ChevronRight, Check, Target, Zap, Star, Globe, Shield, AlertTriangle, Flame, Trophy, Clock, Sparkles, Swords, Timer, Award, MessageSquare, Keyboard, Share2, X, Save } from 'lucide-react';
import { watchOrder, countEpisodes, type Phase, type WatchItem } from './data';

type EpisodeProgress = Record<string, boolean>;
type EpisodeJournal = Record<string, string>;

const STORAGE_KEY = 'arrowverse-progress';
const JOURNAL_KEY = 'arrowverse-journal';
const AVG_EPISODE_MINUTES = 42;

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

function loadJournal(): EpisodeJournal {
  try {
    const stored = localStorage.getItem(JOURNAL_KEY);
    return stored ? JSON.parse(stored) : {};
  } catch {
    return {};
  }
}

function saveJournal(journal: EpisodeJournal) {
  localStorage.setItem(JOURNAL_KEY, JSON.stringify(journal));
}

/** Build a set of item IDs that are crossovers or immediately precede one */
function buildCrossoverAlertSet(): Set<string> {
  const alerts = new Set<string>();
  for (const phase of watchOrder) {
    for (let i = 0; i < phase.items.length; i++) {
      const item = phase.items[i];
      if (item.series === 'Crossover') {
        alerts.add(item.id);
        // Mark 1-2 items before the crossover as "alert"
        if (i > 0) alerts.add(phase.items[i - 1].id);
        if (i > 1) alerts.add(phase.items[i - 2].id);
      }
    }
  }
  return alerts;
}

const crossoverAlertIds = buildCrossoverAlertSet();

/** Milestone definitions */
type Milestone = { id: string; label: string; check: (progress: EpisodeProgress) => boolean };

const milestones: Milestone[] = [
  { id: 'm-arrow-s1', label: 'Arrow Begins', check: (p) => !!p['y1-1'] },
  { id: 'm-flash-intro', label: 'Speed Force', check: (p) => !!p['y3-1'] },
  { id: 'm-first-crossover', label: 'First Crossover', check: (p) => !!p['y3-3'] },
  { id: 'm-legends', label: 'Time Traveler', check: (p) => !!p['y4-9'] },
  { id: 'm-supergirl', label: 'Girl of Steel', check: (p) => !!p['y4-3'] },
  { id: 'm-crisis-earth-x', label: 'Earth-X Survivor', check: (p) => !!p['y6-5'] },
  { id: 'm-elseworlds', label: 'Elseworlds', check: (p) => !!p['y7-4'] },
  { id: 'm-crisis', label: 'Crisis Survivor', check: (p) => !!p['y8-6'] },
  { id: 'm-arrow-finale', label: 'Goodbye Oliver', check: (p) => !!p['y8-7'] },
  { id: 'm-year-5', label: 'Halfway There', check: (p) => watchOrder.slice(0, 5).every(ph => ph.items.every(i => p[i.id])) },
  { id: 'm-complete', label: 'Arrowverse Complete', check: (p) => watchOrder.every(ph => ph.items.every(i => p[i.id])) },
];

function formatTime(totalMinutes: number): string {
  const hours = Math.floor(totalMinutes / 60);
  const mins = totalMinutes % 60;
  if (hours === 0) return `${mins}m`;
  return mins > 0 ? `${hours}h ${mins}m` : `${hours}h`;
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
  journalText,
  onJournalSave,
}: {
  item: WatchItem;
  checked: boolean;
  onToggle: (id: string) => void;
  journalText: string;
  onJournalSave: (id: string, text: string) => void;
}) {
  const [journalOpen, setJournalOpen] = useState(false);
  const [draft, setDraft] = useState(journalText);
  const isCrossoverAlert = crossoverAlertIds.has(item.id);
  const isCrossover = item.series === 'Crossover';

  return (
    <div className="space-y-0">
      <div
        className={`w-full flex items-start gap-3 p-3 rounded-lg text-left transition-colors ${
          checked
            ? 'bg-zinc-700/30 text-zinc-500'
            : 'bg-zinc-800/50 hover:bg-zinc-700/50 text-gray-100'
        } ${isCrossoverAlert && !isCrossover && !checked ? 'ring-1 ring-amber-500/30' : ''}`}
      >
        <button
          onClick={() => onToggle(item.id)}
          className="mt-0.5 flex-shrink-0"
        >
          <div
            className={`w-5 h-5 rounded border-2 flex items-center justify-center transition-colors ${
              checked
                ? 'bg-emerald-600 border-emerald-600'
                : 'border-zinc-500'
            }`}
          >
            {checked && <Check className="w-3 h-3 text-white" />}
          </div>
        </button>
        <button onClick={() => onToggle(item.id)} className="flex-1 min-w-0 text-left">
          <div className="flex items-center gap-2 flex-wrap">
            <span
              className={`px-2 py-0.5 text-xs font-semibold rounded ${getSeriesColor(
                item.series
              )} text-white`}
            >
              {item.series}
            </span>
            {isCrossoverAlert && !isCrossover && !checked && (
              <span className="px-1.5 py-0.5 text-[10px] font-bold rounded bg-amber-500/20 text-amber-400 flex items-center gap-1">
                <Swords className="w-3 h-3" />
                CROSSOVER AHEAD
              </span>
            )}
            <span className={`text-sm font-medium ${checked ? 'line-through' : ''}`}>
              {item.episodes}
            </span>
          </div>
          {item.notes && (
            <p className="text-xs text-zinc-400 mt-1">{item.notes}</p>
          )}
        </button>
        <button
          onClick={() => { setJournalOpen(!journalOpen); setDraft(journalText); }}
          className={`mt-0.5 flex-shrink-0 p-1 rounded hover:bg-zinc-600/50 transition-colors ${
            journalText ? 'text-blue-400' : 'text-zinc-600 hover:text-zinc-400'
          }`}
          title="Journal note"
        >
          <MessageSquare className="w-4 h-4" />
        </button>
      </div>
      {journalOpen && (
        <div className="ml-8 mr-2 mt-1 mb-1 flex gap-2">
          <textarea
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            placeholder="Your thoughts on this episode..."
            className="flex-1 bg-zinc-800 border border-zinc-600 rounded-md p-2 text-sm text-gray-200 placeholder-zinc-500 resize-none focus:outline-none focus:ring-1 focus:ring-blue-500"
            rows={2}
          />
          <div className="flex flex-col gap-1">
            <button
              onClick={() => { onJournalSave(item.id, draft); setJournalOpen(false); }}
              className="p-1.5 bg-blue-600 hover:bg-blue-500 rounded text-white"
              title="Save"
            >
              <Save className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => setJournalOpen(false)}
              className="p-1.5 bg-zinc-700 hover:bg-zinc-600 rounded text-zinc-300"
              title="Cancel"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

// --- Phase Card ---
function PhaseCard({
  phase,
  progress,
  onToggle,
  journal,
  onJournalSave,
}: {
  phase: Phase;
  progress: EpisodeProgress;
  onToggle: (id: string) => void;
  journal: EpisodeJournal;
  onJournalSave: (id: string, text: string) => void;
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
              journalText={journal[item.id] || ''}
              onJournalSave={onJournalSave}
            />
          ))}
        </div>
      )}
    </div>
  );
}

// --- Milestone Badge ---
function MilestoneBadge({ milestone, earned }: { milestone: Milestone; earned: boolean }) {
  return (
    <div
      className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium transition-all ${
        earned
          ? 'bg-amber-500/20 text-amber-300 ring-1 ring-amber-500/40'
          : 'bg-zinc-800 text-zinc-600'
      }`}
      title={milestone.label}
    >
      <Award className={`w-3.5 h-3.5 ${earned ? 'text-amber-400' : 'text-zinc-600'}`} />
      {milestone.label}
    </div>
  );
}

// --- Main App ---
export default function App() {
  const [progress, setProgress] = useState<EpisodeProgress>(loadProgress);
  const [journal, setJournal] = useState<EpisodeJournal>(loadJournal);
  const [seriesFilter, setSeriesFilter] = useState<string | null>(null);
  const [showActions, setShowActions] = useState(false);
  const [showMilestones, setShowMilestones] = useState(false);
  const [shareToast, setShareToast] = useState(false);
  const toastTimeout = useRef<ReturnType<typeof setTimeout>>();

  useEffect(() => {
    saveProgress(progress);
  }, [progress]);

  useEffect(() => {
    saveJournal(journal);
  }, [journal]);

  const toggleEpisode = useCallback((id: string) => {
    setProgress((prev) => {
      const next = { ...prev };
      next[id] = !next[id];
      return next;
    });
  }, []);

  const handleJournalSave = useCallback((id: string, text: string) => {
    setJournal((prev) => {
      const next = { ...prev };
      if (text.trim()) {
        next[id] = text.trim();
      } else {
        delete next[id];
      }
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

  // Watch time estimator
  const { remainingEpisodeCount, remainingMinutes } = useMemo(() => {
    let remaining = 0;
    for (const phase of watchOrder) {
      for (const item of phase.items) {
        if (!progress[item.id]) {
          remaining += countEpisodes(item.episodes);
        }
      }
    }
    return {
      remainingEpisodeCount: remaining,
      remainingMinutes: remaining * AVG_EPISODE_MINUTES,
    };
  }, [progress]);

  // Earned milestones
  const earnedMilestones = useMemo(
    () => milestones.filter((m) => m.check(progress)),
    [progress]
  );

  // Up Next
  const upNext = useMemo(() => {
    for (const phase of watchOrder) {
      for (const item of phase.items) {
        if (!progress[item.id]) return { phase, item };
      }
    }
    return null;
  }, [progress]);

  // Keyboard shortcut: Space to check off "Up Next"
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      // Don't trigger if user is typing in an input/textarea
      if (e.target instanceof HTMLTextAreaElement || e.target instanceof HTMLInputElement) return;
      if (e.code === 'Space' && upNext) {
        e.preventDefault();
        toggleEpisode(upNext.item.id);
      }
    }
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [upNext, toggleEpisode]);

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
    const blob = new Blob([JSON.stringify({ progress, journal }, null, 2)], {
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
          // Support both old format (flat progress) and new format ({ progress, journal })
          if (data.progress) {
            setProgress(data.progress);
            if (data.journal) setJournal(data.journal);
          } else {
            setProgress(data);
          }
        } catch {
          alert('Invalid progress file.');
        }
      };
      reader.readAsText(file);
    };
    input.click();
  };

  const handleShare = () => {
    const lines = [
      `Arrowverse Watch Tracker`,
      `${'='.repeat(30)}`,
      `Progress: ${completedItems}/${totalItems} items (${overallPct}%)`,
      `Episodes remaining: ~${remainingEpisodeCount} (~${formatTime(remainingMinutes)})`,
      `Badges earned: ${earnedMilestones.map((m) => m.label).join(', ') || 'None yet'}`,
      upNext ? `Up Next: ${upNext.item.series} - ${upNext.item.episodes}` : 'All done!',
    ];
    const text = lines.join('\n');
    navigator.clipboard.writeText(text).then(() => {
      setShareToast(true);
      if (toastTimeout.current) clearTimeout(toastTimeout.current);
      toastTimeout.current = setTimeout(() => setShareToast(false), 2000);
    });
  };

  return (
    <div className="min-h-screen bg-zinc-900 text-gray-100 p-4 sm:p-8">
      {/* Header */}
      <header className="max-w-4xl mx-auto mb-8">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
          <h1 className="text-3xl sm:text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-500">
            Arrowverse Watch Tracker
          </h1>
          <div className="flex items-center gap-2">
            <button
              onClick={handleShare}
              className="flex items-center gap-2 px-3 py-2 text-sm bg-zinc-700 hover:bg-zinc-600 rounded-lg transition-colors"
              title="Copy progress summary to clipboard"
            >
              <Share2 className="w-4 h-4" />
              Share
            </button>
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
        </div>

        {/* Overall progress bar + watch time */}
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
          <div className="flex items-center gap-1.5 mt-1.5 text-xs text-zinc-500">
            <Timer className="w-3.5 h-3.5" />
            <span>~{remainingEpisodeCount} episodes remaining (~{formatTime(remainingMinutes)})</span>
          </div>
        </div>

        {/* Up Next */}
        {upNext && (
          <div className="p-3 rounded-lg bg-zinc-800 border border-zinc-700/50 mb-4">
            <div className="flex justify-between items-center">
              <p className="text-xs text-zinc-400 uppercase tracking-wider mb-1">Up Next</p>
              <span className="text-[10px] text-zinc-600 flex items-center gap-1">
                <Keyboard className="w-3 h-3" /> Space to check off
              </span>
            </div>
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

        {/* Milestones */}
        <div className="mb-4">
          <button
            onClick={() => setShowMilestones(!showMilestones)}
            className="flex items-center gap-2 text-sm text-zinc-400 hover:text-zinc-200 transition-colors mb-2"
          >
            <Award className="w-4 h-4" />
            Milestones ({earnedMilestones.length}/{milestones.length})
            {showMilestones ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
          </button>
          {showMilestones && (
            <div className="flex flex-wrap gap-2">
              {milestones.map((m) => (
                <MilestoneBadge key={m.id} milestone={m} earned={m.check(progress)} />
              ))}
            </div>
          )}
        </div>

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
            journal={journal}
            onJournalSave={handleJournalSave}
          />
        ))}
      </main>

      {/* Share toast */}
      {shareToast && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 px-4 py-2 bg-emerald-600 text-white text-sm rounded-lg shadow-lg">
          Progress copied to clipboard!
        </div>
      )}
    </div>
  );
}
