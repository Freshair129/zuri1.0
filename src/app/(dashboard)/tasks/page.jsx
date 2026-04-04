'use client';

// Tasks — Task board page
// Kanban-style board supporting three task types:
//   SINGLE  — one-off standalone task
//   RANGE   — task with a start and end date (multi-day)
//   PROJECT — grouped tasks under a project umbrella with sub-tasks

import { useState } from 'react';

const COLUMNS = ['To Do', 'In Progress', 'Review', 'Done'];

const TASK_TYPE_COLORS = {
  SINGLE: 'bg-primary/10 text-primary border border-primary/20',
  RANGE: 'bg-[#0B2D5E]/10 text-[#0B2D5E] border border-[#0B2D5E]/20',
  PROJECT: 'gold-gradient text-[#0B2D5E] border border-primary',
};

const MOCK_TYPES = ['SINGLE', 'RANGE', 'PROJECT'];

export default function TasksPage() {
  const [view, setView] = useState('Board'); // Board | List | Timeline
  const [typeFilter, setTypeFilter] = useState('All');

  return (
    <div className="p-8 space-y-8 bg-surface min-h-[calc(100vh-64px)] overflow-x-hidden">

      {/* Page header */}
      <div className="flex items-center justify-between">
        <div className="ornate-lead">
          <span className="font-label uppercase tracking-[0.2em] text-xs text-primary font-bold">Operational Control</span>
          <h1 className="text-3xl font-extrabold text-on-surface font-headline mt-1">Tasks</h1>
          <p className="text-sm text-secondary font-body mt-0.5">Manage one-off tasks, date ranges, and projects</p>
        </div>
        <div className="flex gap-3">
          {/* View toggle */}
          <div className="flex border border-outline-variant/30 rounded-xl overflow-hidden bg-surface-container-lowest shadow-sm h-10">
            {['Board', 'List', 'Timeline'].map((v) => (
              <button
                key={v}
                onClick={() => setView(v)}
                className={`px-4 py-2 font-label text-[10px] uppercase font-bold tracking-widest transition-colors flex items-center gap-2 ${
                  view === v ? 'bg-primary/10 text-primary' : 'text-secondary hover:bg-surface-container-low'
                }`}
              >
                <span className="material-symbols-outlined text-[1rem]">
                  {v === 'Board' ? 'view_kanban' : v === 'List' ? 'format_list_bulleted' : 'view_timeline'}
                </span>
                {v}
              </button>
            ))}
          </div>
          {/* New task button */}
          <button className="h-10 px-6 gold-gradient rounded-xl font-label text-xs uppercase font-bold tracking-widest text-[#0B2D5E] shadow-sm hover:shadow-primary/30 transition-all">
            New Task
          </button>
        </div>
      </div>

      {/* Filters bar */}
      <div className="flex flex-wrap gap-4 items-center">
        {/* Search */}
        <div className="flex-1 min-w-48 h-12 bg-surface-container-lowest border border-outline-variant/30 rounded-xl flex items-center px-4 gap-3 focus-within:border-primary transition-colors hover:shadow-floating">
          <span className="material-symbols-outlined text-outline">search</span>
          <div className="h-4 w-36 bg-outline-variant/20 rounded" />
        </div>
        {/* Type filter pills */}
        <div className="flex gap-2">
          {['All', 'SINGLE', 'RANGE', 'PROJECT'].map((t) => (
            <button
              key={t}
              onClick={() => setTypeFilter(t)}
              className={`px-4 py-2 rounded-full text-[10px] uppercase font-label font-bold tracking-widest transition-colors border ${
                typeFilter === t
                  ? 'gold-gradient text-[#0B2D5E] border-primary shadow-sm'
                  : t !== 'All'
                  ? `${TASK_TYPE_COLORS[t]} hover:opacity-80`
                  : 'bg-surface-container-lowest text-secondary border-outline-variant/30 hover:bg-surface-container-low'
              }`}
            >
              {t}
            </button>
          ))}
        </div>
        {/* Assignee filter */}
        <div className="h-12 w-32 px-4 bg-surface-container-lowest border border-outline-variant/30 rounded-xl flex items-center justify-center text-secondary font-label text-xs uppercase tracking-widest font-bold cursor-pointer hover:bg-surface-container-low transition-colors">
          Assignee
        </div>
        {/* Due date filter */}
        <div className="h-12 w-36 px-4 bg-surface-container-lowest border border-outline-variant/30 rounded-xl flex items-center justify-center text-secondary font-label text-xs uppercase tracking-widest font-bold cursor-pointer hover:bg-surface-container-low transition-colors">
          Due Date
        </div>
      </div>

      {/* Board view */}
      {view === 'Board' && (
        <div className="flex gap-6 overflow-x-auto pb-6 custom-scrollbar">
          {COLUMNS.map((col) => (
            <div key={col} className="flex-shrink-0 w-80">
              {/* Column header */}
              <div className="flex items-center justify-between mb-4 bg-surface-container-low/50 py-3 px-4 rounded-xl border border-outline-variant/15">
                <div className="flex items-center gap-3">
                  <h3 className="text-sm font-label uppercase tracking-widest font-bold text-on-surface">{col}</h3>
                  <div className="h-6 w-6 bg-surface-container-highest rounded-full flex items-center justify-center text-[10px] font-bold text-secondary">
                    {col === 'To Do' ? 4 : col === 'In Progress' ? 3 : col === 'Review' ? 2 : 1}
                  </div>
                </div>
                <div className="h-7 w-7 rounded-lg flex items-center justify-center text-secondary hover:bg-primary/10 hover:text-primary transition-colors cursor-pointer">
                  <span className="material-symbols-outlined text-[1.2rem]">add</span>
                </div>
              </div>

              {/* Task cards */}
              <div className="space-y-4">
                {Array.from({ length: col === 'To Do' ? 4 : col === 'In Progress' ? 3 : col === 'Review' ? 2 : 1 }).map((_, i) => {
                  const taskType = MOCK_TYPES[(i + col.length) % 3];
                  return (
                    <div
                      key={i}
                      className="bg-surface-container-lowest rounded-2xl border border-outline-variant/15 shadow-sm p-5 space-y-4 hover:shadow-floating hover:border-primary/50 transition-all cursor-pointer group"
                    >
                      {/* Type badge + priority */}
                      <div className="flex items-center justify-between">
                        <span className={`text-[9px] uppercase font-label font-bold tracking-widest px-2.5 py-1 rounded-full ${TASK_TYPE_COLORS[taskType]}`}>
                          {taskType}
                        </span>
                        <div className="h-5 w-5 bg-error/10 text-error rounded flex items-center justify-center">
                          <span className="material-symbols-outlined text-[12px]">keyboard_double_arrow_up</span>
                        </div>
                      </div>

                      {/* Task title */}
                      <div className="space-y-1.5">
                        <div className="h-5 w-full bg-on-surface/10 rounded" />
                        {taskType !== 'SINGLE' && (
                          <div className="h-4 w-4/5 bg-secondary/10 rounded" />
                        )}
                      </div>

                      {/* RANGE: date range display */}
                      {taskType === 'RANGE' && (
                        <div className="flex items-center gap-2 bg-[#0B2D5E]/5 py-1 px-2 rounded-md border border-[#0B2D5E]/10 w-fit">
                          <span className="material-symbols-outlined text-[12px] text-[#0B2D5E]">calendar_month</span>
                          <div className="h-3 w-28 bg-[#0B2D5E]/10 rounded" />
                        </div>
                      )}

                      {/* PROJECT: sub-task progress */}
                      {taskType === 'PROJECT' && (
                        <div className="space-y-2 bg-primary/5 p-3 rounded-lg border border-primary/10">
                          <div className="flex justify-between items-center">
                            <span className="text-[10px] uppercase font-label font-bold text-primary">Progress</span>
                            <span className="text-[10px] font-bold text-primary opacity-60">3 / 8</span>
                          </div>
                          <div className="h-2 bg-primary/10 rounded-full overflow-hidden">
                            <div className="h-full bg-primary" style={{ width: `${30 + i * 20}%` }} />
                          </div>
                        </div>
                      )}

                      {/* Footer: assignee(s) + due date */}
                      <div className="flex items-center justify-between pt-3 border-t border-outline-variant/15">
                        {/* Assignee avatars */}
                        <div className="flex -space-x-2">
                          {Array.from({ length: 2 }).map((_, a) => (
                            <div key={a} className="h-7 w-7 rounded-full bg-surface-container-high border-2 border-surface flex items-center justify-center text-secondary">
                              <span className="material-symbols-outlined text-[14px]">person</span>
                            </div>
                          ))}
                        </div>
                        {/* Due date */}
                        <div className="flex items-center gap-1.5 text-secondary">
                           <span className="material-symbols-outlined text-[14px]">schedule</span>
                           <div className="h-4 w-12 bg-secondary/10 rounded" />
                        </div>
                      </div>
                    </div>
                  );
                })}
                {/* Add task placeholder */}
                <button className="w-full h-12 border border-dashed border-outline-variant/30 rounded-2xl font-label text-xs uppercase font-bold tracking-widest text-secondary hover:border-primary hover:text-primary hover:bg-primary/5 transition-colors flex items-center justify-center gap-2">
                  <span className="material-symbols-outlined text-[1rem]">add</span>
                  Add Task
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* List view */}
      {view === 'List' && (
        <div className="bg-surface-container-lowest rounded-2xl border border-outline-variant/15 shadow-sm overflow-hidden">
          <div className="grid grid-cols-12 gap-4 px-6 py-4 border-b border-outline-variant/15 bg-surface-container-low/50 text-[10px] font-label font-bold text-secondary uppercase tracking-widest">
            <div className="col-span-4">Task</div>
            <div className="col-span-1">Type</div>
            <div className="col-span-2">Assignee</div>
            <div className="col-span-2">Due / Range</div>
            <div className="col-span-1">Priority</div>
            <div className="col-span-2">Status</div>
          </div>
          {Array.from({ length: 10 }).map((_, i) => {
            const taskType = MOCK_TYPES[i % 3];
            return (
              <div key={i} className="grid grid-cols-12 gap-4 px-6 py-4 border-b border-surface hover:bg-surface-container-low transition-colors items-center group cursor-pointer">
                <div className="col-span-4 space-y-1.5">
                  <div className="h-4 w-48 bg-on-surface/10 rounded" />
                  {taskType === 'PROJECT' && <div className="h-3 w-32 bg-secondary/20 rounded" />}
                </div>
                <div className="col-span-1">
                  <span className={`text-[9px] uppercase font-label font-bold tracking-widest px-2 py-1 rounded-full ${TASK_TYPE_COLORS[taskType]}`}>
                    {taskType}
                  </span>
                </div>
                <div className="col-span-2 flex -space-x-1.5">
                  <div className="h-7 w-7 rounded-full bg-surface-container-high border-2 border-surface flex items-center justify-center text-secondary">
                    <span className="material-symbols-outlined text-[12px]">person</span>
                  </div>
                  <div className="h-7 w-7 rounded-full bg-surface-container border-2 border-surface flex items-center justify-center text-secondary">
                    <span className="material-symbols-outlined text-[12px]">person</span>
                  </div>
                </div>
                <div className="col-span-2"><div className="h-4 w-24 bg-on-surface/5 rounded" /></div>
                <div className="col-span-1"><div className="h-5 w-12 bg-error/10 text-error rounded-full flex items-center justify-center"><span className="material-symbols-outlined text-[14px]">keyboard_double_arrow_up</span></div></div>
                <div className="col-span-2">
                  <div className="h-6 w-24 bg-[#0B2D5E]/10 text-[#0B2D5E] font-label font-bold uppercase tracking-widest text-[9px] flex items-center justify-center rounded-full">
                    In Progress
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Timeline view */}
      {view === 'Timeline' && (
        <div className="bg-surface-container-lowest rounded-2xl border border-outline-variant/15 shadow-sm p-12 flex items-center justify-center min-h-[400px]">
          <div className="text-center space-y-4 max-w-sm">
            <div className="h-16 w-16 bg-primary/10 rounded-full mx-auto flex items-center justify-center text-primary">
              <span className="material-symbols-outlined text-3xl">view_timeline</span>
            </div>
            <p className="text-sm font-label uppercase tracking-[0.2em] font-bold text-on-surface">Timeline View</p>
            <p className="text-sm text-secondary font-body thai-line-height">
              Gantt-style timeline chart is currently under development. Stay tuned for advanced operational planning features.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
