import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { ExperienceBar, ConfirmModal, BottomNavigation } from './uiComponents';
import { TasksTab, DictionaryTab } from './tabs';
import { ProfileTab } from './backupAndProfile';

// Main App Component
const App = () => {
  const [activeTab, setActiveTab] = useState('tasks');

  // Инициализация из localStorage
  const [tasks, setTasks] = useState(() => {
    try {
      const saved = localStorage.getItem('plannerTasks');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [dictionary, setDictionary] = useState(() => {
    try {
      const saved = localStorage.getItem('germanDictionary');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [xp, setXp] = useState(() => {
    const saved = localStorage.getItem('userXp');
    const parsed = saved ? parseInt(saved, 10) : 0;
    return Number.isNaN(parsed) ? 0 : parsed;
  });

  const [level, setLevel] = useState(() => {
    const saved = localStorage.getItem('userLevel');
    const parsed = saved ? parseInt(saved, 10) : 1;
    return Number.isNaN(parsed) ? 1 : parsed;
  });

  const [showLevelUp, setShowLevelUp] = useState(false);

  const [darkMode, setDarkMode] = useState(() => {
    try {
      const saved = localStorage.getItem('darkMode');
      return saved ? JSON.parse(saved) : true;
    } catch {
      return true;
    }
  });

  const [backups, setBackups] = useState(() => {
    try {
      const backupKeys = Object.keys(localStorage)
        .filter(key => key.startsWith('planner_backup_'))
        .sort()
        .reverse()
        .slice(0, 10);

      return backupKeys.map(key => ({
        key,
        timestamp: key.replace('planner_backup_', ''),
        data: JSON.parse(localStorage.getItem(key))
      }));
    } catch {
      return [];
    }
  });
  const [modalConfig, setModalConfig] = useState({
    isOpen: false,
    title: '',
    message: '',
    onConfirm: () => {},
    onCancel: () => {}
  });
  
  const [newTask, setNewTask] = useState('');
  const [newTaskImportant, setNewTaskImportant] = useState(false);
  const [newGermanWord, setNewGermanWord] = useState('');
  const [newEnglishWord, setNewEnglishWord] = useState('');
  const [newWordExample, setNewWordExample] = useState('');

  // Вычисляемые значения
  const completedTasks = useMemo(() => tasks.filter(task => task.completed).length, [tasks]);
  const totalTasks = useMemo(() => tasks.length, [tasks]);
  const totalWords = useMemo(() => dictionary.length, [dictionary]);

  // Сохранение данных в localStorage
  useEffect(() => {
    localStorage.setItem('plannerTasks', JSON.stringify(tasks));
    localStorage.setItem('germanDictionary', JSON.stringify(dictionary));
    localStorage.setItem('userXp', xp.toString());
    localStorage.setItem('userLevel', level.toString());
    localStorage.setItem('darkMode', JSON.stringify(darkMode));
  }, [tasks, dictionary, xp, level, darkMode]);

  // Автоматический бэкап каждый час
  useEffect(() => {
    const createBackup = () => {
      const backupData = {
        tasks,
        dictionary,
        xp,
        level,
        darkMode,
        timestamp: new Date().toISOString()
      };
      
      const backupKey = `planner_backup_${new Date().toISOString()}`;
      localStorage.setItem(backupKey, JSON.stringify(backupData));
      
      const backupKeys = Object.keys(localStorage)
        .filter(key => key.startsWith('planner_backup_'))
        .sort()
        .reverse()
        .slice(0, 10);
      
      Object.keys(localStorage)
        .filter(key => key.startsWith('planner_backup_') && !backupKeys.includes(key))
        .forEach(key => localStorage.removeItem(key));
      
      const updatedBackups = backupKeys.map(key => ({
        key,
        timestamp: key.replace('planner_backup_', ''),
        data: JSON.parse(localStorage.getItem(key))
      }));
      
      setBackups(updatedBackups);
    };

    const backupInterval = setInterval(createBackup, 3600000);
    const handleBeforeUnload = createBackup;
    
    window.addEventListener('beforeunload', handleBeforeUnload);
    
    return () => {
      clearInterval(backupInterval);
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, [tasks, dictionary, xp, level, darkMode]);

  // Проверка повышения уровня
  useEffect(() => {
    const xpForNextLevel = level * 100;
    if (xp >= xpForNextLevel) {
      const newLevel = level + 1;
      setLevel(newLevel);
      setShowLevelUp(true);
      
      setTimeout(() => {
        setShowLevelUp(false);
      }, 3000);
    }
  }, [xp, level]);

  // Создание бэкапа
  const createBackup = useCallback(() => {
    const backupData = {
      tasks,
      dictionary,
      xp,
      level,
      darkMode,
      timestamp: new Date().toISOString()
    };
    
    const backupKey = `planner_backup_${new Date().toISOString()}`;
    localStorage.setItem(backupKey, JSON.stringify(backupData));
    
    const backupKeys = Object.keys(localStorage)
      .filter(key => key.startsWith('planner_backup_'))
      .sort()
      .reverse()
      .slice(0, 10);
    
    const updatedBackups = backupKeys.map(key => ({
      key,
      timestamp: key.replace('planner_backup_', ''),
      data: JSON.parse(localStorage.getItem(key))
    }));
    
    setBackups(updatedBackups);
    alert('Backup created successfully!');
  }, [tasks, dictionary, xp, level, darkMode]);

  // Восстановление из бэкапа
  const restoreFromBackup = useCallback((backupData) => {
    setModalConfig({
      isOpen: true,
      title: 'Restore Backup',
      message: 'Restore this backup? Current data will be replaced.',
      onConfirm: () => {
        setTasks(backupData.tasks || []);
        setDictionary(backupData.dictionary || []);
        setXp(backupData.xp || 0);
        setLevel(backupData.level || 1);
        setDarkMode(backupData.darkMode !== undefined ? backupData.darkMode : true);
        setModalConfig({ ...modalConfig, isOpen: false });
        alert('Backup restored!');
      },
      onCancel: () => setModalConfig({ ...modalConfig, isOpen: false })
    });
  }, [modalConfig]);

  // Удаление бэкапа
  const deleteBackup = useCallback((backupKey) => {
    setModalConfig({
      isOpen: true,
      title: 'Delete Backup',
      message: 'Are you sure you want to delete this backup?',
      onConfirm: () => {
        localStorage.removeItem(backupKey);
        setBackups(backups.filter(b => b.key !== backupKey));
        setModalConfig(prev => ({ ...prev, isOpen: false }));
      },
      onCancel: () => setModalConfig(prev => ({ ...prev, isOpen: false }))
    });
  }, [backups]);

  // Функции для задач
  const addTask = useCallback(() => {
    if (!newTask.trim()) return;
    
    const task = {
      id: Date.now(),
      title: newTask,
      xp: 15,
      completed: false,
      category: 'General',
      important: newTaskImportant,
      createdAt: new Date().toISOString()
    };
    
    setTasks(prev => [task, ...prev]);
    setNewTask('');
    setNewTaskImportant(false);
  }, [newTask, newTaskImportant]);

  const completeTask = useCallback((taskId) => {
    setTasks(prev => prev.map(task => {
      if (task.id === taskId && !task.completed) {
        setXp(prevXp => prevXp + task.xp);
        return { 
          ...task, 
          completed: true,
          completedAt: new Date().toISOString()
        };
      }
      return task;
    }));
  }, []);

  const deleteTask = useCallback((taskId) => {
    setTasks(prev => prev.filter(task => task.id !== taskId));
  }, []);

  const clearCompletedTasks = useCallback(() => {
    setTasks(prev => prev.filter(task => !task.completed));
  }, []);

  // Функции для словаря
  const addWord = useCallback(() => {
    if (!newGermanWord.trim() || !newEnglishWord.trim()) return;
    
    const word = {
      id: Date.now(),
      german: newGermanWord,
      english: newEnglishWord,
      example: newWordExample
    };
    
    setDictionary(prev => [word, ...prev]);
    setNewGermanWord('');
    setNewEnglishWord('');
    setNewWordExample('');
  }, [newGermanWord, newEnglishWord, newWordExample]);

  const deleteWord = useCallback((wordId) => {
    setDictionary(prev => prev.filter(word => word.id !== wordId));
  }, []);

  // Очистка всех данных
  const clearAllData = useCallback(() => {
    setModalConfig({
      isOpen: true,
      title: 'Clear All Data',
      message: 'Are you sure? This will delete ALL your data including backups!',
      onConfirm: () => {
        localStorage.clear();
        setTasks([]);
        setDictionary([]);
        setXp(0);
        setLevel(1);
        setBackups([]);
        setModalConfig(prev => ({ ...prev, isOpen: false }));
        alert('All data cleared!');
      },
      onCancel: () => setModalConfig(prev => ({ ...prev, isOpen: false }))
    });
  }, []);

  // Обработчики для форм
  const handleTaskKeyDown = useCallback((e) => {
    if (e.key === 'Enter') addTask();
  }, [addTask]);

  const handleDarkModeToggle = useCallback(() => {
    setDarkMode(prev => !prev);
  }, []);

  return (
    <div className={`min-h-screen transition-colors duration-300 ${darkMode ? 'dark bg-gradient-to-b from-gray-900 to-indigo-950 text-white' : 'bg-gradient-to-b from-gray-50 to-blue-50 text-gray-900'}`}>
      
      <ConfirmModal {...modalConfig} />
      <ExperienceBar xp={xp} level={level} showLevelUp={showLevelUp} />
      
      <main className="max-w-2xl mx-auto px-4 pb-24 pt-4">
        {activeTab === 'tasks' && (
          <TasksTab
            tasks={tasks}
            newTask={newTask}
            setNewTask={setNewTask}
            newTaskImportant={newTaskImportant}
            setNewTaskImportant={setNewTaskImportant}
            addTask={addTask}
            completedTasks={completedTasks}
            totalTasks={totalTasks}
            clearCompletedTasks={clearCompletedTasks}
            completeTask={completeTask}
            deleteTask={deleteTask}
            handleTaskKeyDown={handleTaskKeyDown}
          />
        )}
        
        {activeTab === 'dictionary' && (
          <DictionaryTab
            dictionary={dictionary}
            totalWords={totalWords}
            newGermanWord={newGermanWord}
            setNewGermanWord={setNewGermanWord}
            newEnglishWord={newEnglishWord}
            setNewEnglishWord={setNewEnglishWord}
            newWordExample={newWordExample}
            setNewWordExample={setNewWordExample}
            addWord={addWord}
            deleteWord={deleteWord}
          />
        )}
        
        {activeTab === 'profile' && (
          <ProfileTab
            backups={backups}
            restoreFromBackup={restoreFromBackup}
            createBackup={createBackup}
            deleteBackup={deleteBackup}
            level={level}
            xp={xp}
            completedTasks={completedTasks}
            totalWords={totalWords}
            darkMode={darkMode}
            clearAllData={clearAllData}
            handleDarkModeToggle={handleDarkModeToggle}
          />
        )}
      </main>
      
      <BottomNavigation activeTab={activeTab} setActiveTab={setActiveTab} />
    </div>
  );
};

export default App;