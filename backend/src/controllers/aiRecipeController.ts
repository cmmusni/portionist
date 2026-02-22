import { GoogleGenerativeAI } from "@google/generative-ai";
import type { Request, Response } from "express";
import { saveRecipeToHistory } from "./recipeLogController.js";

interface Ingredient {
  id: string;
  name: string;
  quantity?: number;
  unit?: string;
}

interface AIRecipeGeneratorRequest {
  ingredients: Ingredient[];
  currentWeight: number;
  targetWeight: number;
  mealType?: string;
  cuisine: string;
  cookingMethod?: string;
  count?: number; // Number of recipes to generate (default: 2)
}

interface Recipe {
  id: string;
  name: string;
  image?: string;
  source?: "spoonacular" | "ai";
  mainIngredient: Ingredient;
  sideIngredients: Ingredient[];
  ingredients: {
    id: string;
    name: string;
    quantity: number;
    unit: string;
  }[];
  instructions: {
    stepNumber: number;
    instruction: string;
  }[];
  mealType: string;
  cuisine: string;
  portionSize: number;
  portionUnit: string;
  prepTime: number;
  cookTime: number;
  totalTime: number;
  servings: number;
  calories?: number;
}

class AIRecipeController {
  private genAI: GoogleGenerativeAI | null = null;

  private getGeminiClient(): GoogleGenerativeAI {
    if (!this.genAI) {
      this.genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY!);
    }
    return this.genAI;
  }

  private foodImages = [
    "https://images.unsplash.com/photo-1567620905732-2d1ec7ab7445?w=800",
    "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=800",
    "https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=800",
    "https://images.unsplash.com/photo-1540189549336-e6e99c3679fe?w=800",
    "https://images.unsplash.com/photo-1565958011703-44f9829ba187?w=800",
    "https://images.unsplash.com/photo-1567620832903-9fc6debc209f?w=800",
    "https://images.unsplash.com/photo-1563379926898-05f4575a45d8?w=800",
    "https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=800",
    "https://images.unsplash.com/photo-1565299585323-38d6b0865b47?w=800",
    "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=800",
    "https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=800",
    "https://images.unsplash.com/photo-1529042410759-befb1204b468?w=800",
    "https://images.unsplash.com/photo-1547637589-f54c34f5d7a4?w=800",
    "https://images.unsplash.com/photo-1484723091739-30a097e8f929?w=800",
    "https://images.unsplash.com/photo-1498837167922-ddd27525d352?w=800",
    "https://images.unsplash.com/photo-1473093295043-cdd812d0e601?w=800",
    "https://images.unsplash.com/photo-1606787366850-de6330128bfc?w=800",
    "https://images.unsplash.com/photo-1562967914-608f82629710?w=800",
    "https://images.unsplash.com/photo-1568605117036-5fe5e7bab0b7?w=800",
    "https://images.unsplash.com/photo-1574484284002-952d92456975?w=800",
  ];

  private calculateCalories(portionSize: number, mealType: string): number {
    // Estimate calories based on portion size and meal type
    const calorieMultipliers: Record<string, number> = {
      Breakfast: 1.3,
      Lunch: 1.5,
      Dinner: 1.6,
      Snack: 2.5,
    };

    const multiplier = calorieMultipliers[mealType] || 1.5;
    return Math.round(portionSize * multiplier);
  }

  private generateImageUrl(recipeName: string): string {
    console.log(`🖼️  Selecting random image for: "${recipeName}"`);
    // Select a random image from the array
    const randomIndex = Math.floor(Math.random() * this.foodImages.length);
    const imageUrl =
      this.foodImages[randomIndex] ??
      this.foodImages[0] ??
      "https://images.unsplash.com/photo-1567620905732-2d1ec7ab7445?w=800";
    console.log(`✅ Selected image: ${imageUrl}`);
    return imageUrl;
  }

  private async generateSingleRecipe(
    ingredients: Ingredient[],
    portionSize: number,
    mealType: string,
    cuisine: string,
    cookingMethod?: string,
    recipeIndex: number = 0,
    retryCount: number = 0,
  ): Promise<Recipe> {
    const ingredientsText =
      ingredients.length > 0
        ? `Ingredients: ${ingredients.map((i) => i.name).join(", ")}`
        : "No specific ingredients";

    // Define different cooking styles for variety
    const cookingStyles = [
      { style: "stir-fry", description: "quick and crispy" },
      { style: "grilled", description: "smoky and charred" },
      { style: "steamed", description: "light and healthy" },
      { style: "baked", description: "warm and comforting" },
      { style: "pan-seared", description: "savory and golden" },
      { style: "slowly braised", description: "tender and rich" },
    ];

    // Use specified cooking method or rotate through styles for variety
    const selectedStyle = cookingMethod
      ? { style: cookingMethod.toLowerCase(), description: "flavorful" }
      : cookingStyles[recipeIndex % cookingStyles.length];

    const cookingMethodText = cookingMethod
      ? `IMPORTANT: The recipe MUST use ${cookingMethod} as the primary cooking method.`
      : `IMPORTANT: Create a unique ${selectedStyle?.style} version that is ${selectedStyle?.description}. Make this distinctly different from other versions.`;

    const prompt = `Generate a ${mealType} recipe in JSON format using these ingredients: ${ingredientsText}. 
      The recipe should be for ${cuisine} cuisine and should serve 1 person with approximately ${portionSize}g portion size.
      ${cookingMethodText}
      Use different preparation techniques, spices, and accompaniments than typical recipes.
      
      Return ONLY valid JSON in this exact format, no markdown or extra text:
      {
        "recipeId": "ai-recipe-TIMESTAMP",
        "name": "Recipe name",
        "ingredients": [{"id": "ingredient_id", "name": "Ingredient Name", "quantity": 100, "unit": "g"}],
        "instructions": ["Step 1", "Step 2", "Step 3"],
        "mealType": "${mealType}",
        "cuisine": "${cuisine}",
        "portionSize": ${portionSize},
        "portionUnit": "g",
        "prepTime": 15,
        "cookTime": 20,
        "totalTime": 35,
        "servings": 1
      }`;

    const model = this.getGeminiClient().getGenerativeModel({
      model: "gemini-2.0-flash-lite",
    });

    console.log(
      `Generating recipe ${recipeIndex + 1} with ${ingredients.length} ingredients (${cuisine} ${mealType})`,
    );

    try {
      const result = await model.generateContent(prompt);
      const responseText = result.response.text();
      console.log("Gemini response received, length:", responseText.length);

      // Parse JSON from response (handle markdown code blocks)
      let jsonString = responseText;

      // Check if response is wrapped in markdown code blocks
      const jsonMatch = responseText.match(/```(?:json)?\s*([\s\S]*?)```/);
      if (jsonMatch && jsonMatch[1]) {
        jsonString = jsonMatch[1].trim();
      }

      const recipeData = JSON.parse(jsonString);

      // Fetch a proper food image for the recipe
      const imageUrl = this.generateImageUrl(recipeData.name);

      // Format recipe to match expected schema
      const finalPortionSize = recipeData.portionSize || portionSize;
      const finalMealType = recipeData.mealType || mealType;

      // Get first ingredient for display purposes (backward compatibility)
      const displayIngredient = ingredients[0] || { id: "", name: "Unknown" };

      const generatedRecipe: Recipe = {
        id: recipeData.recipeId || `ai-recipe-${Date.now()}-${recipeIndex}`,
        name: recipeData.name,
        image: imageUrl,
        source: "ai",
        mainIngredient: displayIngredient,
        sideIngredients: ingredients.slice(1),
        ingredients: (recipeData.ingredients || []).map((ing: any) => ({
          id: ing.id || ing.name.toLowerCase().replace(/\s+/g, "_"),
          name: ing.name,
          quantity: ing.quantity || 0,
          unit: ing.unit || "g",
        })),
        instructions: (recipeData.instructions || []).map(
          (instruction: string, idx: number) => ({
            stepNumber: idx + 1,
            instruction,
          }),
        ),
        mealType: finalMealType,
        cuisine: recipeData.cuisine || cuisine,
        portionSize: finalPortionSize,
        portionUnit: recipeData.portionUnit || "g",
        prepTime: recipeData.prepTime || 15,
        cookTime: recipeData.cookTime || 20,
        totalTime: recipeData.totalTime || 35,
        servings: recipeData.servings || 1,
        calories: this.calculateCalories(finalPortionSize, finalMealType),
      };

      return generatedRecipe;
    } catch (error: any) {
      // Handle 429 rate limit with exponential backoff
      if (error.status === 429 && retryCount < 2) {
        const waitTime = Math.pow(2, retryCount + 1) * 1000; // 2s, 4s
        console.warn(
          `⚠️  Rate limit hit, retrying in ${waitTime / 1000}s (attempt ${retryCount + 1}/2)`,
        );
        await new Promise((resolve) => setTimeout(resolve, waitTime));
        return this.generateSingleRecipe(
          ingredients,
          portionSize,
          mealType,
          cuisine,
          cookingMethod,
          recipeIndex,
          retryCount + 1,
        );
      }
      throw error;
    }
  }

  async generateRecipe(
    req: Request<{}, {}, AIRecipeGeneratorRequest>,
    res: Response,
  ): Promise<void> {
    try {
      const {
        ingredients,
        currentWeight,
        targetWeight,
        mealType,
        cuisine,
        cookingMethod,
        count,
      } = req.body;

      // Validate required fields
      // Allow empty ingredients array for meal-time suggestions
      if (!ingredients || !Array.isArray(ingredients)) {
        res.status(400).json({
          success: false,
          message:
            "ingredients must be an array (can be empty for suggestions)",
        });
        return;
      }

      if (!cuisine) {
        res.status(400).json({
          success: false,
          message: "cuisine is required",
        });
        return;
      }

      // Default mealType to Lunch if not provided
      const finalMealType = mealType || "Lunch";

      if (!process.env.GOOGLE_API_KEY) {
        res.status(500).json({
          success: false,
          message:
            "Google API key not configured. Set GOOGLE_API_KEY environment variable.",
        });
        return;
      }

      // Calculate appropriate portion size based on meal type and goals
      // Base portion sizes for different meal types
      const basePortionSizes: Record<string, number> = {
        Breakfast: 300,
        Lunch: 400,
        Dinner: 400,
        Snack: 150,
      };

      let portionSize = basePortionSizes[finalMealType] || 350;

      // Adjust portion size based on weight goals
      const weightDifference = targetWeight - currentWeight;

      if (weightDifference < 0) {
        // User wants to lose weight - reduce portion by 10-15%
        portionSize = Math.round(portionSize * 0.85);
      } else if (weightDifference > 0) {
        // User wants to gain weight - increase portion by 10-15%
        portionSize = Math.round(portionSize * 1.15);
      }
      // If weightDifference is 0 (maintain weight), use base portion

      console.log(
        `Portion calculation: meal=${finalMealType}, current=${currentWeight}kg, target=${targetWeight}kg, portion=${portionSize}g`,
      );

      // Determine number of recipes to generate (default: 2, max: 4)
      const recipeCount = Math.min(Math.max(count || 2, 1), 4);
      console.log(`🔄 Generating ${recipeCount} recipe(s)...`);

      // Generate recipes in sequence with shorter delays to avoid rate limiting
      const generatedRecipes: Recipe[] = [];

      for (let i = 0; i < recipeCount; i++) {
        try {
          const recipe = await this.generateSingleRecipe(
            ingredients,
            portionSize,
            finalMealType,
            cuisine,
            cookingMethod,
            i, // Pass index for unique variations
          );
          generatedRecipes.push(recipe);

          // Add 0.5-second delay between requests
          if (i < recipeCount - 1) {
            console.log(`⏱️  Waiting 0.5 seconds before next recipe...`);
            await new Promise((resolve) => setTimeout(resolve, 500));
          }
        } catch (err: any) {
          console.error(`Failed to generate recipe ${i + 1}:`, err);

          // If it's a rate limit error, return what we have with a helpful message
          if (err.status === 429) {
            console.warn(
              `🚫 Gemini API rate limit exhausted after retries. Generated ${generatedRecipes.length} recipes.`,
            );

            // Return partial results if we got at least one recipe
            if (generatedRecipes.length > 0) {
              res.status(200).json({
                success: true,
                data: generatedRecipes,
                source: "ai",
                message: `Generated ${generatedRecipes.length} recipe(s). AI is temporarily at capacity - quota resets hourly.`,
                partial: true,
                rateLimitReached: true,
              });
              return;
            }

            // No recipes generated - throw error so Spoonacular fallback can be attempted
            const rateLimitError: any = new Error("AI rate limit exceeded");
            rateLimitError.status = 429;
            rateLimitError.code = "RATE_LIMIT_EXCEEDED";
            throw rateLimitError;
          }

          console.error(
            "Error details:",
            err instanceof Error ? err.stack : JSON.stringify(err),
          );
          // Continue generating the remaining recipes for other errors
        }
      }

      if (generatedRecipes.length === 0) {
        // No recipes generated - throw error so Spoonacular fallback can be attempted
        const serviceError: any = new Error("AI service unavailable");
        serviceError.status = 503;
        serviceError.code = "SERVICE_UNAVAILABLE";
        throw serviceError;
      }

      // Save generated recipes to user history (if userId is provided)
      const userId = (req as any).user?.userId || (req.body as any).userId;

      if (userId && generatedRecipes.length > 0) {
        console.log(
          `💾 Saving ${generatedRecipes.length} AI-generated recipes to user history for user: ${userId}`,
        );

        for (const recipe of generatedRecipes) {
          try {
            await saveRecipeToHistory(userId, recipe, "search");
          } catch (error) {
            console.warn(
              `Failed to save AI recipe ${recipe.id} to history:`,
              error,
            );
          }
        }
      }

      res.status(200).json({
        success: true,
        data: generatedRecipes,
        source: "ai",
        message: `Generated ${generatedRecipes.length} recipe(s) with AI`,
      });
    } catch (error) {
      console.error("Error generating recipes with AI:", error);
      res.status(500).json({
        success: false,
        message: "Failed to generate recipes",
        error: error instanceof Error ? error.message : "Unknown error",
      });
    }
  }
}

export default new AIRecipeController();
