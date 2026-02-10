import React, { useState, useCallback, memo } from 'react';
import { Icons, StatsGrid } from './uiComponents';

// Backup Manager Component
export const BackupManager = memo(({ backups, onRestore, onCreateBackup, onDeleteBackup }) => {
  const [showManager, setShowManager] = useState(false);

  const handleExport = useCallback(() => {
    const data = {
      tasks: JSON.parse(localStorage.getItem('plannerTasks') || '[]'),
      dictionary: JSON.parse(localStorage.getItem('germanDictionary') || '[]'),
      xp: parseInt(localStorage.getItem('userXp') || '0'),
      level: parseInt(localStorage.getItem('userLevel') || '1'),
      darkMode: JSON.parse(localStorage.getItem('darkMode') || 'true'),
      exportDate: new Date().toISOString()
    };
    
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `german-planner-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  }, []);

  const handleImport = useCallback((event) => {
    const file = event.target.files[0];
    if (!file) return;
    
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = JSON.parse(e.target.result);
        if (window.confirm('Import this data? Current data will be replaced.')) {
          if (data.tasks) localStorage.setItem('plannerTasks', JSON.stringify(data.tasks));
          if (data.dictionary) localStorage.setItem('germanDictionary', JSON.stringify(data.dictionary));
          if (data.xp) localStorage.setItem('userXp', data.xp.toString());
          if (data.level) localStorage.setItem('userLevel', data.level.toString());
          if (data.darkMode !== undefined) localStorage.setItem('darkMode', JSON.stringify(data.darkMode));
          
          alert('Data imported successfully! Page will reload.');
          window.location.reload();
        }
      } catch (error) {
        alert('Error importing file. Invalid format.');
      }
      event.target.value = '';
    };
    reader.readAsText(file);
  }, []);

  return (
    <div className="mb-6">
      <button
        onClick={() => setShowManager(!showManager)}
        className="w-full glass-card p-4 rounded-xl text-left hover:bg-white/10 dark:hover:bg-white/5 transition-colors"
        aria-expanded={showManager}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-sf-blue/20">
              <Icons.Cloud />
            </div>
            <div>
              <h3 className="font-bold">Data Backup & Restore</h3>
              <p className="text-sm opacity-75">
                {backups.length} backup{backups.length !== 1 ? 's' : ''} available
              </p>
            </div>
          </div>
          <svg 
            className={`w-5 h-5 transition-transform ${showManager ? 'rotate-180' : ''}`} 
            fill="none" 
            stroke="currentColor" 
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </div>
      </button>

      {showManager && (
        <div className="glass-card-2 mt-2 p-4 rounded-xl space-y-4 animate-fadeIn">
          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={onCreateBackup}
              className="flex items-center justify-center gap-2 py-3 rounded-lg bg-green-500 hover:bg-green-600 text-white font-medium transition-colors"
            >
              <Icons.Backup />
              Create Backup
            </button>
            
            <button
              onClick={handleExport}
              className="flex items-center justify-center gap-2 py-3 rounded-lg bg-blue-500 hover:bg-blue-600 text-white font-medium transition-colors"
            >
              <Icons.Download />
              Export to File
            </button>
          </div>

          {/* File Import */}
          <div className="relative">
            <input
              type="file"
              accept=".json"
              onChange={handleImport}
              className="hidden"
              id="import-file"
            />
            <label
              htmlFor="import-file"
              className="flex items-center justify-center gap-2 w-full py-3 rounded-lg bg-purple-500 hover:bg-purple-600 text-white font-medium cursor-pointer"
            >
              <Icons.Upload />
              Import from File
            </label>
          </div>

          {/* Backup List */}
          {backups.length > 0 && (
            <div className="mt-4">
              <h4 className="font-bold mb-2">Recent Backups</h4>
              <div className="space-y-2 max-h-60 overflow-y-auto">
                {backups.map((backup) => (
                  <div
                    key={backup.key}
                    className="flex items-center justify-between p-3 rounded-lg bg-gradient-glass dark:bg-gradient-glass-dark shadow-glass-light"
                  >
                    <div>
                      <div className="font-medium">
                        {new Date(backup.timestamp).toLocaleDateString()} 
                        {' '}
                        {new Date(backup.timestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                      </div>
                      <div className="text-xs opacity-75">
                        {backup.data.tasks?.length || 0} tasks, {backup.data.dictionary?.length || 0} words
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => onRestore(backup.data)}
                        className="p-2 rounded-lg bg-blue-500/20 hover:bg-blue-500/30 text-blue-500"
                        title="Restore this backup"
                      >
                        <Icons.Restore />
                      </button>
                      <button
                        onClick={() => onDeleteBackup(backup.key)}
                        className="p-2 rounded-lg bg-red-500/20 hover:bg-red-500/30 text-red-500"
                        title="Delete this backup"
                      >
                        <Icons.Trash />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
});

// Profile Tab
export const ProfileTab = memo(({
  backups,
  restoreFromBackup,
  createBackup,
  deleteBackup,
  level,
  xp,
  completedTasks,
  totalWords,
  darkMode,
  clearAllData,
  handleDarkModeToggle
}) => (
  <div className="space-y-6">
    <BackupManager 
      backups={backups}
      onRestore={restoreFromBackup}
      onCreateBackup={createBackup}
      onDeleteBackup={deleteBackup}
    />
    
    <div className="glass-card p-6">
      <h2 className="text-2xl font-bold mb-6">Your Stats</h2>
      <StatsGrid 
        level={level}
        xp={xp}
        completedTasks={completedTasks}
        totalWords={totalWords}
      />
    </div>
    
    <div className="glass-card p-6">
      <h2 className="text-2xl font-bold mb-4">Appearance</h2>
      <div className="flex items-center justify-between">
        <div>
          <div className="font-medium">Dark Mode</div>
          <div className="text-sm opacity-75">Toggle light/dark theme</div>
        </div>
        <button 
          onClick={handleDarkModeToggle}
          className={`relative w-14 h-8 rounded-full transition-colors ${darkMode ? 'bg-sf-blue' : 'bg-gray-300'}`}
          aria-label="Toggle dark mode"
        >
          <div className={`absolute top-1 w-6 h-6 rounded-full bg-white transition-transform ${darkMode ? 'right-1' : 'left-1'}`} />
        </button>
      </div>
    </div>
    
    <div className="glass-card p-6">
      <h2 className="text-2xl font-bold mb-4">Data Management</h2>
      <div className="space-y-3">
        <div className="text-sm opacity-75 mb-4">
          <p>• Data is automatically saved in your browser</p>
          <p>• Automatic backups every hour</p>
          <p>• Export to file for safe keeping</p>
          <p>• Import from file to restore</p>
        </div>
        
        <button
          onClick={clearAllData}
          className="w-full py-3 rounded-xl bg-red-500/20 hover:bg-red-500/30 text-red-500 font-medium flex items-center justify-center gap-2 transition-colors"
        >
          <Icons.Trash />
          Clear All Data
        </button>
      </div>
    </div>
    
    <div className="glass-card p-6">
      <h2 className="text-2xl font-bold mb-4">About</h2>
      <p className="mb-4 opacity-90">
        This gamified planner helps you stay productive while learning German. 
        Complete tasks to earn XP and level up!
      </p>
      <div className="text-sm opacity-75">
        <p>• Each completed task gives +15 XP</p>
        <p>• Level up every {level * 100} XP</p>
        <p>• Track your German vocabulary</p>
        <p>• All data is stored locally in your browser</p>
      </div>
    </div>
  </div>
));

