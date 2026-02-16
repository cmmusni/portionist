import { GoogleGenerativeAI } from "@google/generative-ai";
import type { Request, Response } from "express";

interface Ingredient {
  id: string;
  name: string;
  quantity?: number;
  unit?: string;
}

interface AIRecipeGeneratorRequest {
  mainIngredient: Ingredient;
  sideIngredients: Ingredient[];
  currentWeight: number;
  targetWeight: number;
  mealType: string;
  cuisine: string;
}

interface Recipe {
  id: string;
  name: string;
  image?: string;
  source?: "database" | "spoonacular" | "ai";
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
}

class AIRecipeController {
  private genAI: GoogleGenerativeAI | null = null;

  private getGeminiClient(): GoogleGenerativeAI {
    if (!this.genAI) {
      this.genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY!);
    }
    return this.genAI;
  }

  private async generateImageUrl(recipeName: string): Promise<string> {
    try {
      // Fetch a food image from the Foodish API
      const response = await fetch(
        "https://foodish-api.herokuapp.com/api/food",
      );
      const data = (await response.json()) as { image: string };
      return (
        data.image ||
        "https://png.pngtree.com/png-vector/20230808/ourmid/pngtree-recipe-card-vector-png-image_6874598.png"
      );
    } catch (error) {
      console.warn("Failed to fetch food image, using fallback:", error);
      // Fallback to static image if API fails
      return "https://png.pngtree.com/png-vector/20230808/ourmid/pngtree-recipe-card-vector-png-image_6874598.png";
    }
  }

  private async generateSingleRecipe(
    mainIngredient: Ingredient,
    sideIngredients: Ingredient[],
    remainingWeight: number,
    mealType: string,
    cuisine: string,
    recipeIndex: number = 0,
  ): Promise<Recipe> {
    const sideIngredientsText =
      sideIngredients.length > 0
        ? `Side ingredients: ${sideIngredients.map((i) => i.name).join(", ")}`
        : "No specific side ingredients";

    // Define different cooking styles for variety
    const cookingStyles = [
      { style: "stir-fry", description: "quick and crispy" },
      { style: "grilled", description: "smoky and charred" },
      { style: "steamed", description: "light and healthy" },
      { style: "baked", description: "warm and comforting" },
      { style: "pan-seared", description: "savory and golden" },
      { style: "slowly braised", description: "tender and rich" },
    ];

    const selectedStyle = cookingStyles[recipeIndex % cookingStyles.length];

    const prompt = `Generate a ${mealType} recipe in JSON format using ${mainIngredient.name} as the main ingredient. ${sideIngredientsText}. 
      The recipe should be for ${cuisine} cuisine and should serve 1 person with approximately ${remainingWeight}g portion size.
      IMPORTANT: Create a unique ${selectedStyle?.style} version that is ${selectedStyle?.description}. Make this distinctly different from other versions.
      Use different preparation techniques, spices, and accompaniments than typical recipes.
      
      Return ONLY valid JSON in this exact format, no markdown or extra text:
      {
        "recipeId": "ai-recipe-TIMESTAMP",
        "name": "Recipe name",
        "mainIngredient": {"id": "${mainIngredient.id}", "name": "${mainIngredient.name}"},
        "sideIngredients": [{"id": "ingredient_id", "name": "Ingredient Name"}],
        "ingredients": [{"id": "ingredient_id", "name": "Ingredient Name", "quantity": 100, "unit": "g"}],
        "instructions": ["Step 1", "Step 2", "Step 3"],
        "mealType": "${mealType}",
        "cuisine": "${cuisine}",
        "portionSize": ${remainingWeight},
        "portionUnit": "g",
        "prepTime": 15,
        "cookTime": 20,
        "totalTime": 35,
        "servings": 1
      }`;

    const model = this.getGeminiClient().getGenerativeModel({
      model: "gemini-2.0-flash-lite",
    });

    const result = await model.generateContent(prompt);
    const responseText = result.response.text();

    // Parse JSON from response (handle markdown code blocks)
    let jsonString = responseText;

    // Check if response is wrapped in markdown code blocks
    const jsonMatch = responseText.match(/```(?:json)?\s*([\s\S]*?)```/);
    if (jsonMatch && jsonMatch[1]) {
      jsonString = jsonMatch[1].trim();
    }

    const recipeData = JSON.parse(jsonString);

    // Fetch a proper food image for the recipe
    const imageUrl = await this.generateImageUrl(recipeData.name);

    // Format recipe to match expected schema
    const generatedRecipe: Recipe = {
      id: recipeData.recipeId || `ai-recipe-${Date.now()}-${recipeIndex}`,
      name: recipeData.name,
      image: imageUrl,
      source: "ai",
      mainIngredient: recipeData.mainIngredient || mainIngredient,
      sideIngredients: recipeData.sideIngredients || [],
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
      mealType: recipeData.mealType || mealType,
      cuisine: recipeData.cuisine || cuisine,
      portionSize: recipeData.portionSize || remainingWeight,
      portionUnit: recipeData.portionUnit || "g",
      prepTime: recipeData.prepTime || 15,
      cookTime: recipeData.cookTime || 20,
      totalTime: recipeData.totalTime || 35,
      servings: recipeData.servings || 1,
    };

    return generatedRecipe;
  }

  async generateRecipe(
    req: Request<{}, {}, AIRecipeGeneratorRequest>,
    res: Response,
  ): Promise<void> {
    try {
      const {
        mainIngredient,
        sideIngredients,
        currentWeight,
        targetWeight,
        mealType,
        cuisine,
      } = req.body;

      // Validate required fields
      if (!mainIngredient || !mainIngredient.id || !mainIngredient.name) {
        res.status(400).json({
          success: false,
          message: "mainIngredient with id and name is required",
        });
        return;
      }

      if (!mealType || !cuisine) {
        res.status(400).json({
          success: false,
          message: "mealType and cuisine are required",
        });
        return;
      }

      if (!process.env.GOOGLE_API_KEY) {
        res.status(500).json({
          success: false,
          message:
            "Google API key not configured. Set GOOGLE_API_KEY environment variable.",
        });
        return;
      }

      const remainingWeight = targetWeight - currentWeight;

      // Generate 3 recipes in sequence with small delays
      const generatedRecipes: Recipe[] = [];

      for (let i = 0; i < 3; i++) {
        try {
          const recipe = await this.generateSingleRecipe(
            mainIngredient,
            sideIngredients,
            remainingWeight,
            mealType,
            cuisine,
            i, // Pass index for unique variations
          );
          generatedRecipes.push(recipe);

          // Add small delay between requests (except after the last one)
          if (i < 2) {
            await new Promise((resolve) => setTimeout(resolve, 500));
          }
        } catch (err) {
          console.error(`Failed to generate recipe ${i + 1}:`, err);
          // Continue generating the remaining recipes even if one fails
        }
      }

      if (generatedRecipes.length === 0) {
        res.status(500).json({
          success: false,
          message: "Failed to generate any recipes",
        });
        return;
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
