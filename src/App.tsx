import React, { useState, useEffect, useMemo } from 'react';
import { CheckCircle2, Circle, ChevronDown, ChevronUp, Info, Play, Download, Upload, RotateCcw, FastForward, CheckSquare, Filter, Settings2 } from 'lucide-react';
import { watchOrder, Phase, WatchItem } from './data';
import { motion, AnimatePresence } from 'motion/react';

const parseEpisodes = (item: WatchItem) => {
  const eps: { id: string, label: string }[] = [];
  
  if (item.episodes === 'Armageddon') {
     for(let i=1; i<=5; i++) eps.push({ id: `${item.id}-e${i}`, label: `Part ${i}`});
     return eps;
  }

  const rangeMatch = item.episodes.match(/Season (\d+), Episodes (\d+)-(\d+)/);
  if (rangeMatch) {
    const s = rangeMatch[1];
    const start = parseInt(rangeMatch[2]);
    const end = parseInt(rangeMatch[3]);
    for (let i = start; i <= end; i++) {
      eps.push({ id: `${item.id}-s${s}e${i}`, label: `Ep ${i}` });
    }
    return eps;
  }

  if (item.series === 'Crossover' && item.notes) {
    const parts = item.notes.split(/,(?![^\(]*\))/);
    parts.forEach((p, i) => {
      let label = p.replace('Part', 'Pt').trim();
      if (label.length > 40) label = label.substring(0, 37) + '...';
      eps.push({ id: `${item.id}-p${i}`, label });
    });
    return eps;
  }

  if (item.episodes.includes('Season 3 & 4')) {
     eps.push({ id: `${item.id}-s3`, label: `Season 3` });
     eps.push({ id: `${item.id}-s4`, label: `Season 4` });
     return eps;
  }

  eps.push({ id: `${item.id}-all`, label: item.episodes.replace('Season ', 'S') });
  return eps;
};

export default function App() {
  const [completedItems, setCompletedItems] = useState<Set<string>>(new Set());
  const [expandedPhases, setExpandedPhases] = useState<Set<string>>(new Set([watchOrder[0].id]));
  const [hiddenSeries, setHiddenSeries] = useState<Set<string>>(new Set());
  const [showSettings, setShowSettings] = useState(false);

  const allSeries = useMemo(() => {
    const seriesSet = new Set<string>();
    watchOrder.forEach(phase => {
      phase.items.forEach(item => seriesSet.add(item.series));
    });
    return Array.from(seriesSet).sort();
  }, []);

  const filteredWatchOrder = useMemo(() => {
    return watchOrder.map(phase => ({
      ...phase,
      items: phase.items.filter(item => !hiddenSeries.has(item.series))
    })).filter(phase => phase.items.length > 0);
  }, [hiddenSeries]);

  useEffect(() => {
    const savedProgress = localStorage.getItem('arrowverse-progress');
    if (savedProgress) {
      try {
        const parsed = JSON.parse(savedProgress);
        const newSet = new Set<string>();
        let needsMigration = false;

        parsed.forEach((id: string) => {
          if (id.includes('-s') || id.includes('-p') || id.includes('-e') || id.includes('-all')) {
            newSet.add(id);
          } else {
            needsMigration = true;
            const item = watchOrder.flatMap(p => p.items).find(i => i.id === id);
            if (item) {
              parseEpisodes(item).forEach(ep => newSet.add(ep.id));
            }
          }
        });

        setCompletedItems(newSet);
        if (needsMigration) {
          localStorage.setItem('arrowverse-progress', JSON.stringify(Array.from(newSet)));
        }
      } catch (e) {
        console.error('Failed to load progress', e);
      }
    }
    const savedFilters = localStorage.getItem('arrowverse-filters');
    if (savedFilters) {
      try {
        setHiddenSeries(new Set(JSON.parse(savedFilters)));
      } catch (e) {
        console.error('Failed to load filters', e);
      }
    }
  }, []);

  const toggleEpisode = (id: string) => {
    setCompletedItems(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      localStorage.setItem('arrowverse-progress', JSON.stringify(Array.from(next)));
      return next;
    });
  };

  const toggleBlock = (itemId: string, eps: {id: string}[]) => {
    setCompletedItems(prev => {
      const next = new Set(prev);
      const allCompleted = eps.every(ep => next.has(ep.id));
      if (allCompleted) {
        eps.forEach(ep => next.delete(ep.id));
      } else {
        eps.forEach(ep => next.add(ep.id));
      }
      localStorage.setItem('arrowverse-progress', JSON.stringify(Array.from(next)));
      return next;
    });
  };

  const togglePhase = (id: string) => {
    setExpandedPhases(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const toggleSeriesFilter = (series: string) => {
    setHiddenSeries(prev => {
      const next = new Set(prev);
      if (next.has(series)) next.delete(series);
      else next.add(series);
      localStorage.setItem('arrowverse-filters', JSON.stringify(Array.from(next)));
      return next;
    });
  };

  const markPhaseComplete = (phaseId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const phase = filteredWatchOrder.find(p => p.id === phaseId);
    if (!phase) return;
    
    setCompletedItems(prev => {
      const next = new Set(prev);
      const allEps = phase.items.flatMap(item => parseEpisodes(item));
      const allCompleted = allEps.every(ep => next.has(ep.id));
      
      if (allCompleted) {
        allEps.forEach(ep => next.delete(ep.id));
      } else {
        allEps.forEach(ep => next.add(ep.id));
      }
      localStorage.setItem('arrowverse-progress', JSON.stringify(Array.from(next)));
      return next;
    });
  };

  const scrollToPhase = (id: string) => {
    setExpandedPhases(prev => {
      const next = new Set(prev);
      next.add(id);
      return next;
    });
    setTimeout(() => {
      const element = document.getElementById(id);
      if (element) {
        // Adjust offset for mobile sticky header
        const offset = window.innerWidth < 1024 ? 140 : 100;
        const y = element.getBoundingClientRect().top + window.scrollY - offset;
        window.scrollTo({ top: y, behavior: 'smooth' });
      }
    }, 100);
  };

  const jumpToCurrent = () => {
    for (const phase of filteredWatchOrder) {
      for (const item of phase.items) {
        const eps = parseEpisodes(item);
        for (const ep of eps) {
          if (!completedItems.has(ep.id)) {
            scrollToPhase(phase.id);
            return;
          }
        }
      }
    }
  };

  const exportProgress = () => {
    const data = JSON.stringify(Array.from(completedItems));
    navigator.clipboard.writeText(data).then(() => {
      alert('Progress copied to clipboard! Save this text somewhere safe.');
    }).catch(() => {
      alert('Failed to copy to clipboard. Please try again.');
    });
  };

  const importProgress = () => {
    const data = prompt('Paste your exported progress code here:');
    if (data) {
      try {
        const parsed = JSON.parse(data);
        if (Array.isArray(parsed)) {
          setCompletedItems(new Set(parsed));
          localStorage.setItem('arrowverse-progress', JSON.stringify(parsed));
        }
      } catch (e) {
        alert('Invalid progress code.');
      }
    }
  };

  const resetProgress = () => {
    if (window.confirm('Are you sure you want to reset all your progress? This cannot be undone.')) {
      setCompletedItems(new Set());
      localStorage.removeItem('arrowverse-progress');
    }
  };

  const getSeriesColor = (series: string) => {
    switch (series) {
      case 'Arrow': return 'text-green-500 bg-green-500/10 border-green-500/20';
      case 'The Flash': return 'text-red-500 bg-red-500/10 border-red-500/20';
      case 'Supergirl': return 'text-blue-500 bg-blue-500/10 border-blue-500/20';
      case 'Legends of Tomorrow': return 'text-yellow-500 bg-yellow-500/10 border-yellow-500/20';
      case 'Batwoman': return 'text-red-600 bg-red-600/10 border-red-600/20';
      case 'Black Lightning': return 'text-purple-500 bg-purple-500/10 border-purple-500/20';
      case 'Superman & Lois': return 'text-blue-600 bg-blue-600/10 border-blue-600/20';
      case 'Constantine': return 'text-orange-500 bg-orange-500/10 border-orange-500/20';
      case 'Crossover': return 'text-indigo-400 bg-indigo-500/10 border-indigo-500/20 font-bold';
      default: return 'text-gray-400 bg-gray-500/10 border-gray-500/20';
    }
  };

  const { totalEps, completedEps } = useMemo(() => {
    let t = 0;
    let c = 0;
    filteredWatchOrder.forEach(phase => {
      phase.items.forEach(item => {
        const eps = parseEpisodes(item);
        t += eps.length;
        c += eps.filter(ep => completedItems.has(ep.id)).length;
      });
    });
    return { totalEps: t, completedEps: c };
  }, [filteredWatchOrder, completedItems]);

  const progressPercent = totalEps === 0 ? 0 : Math.round((completedEps / totalEps) * 100);

  const nextToWatch = useMemo(() => {
    for (const phase of filteredWatchOrder) {
      for (const item of phase.items) {
        const eps = parseEpisodes(item);
        for (const ep of eps) {
          if (!completedItems.has(ep.id)) {
            return { phase, item, ep };
          }
        }
      }
    }
    return null;
  }, [filteredWatchOrder, completedItems]);

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-50 font-sans selection:bg-indigo-500/30 pb-24">
      {/* Background ambient glow */}
      <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-indigo-900/20 blur-[120px]" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-purple-900/20 blur-[120px]" />
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 lg:pt-12 relative z-10">
        <header className="mb-8 lg:mb-12">
          <div className="text-center mb-8">
            <motion.h1 
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-3xl sm:text-4xl md:text-5xl font-black tracking-tight mb-3 bg-gradient-to-r from-green-400 via-red-500 to-blue-500 text-transparent bg-clip-text"
            >
              Arrowverse Tracker
            </motion.h1>
            <motion.p 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.1 }}
              className="text-zinc-400 text-sm sm:text-base max-w-2xl mx-auto px-4"
            >
              The ultimate chronological viewing order. Track your progress so you never miss a crossover.
            </motion.p>
          </div>
          
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2 }}
            className="bg-zinc-900/80 backdrop-blur-xl rounded-3xl p-5 sm:p-6 border border-zinc-800/80 shadow-2xl max-w-3xl mx-auto"
          >
            {/* Progress Bar */}
            <div className="mb-6">
              <div className="flex justify-between items-end mb-3">
                <span className="text-sm font-semibold text-zinc-400 uppercase tracking-wider">Progress</span>
                <span className="text-2xl font-black text-zinc-100">{progressPercent}%</span>
              </div>
              <div className="w-full bg-zinc-950 rounded-full h-4 overflow-hidden p-0.5 border border-zinc-800/50">
                <motion.div 
                  className="bg-gradient-to-r from-indigo-500 to-purple-500 h-full rounded-full relative overflow-hidden"
                  initial={{ width: 0 }}
                  animate={{ width: `${progressPercent}%` }}
                  transition={{ duration: 0.7, ease: "easeOut" }}
                >
                  <div className="absolute inset-0 bg-white/20 w-full h-full animate-[shimmer_2s_infinite]" style={{ backgroundImage: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.3), transparent)', transform: 'skewX(-20deg)' }} />
                </motion.div>
              </div>
            </div>

            {/* Up Next Widget */}
            {nextToWatch && (
              <motion.div 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="mb-6 bg-gradient-to-br from-indigo-500/10 to-purple-500/10 border border-indigo-500/20 rounded-2xl p-4 sm:p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
              >
                <div className="flex-1 min-w-0">
                  <h3 className="text-indigo-400 font-bold text-[10px] sm:text-xs tracking-widest mb-2 uppercase flex items-center gap-1.5">
                    <Play className="w-3 h-3 fill-current" /> Up Next
                  </h3>
                  <div className="flex flex-wrap items-center gap-2 mb-1.5">
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md border ${getSeriesColor(nextToWatch.item.series)}`}>
                      {nextToWatch.item.series}
                    </span>
                    <span className="text-zinc-400 text-xs sm:text-sm truncate">{nextToWatch.phase.phase}</span>
                  </div>
                  <p className="text-lg sm:text-xl font-bold text-zinc-100 truncate">{nextToWatch.ep.label}</p>
                </div>
                <button 
                  onClick={() => toggleEpisode(nextToWatch.ep.id)} 
                  className="w-full sm:w-auto flex items-center justify-center gap-2 bg-indigo-500 hover:bg-indigo-600 active:scale-95 text-white px-6 py-3 sm:py-2.5 rounded-xl font-semibold transition-all shadow-lg shadow-indigo-500/25 min-h-[48px] sm:min-h-[44px]"
                >
                  <CheckCircle2 className="w-5 h-5" />
                  <span>Mark Watched</span>
                </button>
              </motion.div>
            )}

            {/* Mobile-friendly horizontal scroll for filters & actions */}
            <div className="pt-4 border-t border-zinc-800/50">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <Filter className="w-4 h-4 text-zinc-400" />
                  <span className="text-sm font-semibold text-zinc-300">Filters</span>
                </div>
                <button 
                  onClick={() => setShowSettings(!showSettings)}
                  className="flex items-center gap-1.5 text-xs font-medium text-zinc-400 hover:text-zinc-200 bg-zinc-800/50 px-3 py-1.5 rounded-lg transition-colors"
                >
                  <Settings2 className="w-3.5 h-3.5" />
                  {showSettings ? 'Hide Actions' : 'More Actions'}
                </button>
              </div>
              
              <div className="flex overflow-x-auto snap-x gap-2 pb-2 -mx-2 px-2 sm:mx-0 sm:px-0 scrollbar-hide">
                {allSeries.map(series => {
                  const isHidden = hiddenSeries.has(series);
                  return (
                    <button
                      key={series}
                      onClick={() => toggleSeriesFilter(series)}
                      className={`snap-start flex-shrink-0 px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold border transition-all active:scale-95 min-h-[40px] ${
                        isHidden 
                          ? 'bg-zinc-900 border-zinc-800 text-zinc-500 hover:bg-zinc-800' 
                          : getSeriesColor(series)
                      }`}
                    >
                      {series}
                    </button>
                  );
                })}
              </div>

              <AnimatePresence>
                {showSettings && (
                  <motion.div 
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="overflow-hidden"
                  >
                    <div className="flex overflow-x-auto snap-x gap-2 pt-3 pb-1 -mx-2 px-2 sm:mx-0 sm:px-0 scrollbar-hide">
                      <button onClick={jumpToCurrent} className="snap-start flex-shrink-0 flex items-center gap-2 px-4 py-2 bg-indigo-500/10 text-indigo-400 hover:bg-indigo-500/20 rounded-xl font-semibold transition-colors border border-indigo-500/20 text-xs sm:text-sm min-h-[40px] active:scale-95">
                        <FastForward className="w-4 h-4" /> Jump to Current
                      </button>
                      <button onClick={exportProgress} className="snap-start flex-shrink-0 flex items-center gap-2 px-4 py-2 bg-zinc-800 text-zinc-300 hover:bg-zinc-700 rounded-xl font-semibold transition-colors border border-zinc-700 text-xs sm:text-sm min-h-[40px] active:scale-95">
                        <Download className="w-4 h-4" /> Export
                      </button>
                      <button onClick={importProgress} className="snap-start flex-shrink-0 flex items-center gap-2 px-4 py-2 bg-zinc-800 text-zinc-300 hover:bg-zinc-700 rounded-xl font-semibold transition-colors border border-zinc-700 text-xs sm:text-sm min-h-[40px] active:scale-95">
                        <Upload className="w-4 h-4" /> Import
                      </button>
                      <button onClick={resetProgress} className="snap-start flex-shrink-0 flex items-center gap-2 px-4 py-2 bg-red-500/10 text-red-400 hover:bg-red-500/20 rounded-xl font-semibold transition-colors border border-red-500/20 text-xs sm:text-sm min-h-[40px] active:scale-95">
                        <RotateCcw className="w-4 h-4" /> Reset
                      </button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </motion.div>
        </header>

        <div className="flex flex-col lg:flex-row gap-6 lg:gap-8 items-start relative">
          {/* Mobile-first Sticky Navigation */}
          <aside className="w-full lg:w-72 flex-shrink-0 sticky top-0 lg:top-6 z-40 bg-zinc-950/90 lg:bg-transparent backdrop-blur-xl lg:backdrop-blur-none border-b lg:border-none border-zinc-800/50 -mx-4 px-4 py-3 lg:mx-0 lg:p-0 mb-2 lg:mb-0">
            <div className="lg:bg-zinc-900/80 lg:backdrop-blur-xl lg:border lg:border-zinc-800/80 lg:rounded-3xl lg:p-5 lg:shadow-2xl">
              <h3 className="text-lg font-black mb-4 text-zinc-100 hidden lg:block px-2">Phases</h3>
              <nav className="flex lg:flex-col gap-2 overflow-x-auto snap-x pb-1 lg:pb-0 scrollbar-hide">
                {filteredWatchOrder.map(phase => {
                  const allEps = phase.items.flatMap(item => parseEpisodes(item));
                  const phaseCompleted = allEps.filter(ep => completedItems.has(ep.id)).length;
                  const isAllCompleted = phaseCompleted === allEps.length && allEps.length > 0;
                  return (
                    <button
                      key={`nav-${phase.id}`}
                      onClick={() => scrollToPhase(phase.id)}
                      className={`snap-start flex-shrink-0 text-left px-4 py-2.5 lg:py-3 rounded-xl text-sm font-semibold whitespace-nowrap transition-all flex items-center justify-between min-h-[44px] active:scale-95 ${
                        isAllCompleted 
                          ? 'bg-indigo-500/10 text-indigo-400 border border-indigo-500/20' 
                          : 'bg-zinc-900 lg:bg-transparent border border-zinc-800 lg:border-transparent text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800'
                      }`}
                    >
                      <span>{phase.phase}</span>
                      {isAllCompleted && <CheckCircle2 className="w-4 h-4 ml-3 flex-shrink-0" />}
                    </button>
                  );
                })}
              </nav>
            </div>
          </aside>

          {/* Main Content */}
          <main className="flex-1 w-full min-w-0">
            <div className="space-y-4 sm:space-y-6">
              <AnimatePresence>
                {filteredWatchOrder.map((phase, index) => {
                  const isExpanded = expandedPhases.has(phase.id);
                  const allEps = phase.items.flatMap(item => parseEpisodes(item));
                  const phaseCompleted = allEps.filter(ep => completedItems.has(ep.id)).length;
                  const phaseTotal = allEps.length;
                  const isAllCompleted = phaseCompleted === phaseTotal && phaseTotal > 0;
                  
                  const seenSeasons = new Set<string>();

                  return (
                    <motion.div 
                      layout
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      id={phase.id} 
                      key={phase.id} 
                      className="bg-zinc-900/80 backdrop-blur-sm border border-zinc-800/80 rounded-3xl overflow-hidden shadow-xl scroll-mt-24 lg:scroll-mt-8"
                    >
                      <div 
                        onClick={() => togglePhase(phase.id)}
                        className="w-full px-4 sm:px-6 py-4 sm:py-5 flex items-center justify-between hover:bg-zinc-800/50 transition-colors cursor-pointer select-none min-h-[72px]"
                      >
                        <div className="flex items-center gap-3 sm:gap-4">
                          <div className={`flex items-center justify-center w-10 h-10 rounded-2xl border-2 transition-colors flex-shrink-0 ${isAllCompleted ? 'bg-indigo-500/20 border-indigo-500 text-indigo-400' : 'bg-zinc-950 border-zinc-800 text-zinc-500'}`}>
                            <span className="text-sm font-black">{index + 1}</span>
                          </div>
                          <div>
                            <h2 className="text-lg sm:text-xl font-black text-zinc-100 leading-tight">{phase.phase}</h2>
                            <p className="text-xs sm:text-sm font-medium text-zinc-500 mt-0.5">{phaseCompleted} / {phaseTotal} eps</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-1 sm:gap-2">
                          <button 
                            onClick={(e) => markPhaseComplete(phase.id, e)}
                            className={`p-3 rounded-xl transition-all active:scale-90 ${isAllCompleted ? 'text-indigo-400 bg-indigo-500/10 hover:bg-indigo-500/20' : 'text-zinc-500 hover:bg-zinc-800 hover:text-zinc-300'}`}
                            title={isAllCompleted ? "Mark Phase Unwatched" : "Mark Phase Complete"}
                          >
                            <CheckSquare className="w-6 h-6" />
                          </button>
                          <div className="p-2 text-zinc-500">
                            {isExpanded ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
                          </div>
                        </div>
                      </div>

                      <AnimatePresence initial={false}>
                        {isExpanded && (
                          <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: 'auto', opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            transition={{ duration: 0.3, ease: "easeInOut" }}
                            className="overflow-hidden"
                          >
                            <div className="px-3 sm:px-6 pb-4 sm:pb-6 pt-2">
                              <div className="space-y-3 sm:space-y-4">
                                {phase.items.map((item) => {
                                  const eps = parseEpisodes(item);
                                  const itemCompletedCount = eps.filter(ep => completedItems.has(ep.id)).length;
                                  const isItemAllCompleted = itemCompletedCount === eps.length;
                                  
                                  let showTrailer = false;
                                  let trailerUrl = "";
                                  const seasonMatch = item.episodes.match(/Season \d+/);
                                  
                                  if (seasonMatch) {
                                    const seasonKey = `${item.series}-${seasonMatch[0]}`;
                                    if (!seenSeasons.has(seasonKey)) {
                                      seenSeasons.add(seasonKey);
                                      showTrailer = true;
                                      trailerUrl = `https://www.youtube.com/results?search_query=${encodeURIComponent(`${item.series} ${seasonMatch[0]} trailer`)}`;
                                    }
                                  } else if (item.series === 'Crossover') {
                                    const crossoverKey = `Crossover-${item.episodes}`;
                                    if (!seenSeasons.has(crossoverKey)) {
                                      seenSeasons.add(crossoverKey);
                                      showTrailer = true;
                                      trailerUrl = `https://www.youtube.com/results?search_query=${encodeURIComponent(`Arrowverse ${item.episodes} crossover trailer`)}`;
                                    }
                                  }

                                  return (
                                    <motion.div 
                                      layout
                                      key={item.id}
                                      className={`group p-4 sm:p-5 rounded-2xl border transition-all ${
                                        isItemAllCompleted 
                                          ? 'bg-zinc-950/50 border-zinc-800/50 opacity-75' 
                                          : 'bg-zinc-950/80 border-zinc-800 shadow-lg'
                                      }`}
                                    >
                                      <div className="flex items-start justify-between mb-4 gap-3">
                                        <div className="flex-1 min-w-0">
                                          <div className="flex flex-wrap items-center gap-2 mb-2">
                                            <span className={`text-[10px] sm:text-xs font-bold px-2 py-1 rounded-md border ${getSeriesColor(item.series)}`}>
                                              {item.series}
                                            </span>
                                          </div>
                                          <h3 className={`text-base sm:text-lg font-bold leading-tight ${isItemAllCompleted ? 'text-zinc-500 line-through' : 'text-zinc-100'}`}>
                                            {item.episodes}
                                          </h3>
                                          {item.notes && (
                                            <div className="flex items-start gap-2 mt-2 text-xs sm:text-sm font-medium text-zinc-500 bg-zinc-900/50 p-2.5 rounded-xl">
                                              <Info className="w-4 h-4 mt-0.5 flex-shrink-0 text-zinc-400" />
                                              <p className="leading-snug">{item.notes}</p>
                                            </div>
                                          )}
                                          {showTrailer && (
                                            <div className="mt-3">
                                              <a
                                                href={trailerUrl}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="inline-flex items-center justify-center w-full sm:w-auto gap-2 px-4 py-2.5 bg-red-500/10 text-red-400 hover:bg-red-500/20 hover:text-red-300 rounded-xl text-sm font-bold transition-colors border border-red-500/20 active:scale-95 min-h-[44px]"
                                              >
                                                <Play className="w-4 h-4 fill-current" />
                                                Watch Trailer
                                              </a>
                                            </div>
                                          )}
                                        </div>
                                        <button 
                                          onClick={() => toggleBlock(item.id, eps)} 
                                          className="text-zinc-500 hover:text-zinc-300 p-2 -mr-2 -mt-2 transition-all active:scale-90 flex-shrink-0"
                                          title={isItemAllCompleted ? "Mark Block Unwatched" : "Mark Block Complete"}
                                        >
                                          {isItemAllCompleted ? <CheckCircle2 className="w-7 h-7 text-indigo-500" /> : <CheckSquare className="w-7 h-7" />}
                                        </button>
                                      </div>
                                      
                                      <div className="flex flex-wrap gap-2">
                                        {eps.map(ep => {
                                          const isEpCompleted = completedItems.has(ep.id);
                                          return (
                                            <button
                                              key={ep.id}
                                              onClick={() => toggleEpisode(ep.id)}
                                              className={`flex-grow sm:flex-grow-0 px-4 py-2.5 text-xs sm:text-sm font-bold rounded-xl border transition-all active:scale-95 min-h-[44px] flex items-center justify-center ${
                                                isEpCompleted 
                                                  ? 'bg-indigo-500/10 border-indigo-500/30 text-indigo-400' 
                                                  : 'bg-zinc-900 border-zinc-700 text-zinc-300 hover:bg-zinc-800 hover:text-zinc-100 shadow-sm'
                                              }`}
                                            >
                                              {ep.label}
                                            </button>
                                          );
                                        })}
                                      </div>
                                    </motion.div>
                                  );
                                })}
                              </div>
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </motion.div>
                  );
                })}
              </AnimatePresence>
              
              {filteredWatchOrder.length === 0 && (
                <div className="text-center py-16 bg-zinc-900/80 backdrop-blur-sm border border-zinc-800/80 rounded-3xl">
                  <p className="text-zinc-400 font-medium mb-4">All series are currently filtered out.</p>
                  <button 
                    onClick={() => setHiddenSeries(new Set())}
                    className="px-6 py-3 bg-zinc-800 hover:bg-zinc-700 text-zinc-100 rounded-xl text-sm font-bold transition-colors active:scale-95 min-h-[44px]"
                  >
                    Clear Filters
                  </button>
                </div>
              )}
            </div>
            
            <footer className="mt-12 mb-8 text-center text-zinc-500 text-xs sm:text-sm font-medium px-4">
              <p>This watch order groups episodes into logical blocks to minimize switching between series while keeping you in sync for crossovers.</p>
            </footer>
          </main>
        </div>
      </div>
    </div>
  );
}
