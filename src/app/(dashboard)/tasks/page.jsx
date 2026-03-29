'use client';

// Tasks — Task board page
// Kanban-style board supporting three task types:
//   SINGLE  — one-off standalone task
//   RANGE   — task with a start and end date (multi-day)
//   PROJECT — grouped tasks under a project umbrella with sub-tasks

import { useState } from 'react';

const COLUMNS = ['To Do', 'In Progress', 'Review', 'Done'];

const TASK_TYPE_COLORS = {
  SINGLE: 'bg-blue-100 text-blue-700',
  RANGE: 'bg-purple-100 text-purple-700',
  PROJECT: 'bg-orange-100 text-orange-700',
};

const MOCK_TYPES = ['SINGLE', 'RANGE', 'PROJECT'];

export default function TasksPage() {
  const [view, setView] = useState('Board'); // Board | List | Timeline
  const [typeFilter, setTypeFilter] = useState('All');

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
                  <h3 className="text-sm font-semibold text-gray-700">{col}</h3>
                  {/* TODO: task count badge */}
                  <div className="h-5 w-5 bg-gray-100 rounded-full" />
                </div>
                {/* TODO: add task to column button */}
                <div className="h-6 w-6 bg-gray-100 rounded hover:bg-gray-200 cursor-pointer" />
              </div>

              {/* Task cards */}
              {/* TODO: map over tasks for this column, render TaskCard, support dnd-kit drag */}
              <div className="space-y-3">
                {Array.from({ length: col === 'To Do' ? 4 : col === 'In Progress' ? 3 : col === 'Review' ? 2 : 1 }).map((_, i) => {
                  const taskType = MOCK_TYPES[(i + col.length) % 3];
                  return (
                    <div
                      key={i}
                      className="bg-white rounded-xl border border-gray-100 shadow-sm p-4 space-y-3 hover:shadow-md hover:border-orange-200 transition-all cursor-pointer"
                    >
                      {/* Type badge + priority */}
                      <div className="flex items-center justify-between">
                        <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${TASK_TYPE_COLORS[taskType]}`}>
                          {taskType}
                        </span>
                        {/* TODO: priority indicator (Low / Medium / High / Urgent) */}
                        <div className="h-4 w-4 bg-gray-200 rounded" />
                      </div>

                      {/* Task title */}
                      <div className="h-4 w-full bg-gray-200 rounded" />
                      {taskType !== 'SINGLE' && (
                        <div className="h-3.5 w-4/5 bg-gray-100 rounded" />
                      )}

                      {/* RANGE: date range display */}
                      {taskType === 'RANGE' && (
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
          {/* TODO: map over all tasks sorted by due date */}
          {Array.from({ length: 10 }).map((_, i) => {
            const taskType = MOCK_TYPES[i % 3];
            return (
              <div key={i} className="grid grid-cols-12 gap-3 px-4 py-3 border-b border-gray-50 hover:bg-orange-50/20 items-center">
                <div className="col-span-4 space-y-0.5">
                  <div className="h-4 w-48 bg-gray-200 rounded" />
                  {taskType === 'PROJECT' && <div className="h-3 w-32 bg-gray-100 rounded" />}
                </div>
                <div className="col-span-1">
                  <span className={`text-xs font-semibold px-1.5 py-0.5 rounded-full ${TASK_TYPE_COLORS[taskType]}`}>
                    {taskType}
                  </span>
                </div>
                <div className="col-span-2 flex -space-x-1">
                  <div className="h-6 w-6 rounded-full bg-gray-200 border-2 border-white" />
                  <div className="h-6 w-6 rounded-full bg-gray-100 border-2 border-white" />
                </div>
                <div className="col-span-2"><div className="h-4 w-24 bg-gray-100 rounded" /></div>
                <div className="col-span-1"><div className="h-4 w-12 bg-yellow-100 rounded-full" /></div>
                <div className="col-span-2"><div className="h-5 w-20 bg-blue-50 rounded-full" /></div>
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
