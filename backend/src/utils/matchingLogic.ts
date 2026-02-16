export interface Ingredient {
  id: string;
  name: string;
}

export interface Recipe {
  id: string;
  name: string;
  image?: string;
  mainIngredient: Ingredient;
  sideIngredients: Ingredient[];
  mealType: string;
  cuisine: string;
  portionSize: number;
  [key: string]: any;
}

export interface RecipeWithScore extends Recipe {
  matchScore: number;
  scoreBreakdown: {
    mainIngredientMatch: number;
    sideIngredientsMatch: number;
    portionMatch: number;
  };
}

/**
 * Match and score recipes based on user preferences
 * @param recipes - List of recipes to score
 * @param mainIngredient - User's main ingredient preference
 * @param sideIngredients - User's side ingredient preferences
 * @param currentWeight - User's current weight (kg)
 * @param targetWeight - User's target weight (kg)
 * @param mealType - Type of meal (Breakfast, Lunch, Dinner, Snack)
 * @param cuisine - Preferred cuisine
 * @returns Sorted array of recipes with scores
 */
export function matchRecipes(
  recipes: Recipe[],
  mainIngredient: Ingredient,
  sideIngredients: Ingredient[],
  currentWeight: number,
  targetWeight: number,
  mealType: string,
  cuisine: string,
): RecipeWithScore[] {
  // Calculate remaining weight (how much the user needs to aim for)
  const remainingWeight = targetWeight - currentWeight;

  if (remainingWeight <= 0) {
    throw new Error("targetWeight must be greater than currentWeight");
  }

  // Filter recipes by mealType and cuisine
  const filteredRecipes = recipes.filter(
    (recipe) =>
      recipe.mealType.toLowerCase() === mealType.toLowerCase() &&
      recipe.cuisine.toLowerCase() === cuisine.toLowerCase(),
  );

  // Score each recipe
  const scoredRecipes: RecipeWithScore[] = filteredRecipes.map((recipe) => {
    // 1. Main Ingredient Match (40%)
    const mainIngredientMatch =
      recipe.mainIngredient.id === mainIngredient.id ? 1 : 0;
    const mainIngredientScore = mainIngredientMatch * 0.4;

    // 2. Side Ingredients Match (20%)
    let sideIngredientsMatched = 0;
    if (sideIngredients.length > 0) {
      sideIngredientsMatched = recipe.sideIngredients.filter((recipeSide) =>
        sideIngredients.some((userSide) => userSide.id === recipeSide.id),
      ).length;
    }
    const sideIngredientsRatio =
      sideIngredients.length > 0
        ? sideIngredientsMatched / sideIngredients.length
        : 0;
    const sideIngredientsScore = sideIngredientsRatio * 0.2;

    // 3. Portion Match (40%)
    // portionMatchPercent = 1 - abs(recipeWeight - (targetWeight - currentWeight)) / (targetWeight - currentWeight)
    const portionDifference = Math.abs(recipe.portionSize - remainingWeight);
    const portionMatchRatio = Math.max(
      0,
      1 - portionDifference / remainingWeight,
    );
    const portionScore = portionMatchRatio * 0.4;

    // Total score (0-1)
    const totalScore =
      mainIngredientScore + sideIngredientsScore + portionScore;

    return {
      ...recipe,
      matchScore: totalScore,
      scoreBreakdown: {
        mainIngredientMatch: mainIngredientScore,
        sideIngredientsMatch: sideIngredientsScore,
        portionMatch: portionScore,
      },
    };
  });

  // Sort by score descending, then by name for consistent ordering
  return scoredRecipes.sort((a, b) => {
    if (b.matchScore !== a.matchScore) {
      return b.matchScore - a.matchScore;
    }
    return a.name.localeCompare(b.name);
  });
}

/**
 * Get top N matching recipes
 */
export function getTopRecipes(
  recipes: RecipeWithScore[],
  limit: number = 10,
): RecipeWithScore[] {
  return recipes.slice(0, limit);
}

/**
 * Filter recipes by minimum score threshold
 */
export function filterByScore(
  recipes: RecipeWithScore[],
  minScore: number,
): RecipeWithScore[] {
  return recipes.filter((recipe) => recipe.matchScore >= minScore);
}
