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
  
  return (
    <div 
      className={`glass-card p-5 mb-4 transition-all duration-200 ${isPressed ? 'scale-95' : 'scale-100'} ${task.completed ? 'opacity-60' : ''}`}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center">
          <button 
            onClick={handleComplete}
            className={`w-8 h-8 rounded-full flex items-center justify-center mr-4 ${task.completed ? 'bg-sf-blue' : 'border-2 border-gray-300 dark:border-gray-600'}`}
            disabled={task.completed}
            aria-label={task.completed ? "Task completed" : "Complete task"}
          >
            {task.completed && <Icons.Check />}
          </button>
          <div className="flex-1">
            <h3 className={`font-medium ${task.completed ? 'line-through opacity-75' : ''}`}>{task.title}</h3>
            <div className="flex items-center mt-1">
              <span className="text-xs px-2 py-1 rounded-full bg-sf-blue/20 text-sf-blue font-medium">
                +{task.xp} XP
              </span>
              {task.category && (
                <span className="text-xs px-2 py-1 rounded-full bg-gray-200 dark:bg-gray-700 ml-2">
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
  addTask,
  completedTasks,
  totalTasks,
  clearCompletedTasks,
  completeTask,
  deleteTask,
  handleTaskKeyDown
}) => {
  const [backlogCollapsed, setBacklogCollapsed] = useState(true);
  const [viewMode, setViewMode] = useState('list'); // 'list' | 'cards'

  const { todayTasks, backlogTasks, timeline } = useMemo(() => {
    const todayStr = new Date().toISOString().slice(0, 10);
    const today = [];
    const backlog = [];
    const timelineMap = {};

    tasks.forEach(task => {
      const createdDate = task.createdAt ? task.createdAt.slice(0, 10) : null;
      const isToday = createdDate === todayStr;
      const isImportant = !!task.important;

      if (!task.completed) {
        if (isToday || isImportant) {
          today.push(task);
        } else {
          backlog.push(task);
        }
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

    const timelineArr = Object.values(timelineMap).sort((a, b) =>
      b.date.localeCompare(a.date)
    );

    return { todayTasks: today, backlogTasks: backlog, timeline: timelineArr };
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
            onClick={addTask}
            className="bg-sf-blue text-white px-6 py-3 rounded-xl font-medium hover:opacity-90 active:scale-95 transition-all"
          >
            Add
          </button>
        </div>

        {/* Флаг важной задачи / для Today */}
        <div className="flex justify-between items-center text-sm">
          <label className="flex items-center gap-2 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={newTaskImportant}
              onChange={(e) => setNewTaskImportant(e.target.checked)}
              className="accent-sf-blue"
            />
            <span className="opacity-80">
              Mark as important (stay in Today)
            </span>
          </label>

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
      </div>

      {/* Today section */}
      <section className="mb-6">
        <h2 className="text-2xl font-bold mb-3 px-2 flex items-center gap-2">
          Today
          <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-sf-blue/15 text-sf-blue">
            {todayTasks.length} task{todayTasks.length !== 1 ? 's' : ''}
          </span>
        </h2>

        {todayTasks.length === 0 ? (
          <div className="glass-card p-5 text-sm opacity-75">
            No tasks for today yet. Add one above or mark something as important.
          </div>
        ) : (
          renderTasksList(todayTasks)
        )}
      </section>

      {/* Backlog section (accordion) */}
      <section className="mb-8">
        <button
          onClick={() => setBacklogCollapsed(prev => !prev)}
          className="w-full flex items-center justify-between px-2 mb-2"
        >
          <div className="flex items-center gap-2">
            <h2 className="text-2xl font-bold">Backlog</h2>
            <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-gray-500/10">
              {backlogTasks.length} task{backlogTasks.length !== 1 ? 's' : ''}
            </span>
          </div>
          <svg
            className={`w-5 h-5 transition-transform ${
              backlogCollapsed ? '' : 'rotate-180'
            }`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M19 9l-7 7-7-7"
            />
          </svg>
        </button>

        {!backlogCollapsed && (
          backlogTasks.length === 0 ? (
            <div className="glass-card p-5 text-sm opacity-75">
              Backlog is empty. Good job!
            </div>
          ) : (
            renderTasksList(backlogTasks)
          )
        )}
      </section>

      {/* Timeline / History */}
      <section className="mb-10">
        <h2 className="text-2xl font-bold mb-3 px-2">Timeline</h2>
        {timeline.length === 0 ? (
          <div className="glass-card p-5 text-sm opacity-75">
            No completed tasks yet. Your victories will appear here grouped by
            day.
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

