import React, { useState, useCallback, useMemo, memo } from 'react';
import { Icons } from './uiComponents';

// Task Card Component
const TaskCard = memo(({ task, onComplete, onDelete }) => {
  const [isPressed, setIsPressed] = useState(false);
  
  const handleComplete = useCallback(() => {
    setIsPressed(true);
    setTimeout(() => {
      onComplete(task.id);
      setIsPressed(false);
    }, 150);
  }, [task.id, onComplete]);
  
  const handleDelete = useCallback(() => {
    onDelete(task.id);
  }, [task.id, onDelete]);

  const isImportant = !!task.important && !task.completed;
  const isUrgent = !!task.urgent && !task.completed;

  const categoryAccent = (() => {
    switch (task.category) {
      case 'Health':
        return 'border-emerald-400/50 bg-emerald-500/10 text-emerald-200';
      case 'Work':
        return 'border-indigo-400/50 bg-indigo-500/10 text-indigo-200';
      case 'Learning':
        return 'border-sky-400/50 bg-sky-500/10 text-sky-200';
      case 'Routine':
        return 'border-amber-400/50 bg-amber-500/10 text-amber-200';
      default:
        return 'border-white/15 bg-white/5 text-white/70';
    }
  })();
  
  return (
    <div 
      className={`glass-card p-5 mb-4 transition-all duration-200 ${
        isPressed ? 'scale-95' : 'scale-100'
      } ${task.completed ? 'opacity-60' : ''} ${
        isImportant ? 'glass-glow border border-amber-300/60' : ''
      }`}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center">
          <button 
            onClick={handleComplete}
            className={`w-8 h-8 rounded-full flex items-center justify-center mr-4 ${
              task.completed
                ? 'bg-sf-blue'
                : isImportant
                ? 'border-2 border-amber-400/70'
                : 'border-2 border-gray-300 dark:border-gray-600'
            }`}
            disabled={task.completed}
            aria-label={task.completed ? "Task completed" : "Complete task"}
          >
            {task.completed && <Icons.Check />}
          </button>
          <div className="flex-1">
            <h3 className={`font-medium ${task.completed ? 'line-through opacity-75' : ''}`}>{task.title}</h3>
            <div className="flex items-center mt-1 flex-wrap gap-1">
              <span className="text-xs px-2 py-1 rounded-full bg-sf-blue/20 text-sf-blue font-medium">
                +{task.xp} XP
              </span>
              {isImportant && (
                <span className="text-xs px-2 py-1 rounded-full bg-amber-500/15 text-amber-300 font-medium flex items-center gap-1">
                  <span>⭐</span>
                  <span>Important</span>
                </span>
              )}
              {isUrgent && (
                <span className="text-xs px-2 py-1 rounded-full bg-orange-500/15 text-orange-300 font-medium">
                  ⏱ Срочно
                </span>
              )}
              {task.category && (
                <span className={`text-xs px-2 py-1 rounded-full border ${categoryAccent}`}>
                  {task.category}
                </span>
              )}
            </div>
          </div>
        </div>
        
        {!task.completed && (
          <button 
            onClick={handleDelete}
            className="text-gray-400 hover:text-red-400 p-2 transition-colors flex-shrink-0"
            aria-label="Delete task"
          >
            <Icons.Close />
          </button>
        )}
      </div>
    </div>
  );
});

// Word Card Component
const WordCard = memo(({ word, onDelete }) => {
  const handleDelete = useCallback(() => {
    onDelete(word.id);
  }, [word.id, onDelete]);
  
  return (
    <div className="glass-card p-5 mb-4">
      <div className="flex justify-between items-start">
        <div className="flex-1">
          <h3 className="text-xl font-bold mb-1">{word.german}</h3>
          <p className="text-gray-600 dark:text-gray-300 mb-3">{word.english}</p>
          {word.example && (
            <div className="text-sm italic text-gray-500 dark:text-gray-400 border-l-3 border-sf-blue pl-3 py-1 mt-2">
              &ldquo;{word.example}&rdquo;
            </div>
          )}
        </div>
        <button 
          onClick={handleDelete}
          className="text-gray-400 hover:text-red-400 p-1 transition-colors flex-shrink-0 ml-2"
          aria-label="Delete word"
        >
          <Icons.Close />
        </button>
      </div>
    </div>
  );
});

// Tasks Tab
export const TasksTab = memo(({
  tasks,
  newTask,
  setNewTask,
  newTaskImportant,
  setNewTaskImportant,
  newTaskUrgent,
  setNewTaskUrgent,
  newTaskCategory,
  setNewTaskCategory,
  addTask,
  completedTasks,
  totalTasks,
  clearCompletedTasks,
  completeTask,
  deleteTask,
  handleTaskKeyDown
}) => {
  const [viewMode, setViewMode] = useState('list'); // 'list' | 'cards'
  const [sectionView, setSectionView] = useState('today'); // 'today' | 'backlog' | 'timeline' | 'matrix'

  const {
    todayTasks,
    backlogTasks,
    timeline,
    matrix,
    smartContext,
    smartSuggestions,
  } = useMemo(() => {
    const todayStr = new Date().toISOString().slice(0, 10);
    const today = [];
    const backlog = [];
    const timelineMap = {};
    const matrixBuckets = {
      doNow: [],
      schedule: [],
      delegate: [],
      drop: [],
    };

    tasks.forEach(task => {
      const createdDate = task.createdAt ? task.createdAt.slice(0, 10) : null;
      const isToday = createdDate === todayStr;
      const isImportant = !!task.important;
      const isUrgent = !!task.urgent;

      if (!task.completed) {
        if (isToday || isImportant) {
          today.push(task);
        } else {
          backlog.push(task);
        }

        // Эйзенхауэр
        if (isImportant && isUrgent) matrixBuckets.doNow.push(task);
        else if (isImportant && !isUrgent) matrixBuckets.schedule.push(task);
        else if (!isImportant && isUrgent) matrixBuckets.delegate.push(task);
        else matrixBuckets.drop.push(task);
      }

      if (task.completed && task.completedAt) {
        const dateKey = task.completedAt.slice(0, 10);
        if (!timelineMap[dateKey]) {
          timelineMap[dateKey] = { date: dateKey, tasks: [], totalXp: 0 };
        }
        timelineMap[dateKey].tasks.push(task);
        timelineMap[dateKey].totalXp += task.xp || 0;
      }
    });

    const sortByXpDesc = (arr) =>
      arr.sort((a, b) => (b.xp || 0) - (a.xp || 0));

    sortByXpDesc(today);
    sortByXpDesc(backlog);
    sortByXpDesc(matrixBuckets.doNow);
    sortByXpDesc(matrixBuckets.schedule);
    sortByXpDesc(matrixBuckets.delegate);
    sortByXpDesc(matrixBuckets.drop);

    const timelineArr = Object.values(timelineMap).sort((a, b) =>
      b.date.localeCompare(a.date)
    );

    // Контекст (легковесно, без внешних API)
    const hour = new Date().getHours();
    const timeOfDay =
      hour < 11 ? 'утро' : hour < 17 ? 'день' : hour < 22 ? 'вечер' : 'ночь';

    // Энергия: грубая эвристика по выполненным за последние 24ч
    const since = Date.now() - 24 * 60 * 60 * 1000;
    const completedLast24h = tasks.filter(
      (t) => t.completed && t.completedAt && Date.parse(t.completedAt) >= since
    ).length;
    const energyLevel =
      completedLast24h >= 6 ? 'высокая' : completedLast24h >= 2 ? 'средняя' : 'низкая';

    const context = {
      timeOfDay,
      energyLevel,
    };

    const suggestionsByTime = {
      утро: ['Сделать зарядку', 'Медитация 5 минут', 'Спланировать день'],
      день: ['Сфокусироваться на 1 задаче', 'Разобрать backlog', 'Перерыв 10 минут'],
      вечер: ['Подвести итоги дня', 'Чтение 15 минут', 'Подготовить план на завтра'],
      ночь: ['Записать мысли', 'Подготовка ко сну', 'Лёгкая растяжка'],
    };

    const suggestedTasks = suggestionsByTime[timeOfDay] || [];

    return {
      todayTasks: today,
      backlogTasks: backlog,
      timeline: timelineArr,
      matrix: matrixBuckets,
      smartContext: context,
      smartSuggestions: suggestedTasks,
    };
  }, [tasks]);

  const renderTasksList = (list) => {
    if (viewMode === 'list') {
      return list.map(task => (
        <TaskCard
          key={task.id}
          task={task}
          onComplete={completeTask}
          onDelete={deleteTask}
        />
      ));
    }

    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {list.map(task => (
          <TaskCard
            key={task.id}
            task={task}
            onComplete={completeTask}
            onDelete={deleteTask}
          />
        ))}
      </div>
    );
  };

  return (
    <>
      <div className="glass-card p-6 mb-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-2xl font-bold">Add New Task</h2>

          {/* Переключатель вида: List / Cards */}
          <div className="inline-flex rounded-xl bg-black/5 dark:bg-white/10 p-1">
            <button
              onClick={() => setViewMode('list')}
              className={`px-3 py-1 text-xs font-medium rounded-lg transition-colors ${
                viewMode === 'list'
                  ? 'bg-sf-blue text-white'
                  : 'text-sm opacity-70'
              }`}
            >
              List
            </button>
            <button
              onClick={() => setViewMode('cards')}
              className={`px-3 py-1 text-xs font-medium rounded-lg transition-colors ${
                viewMode === 'cards'
                  ? 'bg-sf-blue text-white'
                  : 'text-sm opacity-70'
              }`}
            >
              Cards
            </button>
          </div>
        </div>

        <div className="flex gap-2 mb-3">
          <input
            type="text"
            value={newTask}
            onChange={(e) => setNewTask(e.target.value)}
            onKeyDown={handleTaskKeyDown}
            placeholder="What needs to be done?"
            className="flex-1 glass-input px-4 py-3 rounded-xl"
          />
          <button
            onClick={() => addTask()}
            className="bg-sf-blue text-white px-6 py-3 rounded-xl font-medium hover:opacity-90 active:scale-95 transition-all"
          >
            Add
          </button>
        </div>

        {/* Флаг важной задачи / для Today */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-sm">
          <div className="flex flex-wrap items-center gap-3">
            <label className="flex items-center gap-2 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={newTaskImportant}
                onChange={(e) => setNewTaskImportant(e.target.checked)}
                className="accent-sf-blue"
              />
              <span className="opacity-80">Важно</span>
            </label>

            <label className="flex items-center gap-2 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={newTaskUrgent}
                onChange={(e) => setNewTaskUrgent(e.target.checked)}
                className="accent-sf-blue"
              />
              <span className="opacity-80">Срочно</span>
            </label>

            <div className="flex items-center gap-2">
              <span className="opacity-70 text-xs">Категория</span>
              <select
                value={newTaskCategory}
                onChange={(e) => setNewTaskCategory(e.target.value)}
                className="glass-input px-3 py-2 rounded-xl text-sm"
              >
                <option value="General">General</option>
                <option value="Routine">Routine</option>
                <option value="Work">Work</option>
                <option value="Health">Health</option>
                <option value="Learning">Learning</option>
              </select>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="opacity-75">
              {totalTasks > 0
                ? `${completedTasks}/${totalTasks} completed`
                : 'No tasks yet'}
            </div>
            {completedTasks > 0 && (
              <button
                onClick={clearCompletedTasks}
                className="text-red-400 hover:text-red-300 font-medium"
              >
                Clear Completed
              </button>
            )}
          </div>
        </div>

        {/* Smart planning: context + suggestions */}
        <div className="mt-4 glass-card-2 p-4 rounded-2xl">
          <div className="flex items-center justify-between mb-3">
            <div className="font-semibold">Smart planning</div>
            <div className="text-xs opacity-70">
              {smartContext.timeOfDay} • энергия: {smartContext.energyLevel}
            </div>
          </div>
          <div className="flex flex-wrap gap-2">
            {smartSuggestions.map((title) => (
              <button
                key={title}
                onClick={() =>
                  addTask({
                    title,
                    category: 'Routine',
                    important: smartContext.energyLevel === 'высокая',
                    urgent: false,
                    xp: smartContext.energyLevel === 'высокая' ? 20 : 15,
                  })
                }
                className="px-3 py-2 rounded-xl bg-white/40 dark:bg-slate-800/50 hover:bg-white/55 dark:hover:bg-slate-800/70 transition-colors text-sm"
              >
                + {title}
              </button>
            ))}
          </div>
        </div>

        {/* Routine templates */}
        <div className="mt-3 grid grid-cols-1 sm:grid-cols-3 gap-2">
          <button
            onClick={() => {
              ['Зарядка', 'Медитация', 'Планирование дня'].forEach((t) =>
                addTask({ title: t, category: 'Routine', important: true, urgent: false, xp: 15 })
              );
            }}
            className="glass-card-2 px-4 py-3 rounded-2xl text-left hover:bg-white/10 dark:hover:bg-white/5 transition-colors"
          >
            <div className="font-semibold">Утренний ритуал</div>
            <div className="text-xs opacity-75">3 задачи</div>
          </button>
          <button
            onClick={() => {
              ['Сделать задачу #1', 'Сделать задачу #2', 'Сделать задачу #3', 'Сделать задачу #4', 'Перерыв 10 минут'].forEach((t, idx) =>
                addTask({ title: t, category: 'Work', important: idx < 4, urgent: false, xp: idx < 4 ? 20 : 10 })
              );
            }}
            className="glass-card-2 px-4 py-3 rounded-2xl text-left hover:bg-white/10 dark:hover:bg-white/5 transition-colors"
          >
            <div className="font-semibold">Рабочий блок</div>
            <div className="text-xs opacity-75">4 задачи + перерыв</div>
          </button>
          <button
            onClick={() => {
              ['Подвести итоги дня', 'Чтение 15 минут', 'План на завтра'].forEach((t) =>
                addTask({ title: t, category: 'Routine', important: false, urgent: false, xp: 12 })
              );
            }}
            className="glass-card-2 px-4 py-3 rounded-2xl text-left hover:bg-white/10 dark:hover:bg:white/5 transition-colors"
          >
            <div className="font-semibold">Вечерний ритуал</div>
            <div className="text-xs opacity-75">3 задачи</div>
          </button>
        </div>
      </div>

      {/* Local navigation between Today / Backlog / Timeline */}
      <div className="glass-card-2 mb-5 px-3 py-2 rounded-2xl">
        <div className="flex items-center justify-between gap-1">
          {[
            { id: 'today', label: 'Today', Icon: Icons.Tasks },
            { id: 'backlog', label: 'Backlog', Icon: Icons.Cloud },
            { id: 'timeline', label: 'Timeline', Icon: Icons.Backup },
            { id: 'matrix', label: 'Matrix', Icon: Icons.Profile },
          ].map((item) => {
            const isActive = sectionView === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setSectionView(item.id)}
                className={`flex-1 flex flex-col items-center gap-1 py-1.5 rounded-2xl text-2xs font-medium tracking-wide transition-all duration-200 ${
                  isActive
                    ? 'bg-sf-blue/15 text-sf-blue shadow-glass-light'
                    : 'text-slate-500 dark:text-slate-300/90 hover:text-sf-blue/90'
                }`}
              >
                <div
                  className={`w-8 h-8 flex items-center justify-center rounded-2xl ${
                    isActive ? 'bg-sf-blue/20' : 'bg-white/10 dark:bg-slate-800/60'
                  }`}
                >
                  <item.Icon />
                </div>
                <span>{item.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Today section */}
      {sectionView === 'today' && (
        <section className="mb-8 animate-fade-in-up">
          <h2 className="text-2xl font-bold mb-3 px-2 flex items-center gap-2">
            Today
            <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-sf-blue/15 text-sf-blue">
              {todayTasks.length} task{todayTasks.length !== 1 ? 's' : ''}
            </span>
          </h2>

          {todayTasks.length === 0 ? (
            <div className="glass-card p-6 text-center">
              <div className="text-4xl mb-3">🖊️</div>
              <h3 className="text-lg font-semibold mb-1">
                Здесь пока пусто
              </h3>
              <p className="text-sm opacity-75">
                Добавьте свою первую задачу и начните покорять цели!
              </p>
            </div>
          ) : (
            renderTasksList(todayTasks)
          )}
        </section>
      )}

      {/* Backlog section */}
      {sectionView === 'backlog' && (
        <section className="mb-8 animate-fade-in-up">
          <h2 className="text-2xl font-bold mb-3 px-2 flex items-center gap-2">
            Backlog
            <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-gray-500/10">
              {backlogTasks.length} task{backlogTasks.length !== 1 ? 's' : ''}
            </span>
          </h2>

          {backlogTasks.length === 0 ? (
            <div className="glass-card p-6 text-center">
              <div className="text-4xl mb-3">📥</div>
              <h3 className="text-lg font-semibold mb-1">
                Никаких отложенных дел
              </h3>
              <p className="text-sm opacity-75">
                Все задачи под контролем. Добавьте новые, когда будете готовы.
              </p>
            </div>
          ) : (
            renderTasksList(backlogTasks)
          )}
        </section>
      )}

      {/* Timeline / History */}
      {sectionView === 'timeline' && (
        <section className="mb-10 animate-fade-in-up">
          <h2 className="text-2xl font-bold mb-3 px-2">Timeline</h2>
          {timeline.length === 0 ? (
            <div className="glass-card p-6 text-center">
              <div className="text-4xl mb-3">📈</div>
              <h3 className="text-lg font-semibold mb-1">
                История побед появится здесь
              </h3>
              <p className="text-sm opacity-75">
                Выполняйте задачи сегодня, и мы покажем, насколько продуктивным был каждый день.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {timeline.map(day => {
                const totalXp = day.totalXp;
                let intensityClass =
                  'bg-gradient-to-r from-gray-700 to-gray-900';

                if (totalXp >= 150) {
                  intensityClass =
                    'bg-gradient-to-r from-emerald-500 to-emerald-700';
                } else if (totalXp >= 80) {
                  intensityClass =
                    'bg-gradient-to-r from-indigo-500 to-indigo-700';
                } else if (totalXp >= 40) {
                  intensityClass =
                    'bg-gradient-to-r from-sky-500 to-sky-700';
                }

                const formattedDate = new Date(day.date).toLocaleDateString();

                return (
                  <div
                    key={day.date}
                    className={`p-4 rounded-2xl text-white shadow-glass ${intensityClass}`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div className="font-semibold">{formattedDate}</div>
                      <div className="text-sm font-medium opacity-90">
                        {totalXp} XP
                      </div>
                    </div>
                    <div className="space-y-1 text-sm">
                      {day.tasks.map(task => (
                        <div
                          key={task.id}
                          className="flex items-center justify-between gap-3"
                        >
                          <span className="truncate">{task.title}</span>
                          <span className="text-xs opacity-90 whitespace-nowrap">
                            +{task.xp || 0} XP
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </section>
      )}

      {/* Eisenhower Matrix */}
      {sectionView === 'matrix' && (
        <section className="mb-10 animate-fade-in-up">
          <h2 className="text-2xl font-bold mb-3 px-2">Матрица Эйзенхауэра</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="glass-card p-5">
              <div className="flex items-center justify-between mb-3">
                <div className="font-semibold">Срочно / Важно</div>
                <div className="text-xs opacity-70">{matrix.doNow.length}</div>
              </div>
              {matrix.doNow.length === 0 ? (
                <div className="text-sm opacity-70">Пусто. Отлично.</div>
              ) : (
                renderTasksList(matrix.doNow)
              )}
            </div>
            <div className="glass-card p-5">
              <div className="flex items-center justify-between mb-3">
                <div className="font-semibold">Не срочно / Важно</div>
                <div className="text-xs opacity-70">{matrix.schedule.length}</div>
              </div>
              {matrix.schedule.length === 0 ? (
                <div className="text-sm opacity-70">Добавьте важные цели.</div>
              ) : (
                renderTasksList(matrix.schedule)
              )}
            </div>
            <div className="glass-card p-5">
              <div className="flex items-center justify-between mb-3">
                <div className="font-semibold">Срочно / Не важно</div>
                <div className="text-xs opacity-70">{matrix.delegate.length}</div>
              </div>
              {matrix.delegate.length === 0 ? (
                <div className="text-sm opacity-70">Нет мелких срочных дел.</div>
              ) : (
                renderTasksList(matrix.delegate)
              )}
            </div>
            <div className="glass-card p-5">
              <div className="flex items-center justify-between mb-3">
                <div className="font-semibold">Не срочно / Не важно</div>
                <div className="text-xs opacity-70">{matrix.drop.length}</div>
              </div>
              {matrix.drop.length === 0 ? (
                <div className="text-sm opacity-70">Хороший фокус.</div>
              ) : (
                renderTasksList(matrix.drop)
              )}
            </div>
          </div>
        </section>
      )}
    </>
  );
});

// Dictionary Tab
export const DictionaryTab = memo(({
  dictionary,
  totalWords,
  newGermanWord,
  setNewGermanWord,
  newEnglishWord,
  setNewEnglishWord,
  newWordExample,
  setNewWordExample,
  addWord,
  deleteWord
}) => (
  <>
    <div className="glass-card p-6 mb-6">
      <h2 className="text-2xl font-bold mb-4">Add New Word</h2>
      <div className="space-y-4">
        <input
          type="text"
          value={newGermanWord}
          onChange={(e) => setNewGermanWord(e.target.value)}
          placeholder="German word"
          className="w-full glass-input px-4 py-3 rounded-xl"
        />
        <input
          type="text"
          value={newEnglishWord}
          onChange={(e) => setNewEnglishWord(e.target.value)}
          placeholder="English translation"
          className="w-full glass-input px-4 py-3 rounded-xl"
        />
        <input
          type="text"
          value={newWordExample}
          onChange={(e) => setNewWordExample(e.target.value)}
          placeholder="Example sentence (optional)"
          className="w-full glass-input px-4 py-3 rounded-xl"
        />
        <button 
          onClick={addWord}
          className="w-full bg-sf-blue text-white px-6 py-3 rounded-xl font-medium hover:opacity-90 active:scale-95 transition-all"
        >
          Add to Dictionary
        </button>
      </div>
    </div>
    
    <h2 className="text-2xl font-bold mb-4 px-2">Your Dictionary ({totalWords} words)</h2>
    {dictionary.length === 0 ? (
      <div className="glass-card p-8 text-center">
        <div className="text-4xl mb-4">📚</div>
        <h3 className="text-xl font-bold mb-2">Dictionary is empty</h3>
        <p className="opacity-75">Add your first German word above!</p>
      </div>
    ) : (
      dictionary.map(word => (
        <WordCard 
          key={word.id} 
          word={word} 
          onDelete={deleteWord}
        />
      ))
    )}
  </>
));

