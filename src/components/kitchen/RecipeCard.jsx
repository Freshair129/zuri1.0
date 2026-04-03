export default function RecipeCard({ recipe, onClick }) {
  return (
    <div 
      onClick={() => onClick?.(recipe)}
      className="bg-surface-container-lowest rounded-xl overflow-hidden group border border-outline-variant/10 hover:shadow-md transition-all cursor-pointer"
    >
      <div className="h-40 overflow-hidden relative">
        <img 
          alt={recipe.name} 
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" 
          src={recipe.image || 'https://images.unsplash.com/photo-1552611052-33e04de081de?q=80&w=800&auto=format&fit=crop'} 
        />
        {recipe.isSignature && (
          <div className="absolute top-3 left-3">
            <span className="px-2 py-0.5 bg-primary text-[8px] text-white font-prompt uppercase tracking-widest rounded-sm shadow-sm">
              Signature
            </span>
          </div>
        )}
      </div>
      <div className="p-4">
        <h5 className="font-bold text-on-surface text-md mb-1 line-clamp-1 font-headline">
          {recipe.name}
        </h5>
        <div className="flex items-center gap-2 mb-3">
          <p className="text-[10px] text-secondary font-prompt uppercase tracking-widest">
            {recipe.category || 'General'}
          </p>
          <span className="w-1 h-1 rounded-full bg-outline-variant" />
          <p className="text-[10px] text-secondary font-prompt uppercase tracking-widest">
            {recipe.difficulty || 'Medium'}
          </p>
        </div>
        <div className="flex justify-between items-center pt-3 border-t border-surface-container-low">
          <span className="text-[9px] text-secondary">
            {recipe.prepTime ? `${recipe.prepTime} min prep` : 'Updated recently'}
          </span>
          <button className="material-symbols-outlined text-secondary text-sm hover:text-primary transition-colors">
            open_in_new
          </button>
        </div>
      </div>
    </div>
  );
}
