import React, { useEffect, useState } from 'react';
import { Task, QuickLink, Priority } from './types/Task';
import { TaskList } from './components/TaskList';
import { QuickLinks } from './components/QuickLinks';
import { Moon, Sun, Plus, Trash2, Search, Keyboard } from 'lucide-react';
import { storage } from './utils/storage';

function App() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [links, setLinks] = useState<QuickLink[]>([]);
  const [darkMode, setDarkMode] = useState(false);
  const [newTask, setNewTask] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  // const [showShortcutHint, setShowShortcutHint] = useState(false);

  useEffect(() => {
    // Load tasks and links from storage
    storage.get(['tasks', 'links', 'darkMode']).then((result) => {
      if (result.tasks) setTasks(result.tasks);
      if (result.links) setLinks(result.links);
      if (result.darkMode !== undefined) {
        setDarkMode(result.darkMode);
        document.documentElement.classList.toggle('dark', result.darkMode);
      }
    });

    // Request notification permission
    if (Notification.permission === 'default') {
      Notification.requestPermission();
    }

    // Setup keyboard shortcut
    // const handleShortcut = (e: KeyboardEvent) => {
    //   if (e.ctrlKey && e.shiftKey && e.key.toLowerCase() === 't') {
    //     const task = prompt('Quick add task:');
    //     if (task) {
    //       addTask(task);
    //     }
    //   }
    // };

    // window.addEventListener('keydown', handleShortcut);
    // return () => window.removeEventListener('keydown', handleShortcut);
  }, []);

  useEffect(() => {
    // Save tasks and links to storage
    storage.set({ tasks, links, darkMode });
    // Apply dark mode
    document.documentElement.classList.toggle('dark', darkMode);
  }, [tasks, links, darkMode]);

  const addTask = (title: string) => {
    const task: Task = {
      id: crypto.randomUUID(),
      title,
      completed: false,
      pinned: false,
      order: tasks.length,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      priority: 'medium' as Priority,
      recurrence: null,
      subtasks: [],
      progress: 0,
    };

    setTasks([...tasks, task]);
  };

  const handleAddTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTask.trim()) return;
    addTask(newTask);
    setNewTask('');
  };

  const handleTaskUpdate = (updatedTask: Task) => {
    setTasks(tasks.map((t) => 
      t.id === updatedTask.id ? { ...updatedTask, updatedAt: new Date().toISOString() } : t
    ));
  };

  const handleTaskDelete = (taskId: string) => {
    setTasks(tasks.filter((t) => t.id !== taskId));
  };

  const handleTaskReorder = (startIndex: number, endIndex: number) => {
    const reorderedTasks = Array.from(tasks);
    const [removed] = reorderedTasks.splice(startIndex, 1);
    reorderedTasks.splice(endIndex, 0, removed);
    
    setTasks(reorderedTasks.map((task, index) => ({ ...task, order: index })));
  };

  const handleClearCompleted = () => {
    setTasks(tasks.filter((t) => !t.completed));
  };

  return (
    <div className="w-[400px] min-h-[500px] p-4 bg-white dark:bg-gray-800 dark:text-white">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">MinuteMind</h1>
        <div className="flex items-center gap-2">
          {/* <button
            onClick={() => setShowShortcutHint(!showShortcutHint)}
            className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700"
            title="Keyboard Shortcuts"
          >
            <Keyboard className="w-5 h-5" />
          </button> */}
          <button
            onClick={() => setDarkMode(!darkMode)}
            className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700"
          >
            {darkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* {showShortcutHint && (
        <div className="mb-4 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
          <p className="text-sm">
            Quick Add Task: <kbd className="px-2 py-1 bg-gray-100 dark:bg-gray-700 rounded">Ctrl</kbd> + <kbd className="px-2 py-1 bg-gray-100 dark:bg-gray-700 rounded">Shift</kbd> + <kbd className="px-2 py-1 bg-gray-100 dark:bg-gray-700 rounded">T</kbd>
          </p>
        </div>
      )} */}

      <QuickLinks
        links={links}
        onAddLink={(link) => setLinks([...links, link])}
        onRemoveLink={(id) => setLinks(links.filter((l) => l.id !== id))}
      />

      <div className="space-y-4">
        <form onSubmit={handleAddTask} className="flex gap-2">
          <input
            type="text"
            value={newTask}
            onChange={(e) => setNewTask(e.target.value)}
            placeholder="Add a new task..."
            className="flex-1 p-2 rounded border dark:bg-gray-700 dark:border-gray-600"
          />
          <button
            type="submit"
            className="p-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            <Plus className="w-5 h-5" />
          </button>
        </form>

        <div className="relative">
          <Search className="w-5 h-5 absolute left-2 top-1/2 transform -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search tasks..."
            className="w-full pl-9 p-2 rounded border dark:bg-gray-700 dark:border-gray-600"
          />
        </div>
      </div>

      <div className="mt-4">
        <TaskList
          tasks={tasks}
          onTaskUpdate={handleTaskUpdate}
          onTaskDelete={handleTaskDelete}
          onTaskReorder={handleTaskReorder}
          searchQuery={searchQuery}
        />
      </div>

      {tasks.some((t) => t.completed) && (
        <button
          onClick={handleClearCompleted}
          className="mt-4 flex items-center gap-2 px-4 py-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded"
        >
          <Trash2 className="w-4 h-4" />
          Clear completed tasks
        </button>
      )}
    </div>
  );
}

export default App;