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
    <div className="p-6 space-y-6">

      {/* Page header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Recipes</h1>
          <p className="text-sm text-gray-500 mt-0.5">Manage the culinary school recipe library</p>
        </div>
        <div className="flex gap-2">
          {/* TODO: Import recipe button */}
          <div className="h-9 w-28 bg-white border border-gray-200 rounded-lg" />
          {/* TODO: New recipe button → recipe builder modal / page */}
          <div className="h-9 w-28 bg-orange-500 rounded-lg" />
        </div>
      </div>

      {/* Search + filter toolbar */}
      <div className="flex flex-col sm:flex-row gap-3 items-center">
        <div className="flex-1 w-full h-10 bg-white border border-gray-200 rounded-lg flex items-center px-3 gap-2">
          <div className="h-4 w-4 bg-gray-300 rounded-sm flex-shrink-0" />
          <div className="h-4 w-32 bg-gray-100 rounded" />
        </div>
        {/* TODO: difficulty filter */}
        <div className="h-10 w-32 bg-white border border-gray-200 rounded-lg" />
        {/* TODO: sort by (name, cost, date added) */}
        <div className="h-10 w-36 bg-white border border-gray-200 rounded-lg" />
        {/* Grid / List toggle */}
        <div className="flex border border-gray-200 rounded-lg overflow-hidden bg-white">
          {['Grid', 'List'].map((m) => (
            <button
              key={m}
              onClick={() => setView(m)}
              className={`px-3 py-2 text-sm font-medium transition-colors ${
                view === m ? 'bg-orange-500 text-white' : 'text-gray-500 hover:bg-gray-50'
              }`}
            >
              {m}
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
            className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
              category === c ? 'bg-orange-500 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            {c}
          </button>
        ))}
      </div>

      {/* Recipe cards */}
      {/* TODO: map over fetched recipes from /api/kitchen/recipes */}
      <div className={view === 'Grid' ? 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5' : 'space-y-3'}>
        {Array.from({ length: 8 }).map((_, i) => (
          <div
            key={i}
            className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden hover:shadow-md hover:border-orange-200 transition-all cursor-pointer"
          >
            {view === 'Grid' && (
              <div className="h-36 bg-gradient-to-br from-amber-50 to-orange-100 relative">
                {/* TODO: recipe cover photo */}
                <div className="absolute top-2 right-2 h-6 w-6 bg-white/80 rounded" />
              </div>
            )}
            <div className="p-4 space-y-2">
              <div className="flex items-start justify-between">
                {/* Recipe name */}
                <div className="h-4 w-32 bg-gray-200 rounded" />
                {/* Difficulty badge */}
                <div className="h-5 w-14 bg-yellow-100 rounded-full flex-shrink-0" />
              </div>
              {/* Category + prep time */}
              <div className="flex gap-2">
                <div className="h-3.5 w-16 bg-gray-100 rounded" />
                <div className="h-3.5 w-14 bg-gray-100 rounded" />
              </div>
              {/* TODO: cost per portion */}
              <div className="flex items-center justify-between pt-1 border-t border-gray-50">
                <div className="space-y-0.5">
                  <div className="h-3 w-20 bg-gray-100 rounded" />
                  <div className="h-4 w-16 bg-orange-100 rounded" />
                </div>
                {/* Linked courses pill */}
                <div className="h-5 w-20 bg-blue-50 rounded-full" />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
