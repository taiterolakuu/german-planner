import React, { memo, useMemo, useState, useEffect, useRef } from 'react';

// Мемоизированные SVG иконки
export const Icons = {
  Tasks: memo(() => (
    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
    </svg>
  )),
  Dictionary: memo(() => (
    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
    </svg>
  )),
  Profile: memo(() => (
    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
    </svg>
  )),
  Close: memo(() => (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
    </svg>
  )),
  Check: memo(() => (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
    </svg>
  )),
  Download: memo(() => (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
    </svg>
  )),
  Upload: memo(() => (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M9 19l3 3m0 0l3-3m-3 3V10" />
    </svg>
  )),
  Backup: memo(() => (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4" />
    </svg>
  )),
  Restore: memo(() => (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
    </svg>
  )),
  Trash: memo(() => (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
    </svg>
  )),
  Cloud: memo(() => (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 15a4 4 0 004 4h9a5 5 0 10-.1-9.999 5.002 5.002 0 10-9.78 2.096A4 4 0 003 15z" />
    </svg>
  ))
};

// Константы для level names
export const LEVEL_NAMES = {
  1: "Beginner",
  2: "Schwätzer",
  3: "Unterhalter",
  4: "Experte",
  5: "Meister"
};

// Experience Bar Component
export const ExperienceBar = memo(({ xp, level, showLevelUp }) => {
  const xpForNextLevel = level * 100;
  const progress = Math.min((xp / xpForNextLevel) * 100, 100);

  const gradientClass =
    level >= 5
      ? 'from-amber-400 to-emerald-500'
      : level >= 3
      ? 'from-indigo-400 to-violet-500'
      : 'from-sf-blue to-indigo-400';

  const levelIcon =
    level >= 5 ? '👑' : level >= 3 ? '🚀' : '🎯';

  const [burstId, setBurstId] = useState(0);
  const prevXpRef = useRef(xp);

  useEffect(() => {
    if (xp > prevXpRef.current) {
      setBurstId((id) => id + 1);
    }
    prevXpRef.current = xp;
  }, [xp]);

  return (
    <div className="sticky top-0 z-50 w-full">
      {showLevelUp && (
        <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-xl animate-fadeIn">
          <div className="glass-card-2 p-8 rounded-3xl text-center max-w-sm mx-4">
            <div className="text-6xl mb-4">🎉</div>
            <h2 className="text-2xl font-bold mb-2">Level Up!</h2>
            <p className="text-lg mb-4">You've reached <span className="font-bold text-sf-blue">Level {level}</span></p>
            <p className="text-3xl font-bold text-sf-blue">{LEVEL_NAMES[level] || "Advanced"}</p>
          </div>
        </div>
      )}
      
      <div className="glass-header px-6 py-4">
        <div className="flex justify-between items-center mb-2">
          <div>
            <span className="text-sm font-medium opacity-75 flex items-center gap-1">
              <span>{levelIcon}</span>
              <span>Level {level}</span>
            </span>
            <h1 className="text-2xl font-bold">{LEVEL_NAMES[level] || "Advanced"}</h1>
          </div>
          <div className="text-right">
            <span className="text-sm font-medium opacity-75">XP</span>
            <div className="text-xl font-bold">{xp}<span className="text-sm opacity-75">/{xpForNextLevel}</span></div>
          </div>
        </div>
        
        <div className="relative h-3 bg-black/10 dark:bg-white/10 rounded-full overflow-hidden shadow-inner-glow">
          <div
            className={`h-full bg-gradient-to-r ${gradientClass} transition-all duration-500 ease-out`}
            style={{ width: `${progress}%` }}
          />
          <div key={burstId} className="xp-particles pointer-events-none">
            <span className="xp-particle" />
            <span className="xp-particle" />
            <span className="xp-particle" />
          </div>
        </div>
        <div className="text-xs mt-1 opacity-60 text-center">Complete tasks to earn XP</div>
      </div>
    </div>
  );
});

// Confirm Modal Component
export const ConfirmModal = memo(({ isOpen, title, message, onConfirm, onCancel }) => {
  if (!isOpen) return null;
  
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-xl animate-fadeIn">
      <div className="glass-card p-6 rounded-2xl max-w-sm mx-4">
        <h3 className="text-xl font-bold mb-2">{title}</h3>
        <p className="mb-6 opacity-75">{message}</p>
        <div className="flex gap-3">
          <button
            onClick={onCancel}
            className="flex-1 py-3 rounded-xl bg-gray-500/20 hover:bg-gray-500/30 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className="flex-1 py-3 rounded-xl bg-red-500 hover:bg-red-600 text-white transition-colors"
          >
            Confirm
          </button>
        </div>
      </div>
    </div>
  );
});

// Bottom Navigation Component
export const BottomNavigation = memo(({ activeTab, setActiveTab }) => {
  const tabs = useMemo(
    () => [
      { id: 'tasks', label: 'Tasks', Icon: Icons.Tasks },
      { id: 'dictionary', label: 'Words', Icon: Icons.Dictionary },
      { id: 'profile', label: 'Stats', Icon: Icons.Profile }
    ],
    []
  );

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-60 glass-nav border-t border-white/20 dark:border-slate-700/60">
      <div className="max-w-2xl mx-auto px-4 py-2">
        <div className="flex items-center justify-between gap-2 rounded-3xl bg-gradient-glass dark:bg-gradient-glass-dark shadow-glass-light px-2 py-1">
          {tabs.map((tab) => {
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex-1 flex flex-col items-center gap-1 py-1.5 rounded-2xl transition-all duration-200 ${
                  isActive
                    ? 'text-sf-blue bg-white/80 dark:bg-slate-900/70 shadow-glass-light'
                    : 'text-slate-600 dark:text-slate-300/80 hover:text-sf-blue/90'
                }`}
                aria-current={isActive ? 'page' : undefined}
              >
                <div
                  className={`flex items-center justify-center w-9 h-9 rounded-2xl transition-transform duration-150 ${
                    isActive ? 'scale-105' : 'scale-95'
                  }`}
                >
                  <tab.Icon />
                </div>
                <span className="text-2xs font-medium tracking-wide">
                  {tab.label}
                </span>
                <span
                  className={`mt-0.5 h-0.5 w-6 rounded-full bg-sf-blue transition-all duration-200 ${
                    isActive ? 'opacity-100 scale-100' : 'opacity-0 scale-50'
                  }`}
                />
              </button>
            );
          })}
        </div>
      </div>
    </nav>
  );
});

// Hook for animated numbers
const useAnimatedNumber = (value, duration = 400) => {
  const [display, setDisplay] = useState(value);

  useEffect(() => {
    let frame;
    const start = performance.now();
    const from = display;
    const delta = value - from;

    const animate = (time) => {
      const progress = Math.min((time - start) / duration, 1);
      setDisplay(from + delta * progress);
      if (progress < 1) {
        frame = requestAnimationFrame(animate);
      }
    };

    frame = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(frame);
  }, [value]);

  return Math.round(display);
};

// Stats Grid Component
export const StatsGrid = memo(({ level, xp, completedTasks, totalWords }) => {
  const animLevel = useAnimatedNumber(level);
  const animXp = useAnimatedNumber(xp);
  const animCompleted = useAnimatedNumber(completedTasks);
  const animWords = useAnimatedNumber(totalWords);

  return (
    <div className="grid grid-cols-2 gap-4">
      <div className="glass-card-2 p-4 rounded-xl text-center">
        <div className="text-3xl font-bold text-sf-blue transition-all duration-200">
          {animLevel}
        </div>
        <div className="text-sm opacity-75">Level</div>
      </div>
      <div className="glass-card-2 p-4 rounded-xl text-center">
        <div className="text-3xl font-bold text-sf-blue transition-all duration-200">
          {animXp}
        </div>
        <div className="text-sm opacity-75">Total XP</div>
      </div>
      <div className="glass-card-2 p-4 rounded-xl text-center">
        <div className="text-3xl font-bold text-sf-blue transition-all duration-200">
          {animCompleted}
        </div>
        <div className="text-sm opacity-75">Tasks Done</div>
      </div>
      <div className="glass-card-2 p-4 rounded-xl text-center">
        <div className="text-3xl font-bold text-sf-blue transition-all duration-200">
          {animWords}
        </div>
        <div className="text-sm opacity-75">Words Learned</div>
      </div>
    </div>
  );
});

