import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { ExperienceBar, ConfirmModal, BottomNavigation } from './uiComponents';
import { TasksTab, DictionaryTab } from './tabs';
import { ProfileTab } from './backupAndProfile';
import { QUEST_DEFINITIONS } from './questsConfig';
import { SKILL_DEFINITIONS } from './skillsConfig';

// Вспомогательные функции для периодов
const getTodayKey = (date = new Date()) => date.toISOString().slice(0, 10);

const getWeekKey = (date = new Date()) => {
  const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
  const dayNum = d.getUTCDay() || 7;
  d.setUTCDate(d.getUTCDate() + 4 - dayNum);
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
  const weekNo = Math.ceil(((d - yearStart) / 86400000 + 1) / 7);
  return `${d.getUTCFullYear()}-W${weekNo}`;
};

const getMonthKey = (date = new Date()) => date.toISOString().slice(0, 7);

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
  const [newTaskUrgent, setNewTaskUrgent] = useState(false);
  const [newTaskCategory, setNewTaskCategory] = useState('General');
  const [newGermanWord, setNewGermanWord] = useState('');
  const [newEnglishWord, setNewEnglishWord] = useState('');
  const [newWordExample, setNewWordExample] = useState('');

  const [quests, setQuests] = useState(() => {
    try {
      const saved = localStorage.getItem('plannerQuests');
      if (saved) return JSON.parse(saved);
    } catch {
      // ignore
    }
    const now = new Date();
    const todayKey = getTodayKey(now);
    const weekKey = getWeekKey(now);
    const monthKey = getMonthKey(now);
    return QUEST_DEFINITIONS.map((def) => ({
      ...def,
      status: def.autoActivate ? 'active' : 'locked',
      progress: 0,
      periodKey:
        def.period === 'day'
          ? todayKey
          : def.period === 'week'
          ? weekKey
          : def.period === 'month'
          ? monthKey
          : null,
    }));
  });

  const [skillPoints, setSkillPoints] = useState(() => {
    const saved = localStorage.getItem('skillPoints');
    const parsed = saved ? parseInt(saved, 10) : 0;
    return Number.isNaN(parsed) ? 0 : parsed;
  });

  const [skills, setSkills] = useState(() => {
    try {
      const saved = localStorage.getItem('unlockedSkills');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

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
    localStorage.setItem('plannerQuests', JSON.stringify(quests));
    localStorage.setItem('skillPoints', skillPoints.toString());
    localStorage.setItem('unlockedSkills', JSON.stringify(skills));
  }, [tasks, dictionary, xp, level, darkMode, quests, skillPoints, skills]);

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
       setSkillPoints(prev => prev + 1);
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
  const addTask = useCallback(
    (payload) => {
      const title =
        typeof payload === 'string'
          ? payload
          : payload?.title ?? newTask;

      const important =
        typeof payload === 'object' && payload !== null && 'important' in payload
          ? !!payload.important
          : newTaskImportant;

      const urgent =
        typeof payload === 'object' && payload !== null && 'urgent' in payload
          ? !!payload.urgent
          : newTaskUrgent;

      const category =
        typeof payload === 'object' && payload !== null && payload.category
          ? payload.category
          : newTaskCategory;

      const xpValue =
        typeof payload === 'object' && payload !== null && typeof payload.xp === 'number'
          ? payload.xp
          : 15;

      if (!title || !title.trim()) return;

      const task = {
        id: Date.now() + Math.floor(Math.random() * 1000),
        title: title.trim(),
        xp: xpValue,
        completed: false,
        category,
        important,
        urgent,
        createdAt: new Date().toISOString()
      };

      setTasks((prev) => [task, ...prev]);

      // если добавляли из поля ввода — очищаем форму
      if (!payload || typeof payload === 'string') {
        setNewTask('');
        setNewTaskImportant(false);
        setNewTaskUrgent(false);
        setNewTaskCategory('General');
      }
    },
    [newTask, newTaskImportant, newTaskUrgent, newTaskCategory]
  );

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
      example: newWordExample,
      createdAt: new Date().toISOString()
    };
    
    setDictionary(prev => [word, ...prev]);
    setNewGermanWord('');
    setNewEnglishWord('');
    setNewWordExample('');
  }, [newGermanWord, newEnglishWord, newWordExample]);

  const deleteWord = useCallback((wordId) => {
    setDictionary(prev => prev.filter(word => word.id !== wordId));
  }, []);

  // Обновление прогресса квестов
  useEffect(() => {
    const now = new Date();
    const todayKey = getTodayKey(now);
    const weekKey = getWeekKey(now);
    const monthKey = getMonthKey(now);

    setQuests((prev) =>
      prev.map((quest) => {
        let status = quest.status;
        let progress = quest.progress || 0;
        let periodKey = quest.periodKey || null;

        // Обновление periodKey и сброс для ежедневных/еженедельных
        const currentKey =
          quest.period === 'day'
            ? todayKey
            : quest.period === 'week'
            ? weekKey
            : quest.period === 'month'
            ? monthKey
            : null;

        if (quest.period && currentKey && currentKey !== periodKey) {
          periodKey = currentKey;
          progress = 0;
          if (status === 'completed' || status === 'claimed') {
            status = 'active';
          }
        }

        // Автоактивация по условиям (простые случаи)
        if (status === 'locked' && quest.autoActivate) {
          if (quest.type === 'story' && quest.id === 'story_chapter_1') {
            if (level >= quest.baseTarget) {
              status = 'completed';
              progress = quest.baseTarget;
            } else {
              status = 'active';
            }
          } else {
            status = 'active';
          }
        }

        if (status !== 'active') {
          return { ...quest, status, progress, periodKey };
        }

        // Подсчёты под разные квесты
        if (quest.id === 'daily_morning_warrior') {
          const count = tasks.filter((t) => {
            if (!t.completed || !t.completedAt) return false;
            const d = new Date(t.completedAt);
            const sameDay = getTodayKey(d) === todayKey;
            return sameDay && d.getHours() < 10;
          }).length;
          progress = Math.min(count, quest.baseTarget);
          if (progress >= quest.baseTarget) status = 'completed';
        }

        if (quest.id === 'daily_evening_review') {
          const todaysImportant = tasks.filter((t) => {
            const created = t.createdAt ? getTodayKey(new Date(t.createdAt)) : null;
            return created === todayKey && t.important;
          });
          const total = todaysImportant.length;
          const done = todaysImportant.filter((t) => t.completed).length;
          progress = total === 0 ? 0 : done >= total ? 1 : 0;
          if (total > 0 && done >= total) status = 'completed';
        }

        if (quest.id === 'daily_focus_marathon') {
          const completedToday = tasks
            .filter((t) => t.completed && t.completedAt && getTodayKey(new Date(t.completedAt)) === todayKey)
            .sort((a, b) => new Date(a.completedAt) - new Date(b.completedAt));
          progress = Math.min(completedToday.length, quest.baseTarget);
          if (progress >= quest.baseTarget) status = 'completed';
        }

        if (quest.id === 'daily_german_minute') {
          const addedToday = dictionary.filter(
            (w) => w.createdAt && getTodayKey(new Date(w.createdAt)) === todayKey
          ).length;
          progress = Math.min(addedToday, quest.baseTarget);
          if (progress >= quest.baseTarget) status = 'completed';
        }

        if (quest.id === 'weekly_productivity') {
          const since = Date.now() - 7 * 24 * 60 * 60 * 1000;
          const count = tasks.filter(
            (t) => t.completed && t.completedAt && Date.parse(t.completedAt) >= since
          ).length;
          progress = Math.min(count, quest.baseTarget);
          if (progress >= quest.baseTarget) status = 'completed';
        }

        if (quest.id === 'weekly_learning') {
          const since = Date.now() - 7 * 24 * 60 * 60 * 1000;
          const count = dictionary.filter(
            (w) => w.createdAt && Date.parse(w.createdAt) >= since
          ).length;
          progress = Math.min(count, quest.baseTarget);
          if (progress >= quest.baseTarget) status = 'completed';
        }

        if (quest.id === 'weekly_consistency' || quest.id === 'special_survival') {
          // 7 подряд дней с активностью
          const days = new Set();
          tasks.forEach((t) => {
            if (t.completed && t.completedAt) {
              days.add(getTodayKey(new Date(t.completedAt)));
            }
          });
          dictionary.forEach((w) => {
            if (w.createdAt) {
              days.add(getTodayKey(new Date(w.createdAt)));
            }
          });
          // считаем только последние 7 дней
          const todayDate = new Date(todayKey);
          let streak = 0;
          for (let i = 0; i < 7; i++) {
            const d = new Date(todayDate);
            d.setDate(todayDate.getDate() - i);
            const key = getTodayKey(d);
            if (days.has(key)) streak += 1;
            else break;
          }
          progress = Math.min(streak, quest.baseTarget);
          if (progress >= quest.baseTarget) status = 'completed';
        }

        if (quest.id === 'weekly_balance' || quest.id === 'special_expedition') {
          const since = Date.now() - 7 * 24 * 60 * 60 * 1000;
          const cats = new Set(
            tasks
              .filter(
                (t) =>
                  t.completed &&
                  t.completedAt &&
                  Date.parse(t.completedAt) >= since &&
                  t.category
              )
              .map((t) => t.category)
          );
          progress = Math.min(cats.size, quest.baseTarget);
          if (progress >= quest.baseTarget) status = 'completed';
        }

        if (quest.id === 'special_rescue') {
          const nowMs = Date.now();
          const overdueCompleted = tasks.filter((t) => {
            if (!t.completed || !t.completedAt || !t.createdAt) return false;
            const ageMs = nowMs - Date.parse(t.createdAt);
            return ageMs > 7 * 24 * 60 * 60 * 1000;
          }).length;
          progress = Math.min(overdueCompleted, quest.baseTarget);
          if (progress >= quest.baseTarget) status = 'completed';
        }

        if (quest.id === 'special_boss_fight') {
          const since = Date.now() - 7 * 24 * 60 * 60 * 1000;
          const highXpCompleted = tasks.filter(
            (t) =>
              t.completed &&
              t.completedAt &&
              Date.parse(t.completedAt) >= since &&
              (t.xp || 0) >= 20
          ).length;
          progress = highXpCompleted > 0 ? 1 : 0;
          if (highXpCompleted > 0) status = 'completed';
        }

        if (quest.id === 'story_chapter_1' && status === 'active') {
          progress = Math.min(level, quest.baseTarget);
          if (level >= quest.baseTarget) status = 'completed';
        }

        return {
          ...quest,
          status,
          progress,
          periodKey,
        };
      })
    );
  }, [tasks, dictionary, level]);

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
    <div
      className={`h-screen overflow-hidden flex flex-col transition-colors duration-300 ${
        darkMode
          ? 'dark bg-gradient-to-b from-slate-950 via-slate-900 to-indigo-950 text-white'
          : 'bg-gradient-to-b from-slate-50 via-indigo-50 to-blue-100 text-gray-900'
      }`}
    >
      <ConfirmModal {...modalConfig} />
      <div className="flex-shrink-0">
        <ExperienceBar xp={xp} level={level} showLevelUp={showLevelUp} />
      </div>
      
      <main className="flex-1 overflow-y-auto max-w-2xl w-full mx-auto px-4 pb-24 pt-4">
        {activeTab === 'tasks' && (
          <TasksTab
            tasks={tasks}
            newTask={newTask}
            setNewTask={setNewTask}
            newTaskImportant={newTaskImportant}
            setNewTaskImportant={setNewTaskImportant}
            newTaskUrgent={newTaskUrgent}
            setNewTaskUrgent={setNewTaskUrgent}
            newTaskCategory={newTaskCategory}
            setNewTaskCategory={setNewTaskCategory}
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
            quests={quests}
            skillPoints={skillPoints}
            skills={SKILL_DEFINITIONS}
          />
        )}
      </main>
      
      <BottomNavigation activeTab={activeTab} setActiveTab={setActiveTab} />
    </div>
  );
};

export default App;