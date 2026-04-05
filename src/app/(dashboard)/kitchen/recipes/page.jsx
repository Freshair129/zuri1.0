'use client';

// Kitchen — Recipe list page
// Browse and manage the school's recipe library.
// Recipes are linked to courses; each recipe has ingredients, steps, and cost breakdown.

import { useState, useEffect } from 'react';
import { Plus, Search, Filter, LayoutGrid, List as ListIcon, ChefHat, Clock, Utensils, MoreVertical } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const CATEGORY_FILTERS = ['All', 'Appetizers', 'Mains', 'Desserts', 'Pastry', 'Sauces', 'Beverages'];

export default function RecipesPage() {
  const [category, setCategory] = useState('All');
  const [view, setView] = useState('Grid'); // Grid | List
  const [search, setSearch] = useState('');
  const [recipes, setRecipes] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchRecipes();
  }, [category, search]);

  async function fetchRecipes() {
    setLoading(true);
    try {
      const url = new URL('/api/culinary/recipes', window.location.origin);
      if (category !== 'All') url.searchParams.set('category', category);
      if (search) url.searchParams.set('search', search);

      const res = await fetch(url);
      if (res.ok) {
        const json = await res.json();
        setRecipes(json.data || []);
      }
    } catch (error) {
      console.error('Failed to fetch recipes', error);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      {/* Page header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent">Recipes</h1>
          <p className="text-sm text-gray-500 mt-1 flex items-center gap-1.5">
            <ChefHat className="h-4 w-4 text-orange-500" />
            Manage the culinary school recipe library and ingredients
          </p>
        </div>
        <div className="flex gap-2">
          <button className="h-10 px-4 flex items-center gap-2 bg-white border border-gray-200 rounded-xl text-sm font-medium text-gray-700 hover:bg-gray-50 transition-all shadow-sm">
            <Filter className="h-4 w-4" />
            Import
          </button>
          <button className="h-10 px-5 flex items-center gap-2 bg-orange-500 text-white rounded-xl text-sm font-semibold hover:bg-orange-600 transition-all shadow-md shadow-orange-100">
            <Plus className="h-5 w-5" />
            New Recipe
          </button>
        </div>
      </div>

      {/* Search + filter toolbar */}
      <div className="flex flex-col sm:flex-row gap-4 items-center">
        <div className="relative flex-1 w-full">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search by recipe name or ingredient..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full h-11 pl-10 pr-4 bg-white border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all shadow-sm"
          />
        </div>
        
        <div className="flex items-center gap-2 bg-white border border-gray-200 rounded-xl p-1 shadow-sm">
          <button
            onClick={() => setView('Grid')}
            className={`p-2 rounded-lg transition-all ${view === 'Grid' ? 'bg-orange-100 text-orange-600' : 'text-gray-400 hover:bg-gray-50'}`}
            title="Grid View"
          >
            <LayoutGrid className="h-5 w-5" />
          </button>
          <button
            onClick={() => setView('List')}
            className={`p-2 rounded-lg transition-all ${view === 'List' ? 'bg-orange-100 text-orange-600' : 'text-gray-400 hover:bg-gray-50'}`}
            title="List View"
          >
            <ListIcon className="h-5 w-5" />
          </button>
        </div>
      </div>

      {/* Category pills */}
      <div className="flex gap-2 flex-wrap pb-2 border-b border-gray-100">
        {CATEGORY_FILTERS.map((c) => (
          <button
            key={c}
            onClick={() => setCategory(c)}
            className={`px-4 py-1.5 rounded-full text-xs font-semibold transition-all shadow-sm ${
              category === c 
                ? 'bg-gray-900 text-white scale-105' 
                : 'bg-white text-gray-500 border border-gray-100 hover:bg-gray-50'
            }`}
          >
            {c}
          </button>
        ))}
      </div>

      {/* Recipe list/grid */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="bg-white rounded-2xl h-64 animate-pulse border border-gray-100 shadow-sm" />
          ))}
        </div>
      ) : recipes.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 bg-white rounded-2xl border border-dashed border-gray-200">
          <Utensils className="h-12 w-12 text-gray-200 mb-4" />
          <h3 className="text-lg font-medium text-gray-900">No recipes found</h3>
          <p className="text-gray-500 text-sm mt-1">Try adjusting your filters or search term</p>
        </div>
      ) : (
        <motion.div 
          layout
          className={view === 'Grid' ? 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6' : 'space-y-4'}
        >
          <AnimatePresence mode="popLayout">
            {recipes.map((recipe) => (
              <motion.div
                layout
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9 }}
                key={recipe.id}
                className={`group bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden hover:shadow-xl hover:border-orange-200 transition-all cursor-pointer ${
                  view === 'List' ? 'flex items-center gap-4 p-3' : ''
                }`}
              >
                <div className={`${view === 'Grid' ? 'h-40 bg-gradient-to-br from-amber-50 to-orange-100 relative' : 'h-16 w-16 rounded-xl bg-orange-50 flex-shrink-0 flex items-center justify-center'}`}>
                  {recipe.imageUrl ? (
                    <img src={recipe.imageUrl} alt={recipe.name} className="h-full w-full object-cover" />
                  ) : (
                    <Utensils className={`text-orange-300 ${view === 'Grid' ? 'h-12 w-12 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2' : 'h-6 w-6'}`} />
                  )}
                  {view === 'Grid' && (
                    <div className="absolute top-3 left-3 px-2 py-1 bg-white/90 backdrop-blur rounded-lg text-[10px] font-bold text-gray-700 shadow-sm">
                      {recipe.category || 'Standard'}
                    </div>
                  )}
                </div>

                <div className={`${view === 'Grid' ? 'p-4 space-y-3' : 'flex-1'}`}>
                  <div className="flex items-start justify-between gap-2">
                    <h3 className="font-bold text-gray-900 line-clamp-1 group-hover:text-orange-600 transition-colors">
                      {recipe.name}
                    </h3>
                    <button className="text-gray-300 hover:text-gray-600">
                      <MoreVertical className="h-4 w-4" />
                    </button>
                  </div>

                  <div className="flex items-center gap-3 text-xs text-gray-500">
                    <div className="flex items-center gap-1">
                      <Utensils className="h-3 w-3" />
                      <span>{recipe._count?.ingredients || 0} items</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      <span>{recipe.yieldAmount || '--'} {recipe.yieldUnit || 'portions'}</span>
                    </div>
                  </div>

                  {view === 'Grid' && (
                    <div className="flex items-center justify-between pt-3 border-t border-gray-50 mt-1">
                      <div className="flex -space-x-2">
                        {/* Placeholder for linked courses */}
                        <div className="h-6 w-6 rounded-full border-2 border-white bg-blue-100" />
                        <div className="h-6 w-6 rounded-full border-2 border-white bg-orange-100 text-[10px] flex items-center justify-center font-bold text-orange-600">+2</div>
                      </div>
                      <span className="text-[10px] font-bold text-gray-400 tracking-wider uppercase">
                        {recipe.recipeId}
                      </span>
                    </div>
                  )}
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </motion.div>
      )}
    </div>
  );
}
