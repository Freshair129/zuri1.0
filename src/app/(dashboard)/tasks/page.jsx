'use client';

// Tasks — Task board page
// Kanban-style board supporting three task types:
//   SINGLE  — one-off standalone task
//   RANGE   — task with a start and end date (multi-day)
//   PROJECT — grouped tasks under a project umbrella with sub-tasks

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

const COLUMNS = ['PENDING', 'IN_PROGRESS', 'REVIEW', 'COMPLETED'];
const COLUMN_LABELS = { PENDING: 'To Do', IN_PROGRESS: 'In Progress', REVIEW: 'Review', COMPLETED: 'Done' };

const TASK_TYPE_COLORS = {
  SINGLE: 'bg-blue-100 text-blue-700',
  RANGE: 'bg-purple-100 text-purple-700',
  PROJECT: 'bg-orange-100 text-orange-700',
};

const PRIORITY_COLORS = {
  L1: 'bg-red-500', // Urgent
  L2: 'bg-orange-400', // High
  L3: 'bg-yellow-400', // Medium
  L4: 'bg-gray-300', // Low
};

export default function TasksPage() {
  const router = useRouter();
  const [view, setView] = useState('Board'); // Board | List | Timeline
  const [typeFilter, setTypeFilter] = useState('All');
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchTasks();
  }, [typeFilter]);

  async function fetchTasks() {
    setLoading(true);
    try {
      const url = new URL('/api/tasks', window.location.origin);
      if (typeFilter !== 'All') url.searchParams.set('taskType', typeFilter);
      
      const res = await fetch(url);
      if (res.ok) {
        const json = await res.json();
        setTasks(json.data || []);
      }
    } catch (error) {
      console.error('Failed to fetch tasks', error);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="p-6 space-y-6">

      {/* Page header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Tasks</h1>
          <p className="text-sm text-gray-500 mt-0.5">Manage one-off tasks, date ranges, and projects</p>
        </div>
        <div className="flex gap-2">
          {/* View toggle */}
          <div className="flex border border-gray-200 rounded-lg overflow-hidden bg-white">
            {['Board', 'List', 'Timeline'].map((v) => (
              <button
                key={v}
                onClick={() => setView(v)}
                className={`px-3 py-1.5 text-sm font-medium transition-colors ${
                  view === v ? 'bg-orange-500 text-white' : 'text-gray-500 hover:bg-gray-50'
                }`}
              >
                {v}
              </button>
            ))}
          </div>
          {/* TODO: New task button → type selector modal */}
          <div className="h-9 w-28 bg-orange-500 rounded-lg" />
        </div>
      </div>

      {/* Filters bar */}
      <div className="flex flex-wrap gap-3 items-center">
        {/* Search */}
        <div className="flex-1 min-w-48 h-9 bg-white border border-gray-200 rounded-lg flex items-center px-3 gap-2">
          <div className="h-4 w-4 bg-gray-300 rounded-sm flex-shrink-0" />
          <div className="h-4 w-28 bg-gray-100 rounded" />
        </div>
        {/* Type filter pills */}
        <div className="flex gap-2">
          {['All', 'SINGLE', 'RANGE', 'PROJECT'].map((t) => (
            <button
              key={t}
              onClick={() => setTypeFilter(t)}
              className={`px-3 py-1 rounded-full text-xs font-semibold transition-colors ${
                typeFilter === t
                  ? 'bg-orange-500 text-white'
                  : t in TASK_TYPE_COLORS
                  ? `${TASK_TYPE_COLORS[t]} hover:opacity-80`
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              {t}
            </button>
          ))}
        </div>
        {/* TODO: Assignee filter */}
        <div className="h-9 w-32 bg-white border border-gray-200 rounded-lg" />
        {/* TODO: Due date filter */}
        <div className="h-9 w-36 bg-white border border-gray-200 rounded-lg" />
      </div>

      {/* Board view */}
      {view === 'Board' && (
        <div className="flex gap-4 overflow-x-auto pb-4">
          {COLUMNS.map((col) => (
            <div key={col} className="flex-shrink-0 w-72">
              {/* Column header */}
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <h3 className="text-sm font-semibold text-gray-700">{COLUMN_LABELS[col]}</h3>
                  {/* TODO: task count badge */}
                  <div className="h-5 w-5 bg-gray-100 rounded-full flex items-center justify-center text-[10px] text-gray-500 font-medium">
                    {tasks.filter(t => t.status === col).length}
                  </div>
                </div>
                {/* TODO: add task to column button */}
                <div className="h-6 w-6 bg-gray-100 rounded hover:bg-gray-200 cursor-pointer" />
              </div>

              {/* Task cards */}
              {/* TODO: map over tasks for this column, render TaskCard, support dnd-kit drag */}
              <div className="space-y-3">
                {loading ? (
                  <div className="text-sm text-gray-400 p-2">Loading...</div>
                ) : tasks.filter(t => t.status === col).map((task) => {
                  const taskType = task.taskType || 'SINGLE';
                  return (
                    <div
                      key={task.id}
                      className="bg-white rounded-xl border border-gray-100 shadow-sm p-4 space-y-3 hover:shadow-md hover:border-orange-200 transition-all cursor-pointer"
                    >
                      {/* Type badge + priority */}
                      <div className="flex items-center justify-between">
                        <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${TASK_TYPE_COLORS[taskType] || 'bg-gray-100 text-gray-600'}`}>
                          {taskType}
                        </span>
                        {/* priority indicator */}
                        <div className={`h-4 w-4 ${PRIORITY_COLORS[task.priority] || 'bg-gray-200'} rounded`} title={task.priority} />
                      </div>

                      {/* Task title */}
                      <div className="text-sm font-medium text-gray-800 leading-snug">{task.title}</div>
                      {taskType !== 'SINGLE' && task.description && (
                         <div className="text-xs text-gray-500 line-clamp-2">{task.description}</div>
                      )}

                      {/* RANGE: date range display */}
                      {taskType === 'RANGE' && task.startDate && task.dueDate && (
                        <div className="flex items-center gap-2">
                          <div className="h-3 w-3 bg-purple-200 rounded-sm" />
                          <div className="h-3 w-28 bg-gray-100 rounded" />
                        </div>
                      )}

                      {/* PROJECT: sub-task progress */}
                      {taskType === 'PROJECT' && (
                        <div className="space-y-1">
                          <div className="flex justify-between">
                            <div className="h-3 w-16 bg-gray-100 rounded" />
                            <div className="h-3 w-8 bg-gray-100 rounded" />
                          </div>
                          <div className="h-1.5 bg-gray-100 rounded-full">
                            <div className="h-1.5 bg-orange-400 rounded-full" style={{ width: `${30 + i * 20}%` }} />
                          </div>
                        </div>
                      )}

                      {/* Footer: assignee(s) + due date */}
                      <div className="flex items-center justify-between pt-1 border-t border-gray-50">
                        {/* Assignee avatars */}
                        <div className="flex -space-x-1">
                          {Array.from({ length: 2 }).map((_, a) => (
                            <div key={a} className="h-6 w-6 rounded-full bg-gray-200 border-2 border-white" />
                          ))}
                        </div>
                        {/* Due date */}
                        <div className="h-4 w-16 bg-gray-100 rounded" />
                      </div>
                    </div>
                  );
                })}
                {/* Add task placeholder */}
                <button className="w-full h-10 border border-dashed border-gray-200 rounded-xl text-sm text-gray-400 hover:border-orange-300 hover:text-orange-500 transition-colors">
                  + Add task
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* List view */}
      {view === 'List' && (
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="grid grid-cols-12 gap-3 px-4 py-3 border-b border-gray-100 bg-gray-50 text-xs font-semibold text-gray-500 uppercase tracking-wide">
            <div className="col-span-4">Task</div>
            <div className="col-span-1">Type</div>
            <div className="col-span-2">Assignee</div>
            <div className="col-span-2">Due / Range</div>
            <div className="col-span-1">Priority</div>
            <div className="col-span-2">Status</div>
          </div>
          {loading ? (
            <div className="p-4 text-center text-sm text-gray-500">Loading...</div>
          ) : tasks.length === 0 ? (
            <div className="p-4 text-center text-sm text-gray-500">No tasks found.</div>
          ) : tasks.map((task) => {
            const taskType = task.taskType || 'SINGLE';
            return (
              <div key={task.id} className="grid grid-cols-12 gap-3 px-4 py-3 border-b border-gray-50 hover:bg-orange-50/20 items-center">
                <div className="col-span-4 space-y-0.5">
                  <div className="text-sm font-medium text-gray-800">{task.title}</div>
                  {taskType === 'PROJECT' && <div className="h-3 w-32 bg-gray-100 rounded" />}
                </div>
                <div className="col-span-1">
                  <span className={`text-xs font-semibold px-1.5 py-0.5 rounded-full ${TASK_TYPE_COLORS[taskType] || 'bg-gray-100 text-gray-600'}`}>
                    {taskType}
                  </span>
                </div>
                <div className="col-span-2 flex -space-x-1">
                  {/* TODO: Assignee avatar */}
                  <div className="h-6 w-6 rounded-full bg-gray-200 border-2 border-white flex items-center justify-center text-[10px] text-gray-500">
                    A
                  </div>
                </div>
                <div className="col-span-2 text-xs text-gray-600">
                  {task.dueDate ? new Date(task.dueDate).toLocaleDateString() : '-'}
                </div>
                <div className="col-span-1">
                  <div className={`h-4 w-12 rounded-full ${PRIORITY_COLORS[task.priority] || 'bg-gray-200'}`} title={task.priority} />
                </div>
                <div className="col-span-2">
                  <span className="text-xs px-2 py-1 bg-blue-50 text-blue-700 rounded-full font-medium">
                    {COLUMN_LABELS[task.status] || task.status}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Timeline view */}
      {view === 'Timeline' && (
        // TODO: Gantt-style timeline using a library (e.g. react-gantt-timeline or custom Canvas render)
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-8 flex items-center justify-center">
          <div className="text-center space-y-2">
            <div className="h-12 w-12 bg-orange-50 rounded-full mx-auto" />
            <p className="text-sm font-medium text-gray-600">Timeline view</p>
            <p className="text-xs text-gray-400">TODO: Implement Gantt / timeline chart for RANGE and PROJECT tasks</p>
          </div>
        </div>
      )}
    </div>
  );
}
