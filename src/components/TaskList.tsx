import React, { useState } from 'react';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
import { Task, Priority, Subtask } from '../types/Task';
import { 
  Trash2, Pin, PinOff, Calendar, Check,
  AlertCircle, Clock, CheckCircle2, Timer,
  ChevronDown, ChevronUp, Plus, Square, 
  StopCircle, RefreshCw, Search
} from 'lucide-react';
import { format } from 'date-fns';

interface TaskListProps {
  tasks: Task[];
  onTaskUpdate: (task: Task) => void;
  onTaskDelete: (taskId: string) => void;
  onTaskReorder: (startIndex: number, endIndex: number) => void;
  searchQuery: string;
}

const COLORS = {
  'slate': 'bg-slate-500',
  'red': 'bg-red-500',
  'amber': 'bg-amber-500',
  'emerald': 'bg-emerald-500',
  'cyan': 'bg-cyan-500',
  'violet': 'bg-violet-500',
  'fuchsia': 'bg-fuchsia-500',
  'rose': 'bg-rose-500'
};

const COLOR_MAP = {
  'slate': 'border-slate-500',
  'red': 'border-red-500',
  'amber': 'border-amber-500',
  'emerald': 'border-emerald-500',
  'cyan': 'border-cyan-500',
  'violet': 'border-violet-500',
  'fuchsia': 'border-fuchsia-500',
  'rose': 'border-rose-500'
};

const PRIORITY_ICONS = {
  high: <AlertCircle className="w-4 h-4 text-red-500" />,
  medium: <Clock className="w-4 h-4 text-yellow-500" />,
  low: <CheckCircle2 className="w-4 h-4 text-green-500" />
};

export function TaskList({ tasks, onTaskUpdate, onTaskDelete, onTaskReorder, searchQuery }: TaskListProps) {
  const [expandedTask, setExpandedTask] = useState<string | null>(null);
  const [activePomodoro, setActivePomodoro] = useState<string | null>(null);
  const [pomodoroTime, setPomodoroTime] = useState(25 * 60);
  const [pomodoroInterval, setPomodoroInterval] = useState<NodeJS.Timeout | null>(null);

  const handleDragEnd = (result: any) => {
    if (!result.destination) return;
    onTaskReorder(result.source.index, result.destination.index);
  };

  const toggleTaskExpansion = (taskId: string) => {
    setExpandedTask(expandedTask === taskId ? null : taskId);
  };

  const updateSubtask = (taskId: string, subtask: Subtask) => {
    const task = tasks.find(t => t.id === taskId);
    if (!task) return;

    const updatedSubtasks = task.subtasks.map(s => 
      s.id === subtask.id ? subtask : s
    );

    const progress = Math.round(
      (updatedSubtasks.filter(s => s.status === 'completed').length / updatedSubtasks.length) * 100
    );

    onTaskUpdate({
      ...task,
      subtasks: updatedSubtasks,
      progress
    });
  };

  const addSubtask = (taskId: string) => {
    const task = tasks.find(t => t.id === taskId);
    if (!task) return;

    const newSubtask: Subtask = {
      id: crypto.randomUUID(),
      title: '',
      status: 'pending',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    onTaskUpdate({
      ...task,
      subtasks: [...task.subtasks, newSubtask]
    });
  };

  const startPomodoro = (taskId: string) => {
    if (pomodoroInterval) {
      clearInterval(pomodoroInterval);
    }
    
    setActivePomodoro(taskId);
    setPomodoroTime(25 * 60);

    const interval = setInterval(() => {
      setPomodoroTime(time => {
        if (time <= 0) {
          clearInterval(interval);
          setActivePomodoro(null);
          setPomodoroInterval(null);
          const task = tasks.find(t => t.id === taskId);
          if (task) {
            onTaskUpdate({
              ...task,
              pomodoroCount: (task.pomodoroCount || 0) + 1
            });
          }
          // Show browser notification
          if (Notification.permission === 'granted') {
            new Notification('Pomodoro Complete!', {
              body: 'Time for a break!',
              icon: '/icons/icon48.png'
            });
          }
          return 25 * 60;
        }
        return time - 1;
      });
    }, 1000);

    setPomodoroInterval(interval);
  };

  const stopPomodoro = () => {
    if (pomodoroInterval) {
      clearInterval(pomodoroInterval);
      setPomodoroInterval(null);
    }
    setActivePomodoro(null);
    setPomodoroTime(25 * 60);
  };

  const resetPomodoro = (taskId: string) => {
    stopPomodoro();
    startPomodoro(taskId);
  };

  const filteredTasks = tasks.filter(task => 
    task.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    task.subtasks.some(subtask => 
      subtask.title.toLowerCase().includes(searchQuery.toLowerCase())
    )
  );

  const sortedTasks = [...filteredTasks].sort((a, b) => {
    if (a.pinned && !b.pinned) return -1;
    if (!a.pinned && b.pinned) return 1;
    return a.order - b.order;
  });

  return (
    <DragDropContext onDragEnd={handleDragEnd}>
      <Droppable droppableId="tasks">
        {(provided) => (
          <div
            {...provided.droppableProps}
            ref={provided.innerRef}
            className="space-y-2"
          >
            {sortedTasks.map((task, index) => {
              const borderColorClass = task.color ? `border-l-4 ${COLOR_MAP[task.color.split('-')[0]]}` : '';
              return (
              <Draggable key={task.id} draggableId={task.id} index={index}>
                {(provided) => (
                  <div
                    ref={provided.innerRef}
                    {...provided.draggableProps}
                    {...provided.dragHandleProps}
                    className={`
                      flex flex-col gap-2 p-3 rounded-lg shadow-sm
                      ${task.completed ? 'bg-gray-100 dark:bg-gray-800' : 'bg-white dark:bg-gray-700'}
                      ${borderColorClass}
                      transition-all duration-200 hover:shadow-md
                    `}
                  >
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => onTaskUpdate({ ...task, completed: !task.completed })}
                        className="p-1 rounded-full hover:bg-gray-100 dark:hover:bg-gray-600"
                      >
                        <Check className={`w-5 h-5 ${task.completed ? 'text-green-500' : 'text-gray-400'}`} />
                      </button>
                      
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <p className={`${task.completed ? 'line-through text-gray-500' : ''}`}>
                            {task.title}
                          </p>
                          {PRIORITY_ICONS[task.priority]}
                        </div>
                        {task.dueDate && (
                          <p className="text-sm text-gray-500 flex items-center gap-1">
                            <Calendar className="w-4 h-4" />
                            {format(new Date(task.dueDate), 'MMM d, yyyy')}
                          </p>
                        )}
                      </div>

                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => toggleTaskExpansion(task.id)}
                          className="p-1 rounded-full hover:bg-gray-100 dark:hover:bg-gray-600"
                        >
                          {expandedTask === task.id ? 
                            <ChevronUp className="w-5 h-5" /> : 
                            <ChevronDown className="w-5 h-5" />
                          }
                        </button>
                        <button
                          onClick={() => onTaskUpdate({ ...task, pinned: !task.pinned })}
                          className="p-1 rounded-full hover:bg-gray-100 dark:hover:bg-gray-600"
                        >
                          {task.pinned ? (
                            <PinOff className="w-5 h-5 text-blue-500" />
                          ) : (
                            <Pin className="w-5 h-5 text-gray-400" />
                          )}
                        </button>
                        <button
                          onClick={() => onTaskDelete(task.id)}
                          className="p-1 rounded-full hover:bg-gray-100 dark:hover:bg-gray-600"
                        >
                          <Trash2 className="w-5 h-5 text-red-500" />
                        </button>
                      </div>
                    </div>

                    {expandedTask === task.id && (
                      <div className="mt-2 space-y-2">
                        <div className="flex flex-wrap gap-2">
                          {Object.entries(COLORS).map(([name, className]) => (
                            <button
                              key={name}
                              onClick={() => onTaskUpdate({ ...task, color: name })}
                              className={`
                                w-6 h-6 rounded-full ${className}
                                ${task.color === name ? 'ring-2 ring-offset-2' : ''}
                                transition-all duration-200 hover:opacity-80
                              `}
                            />
                          ))}
                        </div>

                        <div className="flex items-center gap-2">
                          <select
                            value={task.priority}
                            onChange={(e) => onTaskUpdate({ ...task, priority: e.target.value as Priority })}
                            className="p-1 rounded border dark:bg-gray-700 dark:border-gray-600"
                          >
                            <option value="low">Low Priority</option>
                            <option value="medium">Medium Priority</option>
                            <option value="high">High Priority</option>
                          </select>

                          <select
                            value={task.recurrence || ''}
                            onChange={(e) => onTaskUpdate({ ...task, recurrence: e.target.value || null })}
                            className="p-1 rounded border dark:bg-gray-700 dark:border-gray-600"
                          >
                            <option value="">No Recurrence</option>
                            <option value="daily">Daily</option>
                            <option value="weekly">Weekly</option>
                            <option value="monthly">Monthly</option>
                          </select>
                        </div>

                        {task.subtasks.length > 0 && (
                          <div className="mt-2">
                            <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                              <div 
                                className="h-full bg-green-500 transition-all duration-300"
                                style={{ width: `${task.progress}%` }}
                              />
                            </div>
                          </div>
                        )}

                        <div className="space-y-2">
                          {task.subtasks.map(subtask => (
                            <div key={subtask.id} className="flex items-center gap-2">
                              <select
                                value={subtask.status}
                                onChange={(e) => updateSubtask(task.id, { ...subtask, status: e.target.value as TaskStatus })}
                                className="p-1 rounded border dark:bg-gray-700 dark:border-gray-600"
                              >
                                <option value="pending">Pending</option>
                                <option value="in-progress">In Progress</option>
                                <option value="completed">Completed</option>
                              </select>
                              <input
                                type="text"
                                value={subtask.title}
                                onChange={(e) => updateSubtask(task.id, { ...subtask, title: e.target.value })}
                                placeholder="Subtask title..."
                                className="flex-1 p-1 rounded border dark:bg-gray-700 dark:border-gray-600"
                              />
                            </div>
                          ))}
                          <button
                            onClick={() => addSubtask(task.id)}
                            className="flex items-center gap-1 text-blue-500 hover:text-blue-600"
                          >
                            <Plus className="w-4 h-4" /> Add Subtask
                          </button>
                        </div>

                        <div className="flex items-center gap-2">
                          {activePomodoro === task.id ? (
                            <>
                              <button
                                onClick={stopPomodoro}
                                className="flex items-center gap-1 px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600"
                              >
                                <StopCircle className="w-4 h-4" /> Stop
                              </button>
                              <button
                                onClick={() => resetPomodoro(task.id)}
                                className="flex items-center gap-1 px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600"
                              >
                                <RefreshCw className="w-4 h-4" /> Reset
                              </button>
                              <span className="font-mono">
                                {Math.floor(pomodoroTime / 60)}:{(pomodoroTime % 60).toString().padStart(2, '0')}
                              </span>
                            </>
                          ) : (
                            <button
                              onClick={() => startPomodoro(task.id)}
                              disabled={activePomodoro !== null}
                              className="flex items-center gap-1 px-3 py-1 bg-green-500 text-white rounded hover:bg-green-600 disabled:opacity-50"
                            >
                              <Timer className="w-4 h-4" /> Start Pomodoro
                            </button>
                          )}
                          {task.pomodoroCount && (
                            <span className="text-sm text-gray-500">
                              Completed: {task.pomodoroCount} pomodoros
                            </span>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </Draggable>
              )})}
            {provided.placeholder}
          </div>
        )}
      </Droppable>
    </DragDropContext>
  );
}