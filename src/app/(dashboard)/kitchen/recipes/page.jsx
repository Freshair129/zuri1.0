'use client';

// Kitchen — Recipe list page
// Browse and manage the school's recipe library.
// Recipes are linked to courses; each recipe has ingredients, steps, and cost breakdown.

import { useState } from 'react';

const CATEGORY_FILTERS = ['All', 'Appetizers', 'Mains', 'Desserts', 'Pastry', 'Sauces', 'Beverages'];

export default function RecipesPage() {
  const [category, setCategory] = useState('All');
  const [view, setView] = useState('Grid');

  return (
    <div className="p-8 space-y-8 bg-surface min-h-[calc(100vh-64px)]">

      {/* Page header */}
      <div className="flex items-center justify-between">
        <div className="ornate-lead">
          <span className="font-label uppercase tracking-[0.2em] text-xs text-primary font-bold">Kitchen Intelligence</span>
          <h1 className="text-3xl font-extrabold text-on-surface font-headline mt-1">Recipe Library</h1>
          <p className="text-sm text-secondary font-body mt-0.5">Manage the culinary school recipe library</p>
        </div>
        <div className="flex gap-3">
          {/* Import recipe button */}
          <button className="h-10 px-4 bg-surface-container-lowest text-secondary rounded-lg font-label text-xs uppercase font-bold tracking-widest border border-outline-variant/30 hover:bg-surface-container-low transition-all">
            Import Recipes
          </button>
          {/* New recipe button */}
          <button className="h-10 px-6 gold-gradient rounded-lg font-label text-xs uppercase font-bold tracking-widest text-[#0B2D5E] shadow-sm hover:shadow-primary/30 transition-all">
            New Recipe
          </button>
        </div>
      </div>

      {/* Search + filter toolbar */}
      <div className="flex flex-col sm:flex-row gap-4 items-center">
        <div className="flex-1 w-full h-12 bg-surface-container-lowest border border-outline-variant/30 rounded-xl flex items-center px-4 gap-3 focus-within:border-primary transition-colors">
          <span className="material-symbols-outlined text-outline">search</span>
          <div className="h-4 w-40 bg-outline-variant/20 rounded" />
        </div>
        {/* difficulty filter */}
        <div className="h-12 w-32 px-4 bg-surface-container-lowest border border-outline-variant/30 rounded-xl flex items-center justify-center text-secondary font-label text-xs uppercase tracking-widest font-bold cursor-pointer hover:bg-surface-container-low transition-colors">
          Difficulty
        </div>
        {/* sort by */}
        <div className="h-12 w-36 px-4 bg-surface-container-lowest border border-outline-variant/30 rounded-xl flex items-center justify-center text-secondary font-label text-xs uppercase tracking-widest font-bold cursor-pointer hover:bg-surface-container-low transition-colors">
          Sort by
        </div>
        {/* Grid / List toggle */}
        <div className="flex border border-outline-variant/30 rounded-xl overflow-hidden bg-surface-container-lowest shadow-sm h-12">
          {['Grid', 'List'].map((m) => (
            <button
              key={m}
              onClick={() => setView(m)}
              className={`px-4 py-2 font-label text-[10px] uppercase font-bold tracking-widest transition-colors ${
                view === m ? 'bg-primary/10 text-primary' : 'text-secondary hover:bg-surface-container-low'
              }`}
            >
              <span className="material-symbols-outlined text-[1.2rem]">{m === 'Grid' ? 'grid_view' : 'list'}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Category pills */}
      <div className="flex gap-2 flex-wrap">
        {CATEGORY_FILTERS.map((c) => (
          <button
            key={c}
            onClick={() => setCategory(c)}
            className={`px-4 py-2 rounded-full text-[10px] uppercase tracking-widest font-label font-bold transition-all border ${
              category === c ? 'gold-gradient text-[#0B2D5E] border-primary shadow-sm' : 'bg-surface-container-lowest text-secondary hover:bg-surface-container-low border-outline-variant/30'
            }`}
          >
            {c}
          </button>
        ))}
      </div>

      {/* Recipe cards */}
      <div className={view === 'Grid' ? 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6' : 'space-y-4'}>
        {Array.from({ length: 8 }).map((_, i) => (
          <div
            key={i}
            className={`bg-surface-container-lowest rounded-2xl border border-outline-variant/15 shadow-sm overflow-hidden hover:shadow-floating hover:border-primary/50 transition-all cursor-pointer group ${view === 'List' ? 'flex flex-row items-center p-4' : ''}`}
          >
            {view === 'Grid' ? (
              <div className="h-40 bg-surface-container-low relative overflow-hidden flex items-center justify-center text-outline-variant/30 group-hover:bg-primary/5 transition-colors">
                <span className="material-symbols-outlined text-5xl">menu_book</span>
                <div className="absolute top-3 right-3 h-8 w-8 bg-surface/80 rounded-full flex items-center justify-center text-secondary hover:text-primary transition-colors">
                  <span className="material-symbols-outlined text-[1rem]">more_horiz</span>
                </div>
              </div>
            ) : (
              <div className="h-16 w-16 bg-surface-container-low rounded-xl flex items-center justify-center text-outline-variant/30 mr-4 group-hover:bg-primary/5 transition-colors">
                <span className="material-symbols-outlined text-2xl">menu_book</span>
              </div>
            )}
            <div className={`p-5 space-y-3 ${view === 'List' ? 'flex-1 p-0 space-y-0 flex items-center justify-between' : ''}`}>
              <div className={`${view === 'List' ? 'flex items-center gap-4' : 'flex flex-col gap-2'}`}>
                {/* Recipe name */}
                <div className="h-5 w-40 bg-on-surface/10 rounded" />
                {/* Difficulty badge */}
                <div className="h-5 w-16 bg-primary/20 rounded-full flex-shrink-0" />
              </div>
              
              <div className={`${view === 'List' ? 'flex gap-8' : 'space-y-3'}`}>
                {/* Category + prep time */}
                <div className="flex gap-2">
                  <div className="h-3.5 w-16 bg-secondary/20 rounded" />
                  <div className="h-3.5 w-14 bg-secondary/10 rounded" />
                </div>
                {/* cost per portion */}
                <div className={`flex items-center justify-between ${view === 'List' ? 'gap-6' : 'pt-3 border-t border-outline-variant/15'}`}>
                  <div className="space-y-1">
                    <div className="h-3 w-20 bg-secondary/10 rounded" />
                    <div className="h-4 w-16 bg-primary/20 rounded" />
                  </div>
                  {/* Linked courses pill */}
                  <div className="h-6 w-24 bg-surface-container-low border border-outline-variant/30 rounded-full" />
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
