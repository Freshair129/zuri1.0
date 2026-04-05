import { getPrisma } from '@/lib/db'
import { generateRecipeId } from '@/lib/idGenerator'

const prisma = getPrisma()

/**
 * List recipes for a tenant with optional filtering
 */
export async function findMany(tenantId, { category, search, limit = 50, offset = 0 } = {}) {
  const where = { tenantId }
  if (category) where.category = category
  if (search) {
    where.name = { contains: search, mode: 'insensitive' }
  }

  return prisma.recipe.findMany({
    where,
    include: {
      _count: { select: { ingredients: true } }
    },
    take: limit,
    skip: offset,
    orderBy: { name: 'asc' }
  })
}

/**
 * Get recipe details with all ingredients and instructions
 */
export async function findById(tenantId, id) {
  return prisma.recipe.findFirst({
    where: { id, tenantId },
    include: {
      ingredients: {
        include: { ingredient: true }
      }
    }
  })
}

/**
 * Create a new recipe with ingredients
 */
export async function createRecipe(tenantId, { name, description, yieldAmount, yieldUnit, category, instructions, ingredients = [] }) {
  const recipeId = await generateRecipeId()
  
  return prisma.$transaction(async (tx) => {
    const recipe = await tx.recipe.create({
      data: {
        recipeId,
        tenantId,
        name,
        description,
        yieldAmount,
        yieldUnit,
        category,
        instructions: instructions || [],
        ingredients: {
          create: ingredients.map(inv => ({
            ingredientId: inv.ingredientId,
            qty: inv.qty,
            unit: inv.unit,
            note: inv.note
          }))
        }
      },
      include: { ingredients: true }
    })
    return recipe
  })
}

/**
 * Update recipe and sync ingredients
 */
export async function updateRecipe(tenantId, id, { ingredients, ...data }) {
  // Verify ownership
  const existing = await prisma.recipe.findFirst({ where: { id, tenantId } })
  if (!existing) throw new Error('Recipe not found')

  return prisma.$transaction(async (tx) => {
    // 1. Update basic info
    const updated = await tx.recipe.update({
      where: { id },
      data: {
        ...data,
        updatedAt: new Date()
      }
    })

    // 2. Sync ingredients if provided
    if (ingredients) {
      // Delete old ingredients
      await tx.recipeIngredient.deleteMany({ where: { recipeId: id } })
      
      // Create new ones
      await tx.recipeIngredient.createMany({
        data: ingredients.map(inv => ({
          recipeId: id,
          ingredientId: inv.ingredientId,
          qty: inv.qty,
          unit: inv.unit,
          note: inv.note
        }))
      })
    }

    return tx.recipe.findUnique({
      where: { id },
      include: { ingredients: true }
    })
  })
}

/**
 * Delete a recipe
 */
export async function deleteRecipe(tenantId, id) {
  const existing = await prisma.recipe.findFirst({ where: { id, tenantId } })
  if (!existing) throw new Error('Recipe not found')

  return prisma.recipe.delete({ where: { id } })
}
