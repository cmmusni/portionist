import AsyncStorage from "@react-native-async-storage/async-storage";
import { createDrawerNavigator } from "@react-navigation/drawer";
import {
  NavigationContainer,
  NavigationIndependentTree,
  useNavigation,
} from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import React from "react";
import {
  ActivityIndicator,
  Alert,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useDispatch, useSelector } from "react-redux";
import { saveAuthToStorage, useAuthRestore } from "../hooks/useAuthRestore";
import { useOnboardingRestore } from "../hooks/useOnboardingRestore";
import { saveOnboardingToStorage } from "../hooks/useOnboardingStorage";
import {
  selectAuthUser,
  selectIsAuthenticated,
  signInSuccess,
  signUpSuccess,
} from "../redux/authSlice";
import {
  addFavorite,
  removeFavorite,
  selectOnboardingCompleted,
  setOnboardingCompleted,
  setOnboardingData,
} from "../redux/pantrySlice";
import type { AppDispatch, RootState } from "../redux/store";
import DashboardScreen from "../screens/DashboardScreen";
import FavoritesScreen from "../screens/FavoritesScreen";
import MenuScreen from "../screens/MenuScreen";
import OnboardingScreen from "../screens/OnboardingScreen";
import RecipeDisplayScreen from "../screens/RecipeDisplayScreen";
import RecipeInputScreen from "../screens/RecipeInputScreen";
import RecipeSelectionList from "../screens/RecipeSelectionList";
import SettingsScreen from "../screens/SettingsScreen";
import SignInScreen from "../screens/SignInScreen";
import SignUpScreen from "../screens/SignUpScreen";
import { apiUrl } from "../services/config";
import { loadOverride } from "../services/runtimeConfig";

const Stack = createNativeStackNavigator();
const Drawer = createDrawerNavigator();

// Main App Drawer Navigator
function AppDrawer() {
  return (
    <Drawer.Navigator
      initialRouteName="Dashboard"
      screenOptions={{
        drawerStyle: {
          backgroundColor: "#ffffff",
          width: 280,
        },
        drawerActiveBackgroundColor: "#eff6ff",
        drawerActiveTintColor: "#3b82f6",
        drawerInactiveTintColor: "#6b7280",
        drawerLabelStyle: {
          fontSize: 16,
          fontWeight: "600",
        },
        headerStyle: {
          backgroundColor: "#3b82f6",
        },
        headerTintColor: "#ffffff",
        headerTitleStyle: {
          fontWeight: "700",
        },
      }}
    >
      <Drawer.Screen
        name="Dashboard"
        component={DashboardScreen}
        options={{
          title: "Portionist",
          drawerLabel: "Home",
          drawerIcon: () => <Text style={{ fontSize: 20 }}>🏠</Text>,
        }}
      />
      <Drawer.Screen
        name="RecipeInput"
        component={RecipeInputScreenWrapper}
        options={{
          title: "Search Recipe",
          drawerLabel: "Search Recipe",
          drawerIcon: () => <Text style={{ fontSize: 20 }}>🔍</Text>,
        }}
      />
      <Drawer.Screen
        name="Favorites"
        component={FavoritesScreen}
        options={{
          title: "Favorites",
          drawerLabel: "Favorites",
          drawerIcon: () => <Text style={{ fontSize: 20 }}>❤️</Text>,
        }}
      />
      <Drawer.Screen
        name="Menu"
        component={MenuScreen}
        options={{
          title: "Menu",
          drawerLabel: "Menu",
          drawerIcon: () => <Text style={{ fontSize: 20 }}>📋</Text>,
        }}
      />
      <Drawer.Screen
        name="Settings"
        component={SettingsScreen}
        options={{
          title: "Settings",
          drawerLabel: "Settings",
          drawerIcon: () => <Text style={{ fontSize: 20 }}>⚙️</Text>,
        }}
      />
    </Drawer.Navigator>
  );
}

// ============ AUTH SCREENS ============

// Wrapper for SignInScreen
function SignInScreenWrapper() {
  const dispatch = useDispatch();
  const navigation = useNavigation();

  const handleSignIn = async (user: {
    userId: string;
    email: string;
    fullName: string;
    token: string;
  }) => {
    try {
      // Save to storage for persistence
      await saveAuthToStorage(user);

      // Dispatch successful sign in with Facebook user data
      dispatch(
        signInSuccess({
          userId: user.userId,
          email: user.email,
          fullName: user.fullName,
          token: user.token,
        }),
      );

      // Fetch onboarding data from backend
      try {
        const response = await fetch(
          apiUrl(`/profile/${user.userId}/onboarding`),
        );

        if (response.ok) {
          // Onboarding data exists on backend
          const result = await response.json();
          const onboardingData = result.data;

          // Load into Redux
          dispatch(
            setOnboardingData({
              userAge: onboardingData.userAge,
              currentWeight: onboardingData.currentWeight,
              targetWeight: onboardingData.targetWeight,
              cuisine: onboardingData.cuisine,
            }),
          );
          dispatch(setOnboardingCompleted(true));

          // Save to local storage
          await saveOnboardingToStorage({
            userAge: onboardingData.userAge,
            currentWeight: onboardingData.currentWeight,
            targetWeight: onboardingData.targetWeight,
            cuisine: onboardingData.cuisine,
            savedAt: new Date().toISOString(),
            onboardingCompleted: true,
          });

          // Navigate to Dashboard
          navigation.navigate("Dashboard" as never);
        } else {
          // No onboarding data found, go to Onboarding
          navigation.navigate("Onboarding" as never);
        }
      } catch (error) {
        console.error("Error fetching onboarding data:", error);
        // On error, check local storage as fallback
        const localData = await AsyncStorage.getItem("portionist_onboarding");
        if (localData) {
          navigation.navigate("AppDrawer" as never);
        } else {
          navigation.navigate("Onboarding" as never);
        }
      }
    } catch (error) {
      Alert.alert("Error", "Failed to sign in");
      console.error(error);
    }
  };

  return (
    <SignInScreen
      handleSignIn={handleSignIn}
      onNavigateToSignUp={() => navigation.navigate("SignUp" as never)}
    />
  );
}

// Wrapper for SignUpScreen
function SignUpScreenWrapper() {
  const dispatch = useDispatch();
  const navigation = useNavigation();

  const handleSignUp = async (user: {
    userId: string;
    email: string;
    fullName: string;
    token: string;
  }) => {
    try {
      // Save to storage for persistence
      await saveAuthToStorage(user);

      // Dispatch successful sign up with user data (Facebook or email/password)
      dispatch(
        signUpSuccess({
          userId: user.userId,
          email: user.email,
          fullName: user.fullName,
          token: user.token,
        }),
      );

      // Fetch onboarding data from backend
      try {
        const response = await fetch(
          apiUrl(`/profile/${user.userId}/onboarding`),
        );

        if (response.ok) {
          // Onboarding data exists on backend
          const result = await response.json();
          const onboardingData = result.data;

          // Load into Redux
          dispatch(
            setOnboardingData({
              userAge: onboardingData.userAge,
              currentWeight: onboardingData.currentWeight,
              targetWeight: onboardingData.targetWeight,
              cuisine: onboardingData.cuisine,
            }),
          );
          dispatch(setOnboardingCompleted(true));

          // Save to local storage
          await saveOnboardingToStorage({
            userAge: onboardingData.userAge,
            currentWeight: onboardingData.currentWeight,
            targetWeight: onboardingData.targetWeight,
            cuisine: onboardingData.cuisine,
            savedAt: new Date().toISOString(),
            onboardingCompleted: true,
          });

          // Navigate to Dashboard
          navigation.navigate("AppDrawer" as never);
        } else {
          // No onboarding data found, go to Onboarding
          navigation.navigate("Onboarding" as never);
        }
      } catch (error) {
        console.error("Error fetching onboarding data:", error);
        // On error, check local storage as fallback
        const localData = await AsyncStorage.getItem("portionist_onboarding");
        if (localData) {
          navigation.navigate("AppDrawer" as never);
        } else {
          navigation.navigate("Onboarding" as never);
        }
      }
    } catch (error) {
      Alert.alert("Error", "Failed to create account");
      console.error(error);
    }
  };

  return (
    <SignUpScreen
      handleSignUp={handleSignUp}
      onNavigateToSignIn={() => navigation.navigate("SignIn" as never)}
    />
  );
}

// ============ APP SCREENS ============

// Wrapper for OnboardingScreen
function OnboardingScreenWrapper() {
  const dispatch = useDispatch();
  const navigation = useNavigation();
  const user = useSelector(selectAuthUser);

  const handleOnboardingSubmit = async (values: {
    age: number;
    currentWeight: number;
    targetWeight: number;
    cuisine: string;
  }) => {
    try {
      // Save to AsyncStorage for persistence
      saveOnboardingToStorage({
        userAge: values.age,
        currentWeight: values.currentWeight,
        targetWeight: values.targetWeight,
        cuisine: values.cuisine,
        savedAt: new Date().toISOString(),
        onboardingCompleted: true,
      });

      // Save to backend if user is authenticated
      if (user?.userId) {
        const response = await fetch(
          apiUrl(`/profile/${user.userId}/onboarding`),
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              userAge: values.age,
              currentWeight: values.currentWeight,
              targetWeight: values.targetWeight,
              cuisine: values.cuisine,
            }),
          },
        );

        if (!response.ok) {
          const errorData = await response.json();
          console.error(
            "Failed to save onboarding data to backend:",
            errorData,
          );
          // Don't block navigation if backend save fails - data is saved locally
        }
      }

      // Dispatch to Redux
      dispatch(
        setOnboardingData({
          userAge: values.age,
          currentWeight: values.currentWeight,
          targetWeight: values.targetWeight,
          cuisine: values.cuisine,
        }),
      );
      // Mark onboarding as completed
      dispatch(setOnboardingCompleted(true));

      console.log("✅ Onboarding completed, navigating to Dashboard...");
      console.log("User data:", user);
      console.log("Onboarding values:", values);

      // Navigate to Dashboard after onboarding
      navigation.navigate("AppDrawer" as never);
    } catch (error) {
      console.error("Error saving onboarding data:", error);
      // Navigate anyway - data is saved locally
      dispatch(
        setOnboardingData({
          userAge: values.age,
          currentWeight: values.currentWeight,
          targetWeight: values.targetWeight,
          cuisine: values.cuisine,
        }),
      );
      dispatch(setOnboardingCompleted(true));
      navigation.navigate("AppDrawer" as never);
    }
  };

  return <OnboardingScreen handleOnboardingSubmit={handleOnboardingSubmit} />;
}

// Wrapper for RecipeInputScreen
function RecipeInputScreenWrapper() {
  const navigation = useNavigation<any>();

  const handleGenerateRecipe = (values: any) => {
    // Pass search parameters to RecipeDisplay screen
    (navigation as any).navigate("RecipeDisplay", { searchParams: values });
  };

  return <RecipeInputScreen handleGenerateRecipe={handleGenerateRecipe} />;
}

// Wrapper for RecipeDisplayScreen
function RecipeDisplayScreenWrapper({ route }: any) {
  const navigation = useNavigation();
  const dispatch = useDispatch<AppDispatch>();
  const favorites = useSelector((state: RootState) => state.pantry.favorites);

  const handleFavorite = (recipe: any) => {
    // Add full recipe to favorites
    dispatch(addFavorite(recipe));
    Alert.alert(
      "Added to Favorites",
      `${recipe.name} has been saved to your favorites!`,
      [{ text: "OK" }],
    );
  };

  const handleUnfavorite = (recipeId: string) => {
    // Remove from favorites
    dispatch(removeFavorite(recipeId));
    Alert.alert("Removed from Favorites", "Recipe has been removed.", [
      { text: "OK" },
    ]);
  };

  const [recipes, setRecipes] = React.useState<any[] | null>(null);
  const [selectedRecipe, setSelectedRecipe] = React.useState<any | null>(null);
  const [loading, setLoading] = React.useState<boolean>(true);

  React.useEffect(() => {
    let mounted = true;
    async function loadRecipesFromAllSources() {
      // If we have a direct recipe (from Dashboard), skip fetching
      if (route?.params?.recipe) {
        setSelectedRecipe(route.params.recipe);
        setLoading(false);
        return;
      }

      setLoading(true);
      try {
        const raw = await AsyncStorage.getItem("portionist_onboarding");
        const onboard = raw ? JSON.parse(raw) : null;

        // Use search params from route if available, otherwise use defaults
        const searchParams = route?.params?.searchParams;
        const body: {
          mainIngredient: { id: string; name: string };
          sideIngredients: any[];
          currentWeight: number;
          targetWeight: number;
          mealType: string;
          cuisine: string;
        } = {
          mainIngredient: searchParams?.mainIngredient || {
            id: "chicken_breast",
            name: "Chicken",
          },
          sideIngredients: searchParams?.sideIngredients || ([] as any[]),
          currentWeight: onboard?.currentWeight ?? 70,
          targetWeight: onboard?.targetWeight ?? 75,
          mealType: searchParams?.mealType || "Lunch",
          cuisine: searchParams?.cuisine || onboard?.cuisine || "Asian",
        };

        console.log("📝 Fetching recipes with params:", body);

        // Fetch both database and AI recipes in parallel
        const [dbResponse, aiResponse] = await Promise.allSettled([
          fetch(apiUrl("/getRecipes"), {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(body),
          }).then((res) => res.json()),
          fetch(apiUrl("/recipes/generate"), {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(body),
          }).then((res) => res.json()),
        ]);

        if (!mounted) return;

        // Merge results
        const mergedRecipes: any[] = [];
        const recipesToSave: any[] = [];

        // Add database and Spoonacular recipes
        if (
          dbResponse.status === "fulfilled" &&
          dbResponse.value?.success &&
          Array.isArray(dbResponse.value.data)
        ) {
          mergedRecipes.push(
            ...dbResponse.value.data.map((r: any) => ({
              ...r,
              // Preserve existing source (e.g., "spoonacular"), otherwise default to "database"
              source: r.source || "database",
            })),
          );
        }

        // Add AI recipes
        if (
          aiResponse.status === "fulfilled" &&
          aiResponse.value?.success &&
          aiResponse.value.data
        ) {
          // Handle both single recipe and array of recipes
          const aiRecipes = Array.isArray(aiResponse.value.data)
            ? aiResponse.value.data
            : [aiResponse.value.data];

          const aiRecipesWithSource = aiRecipes.map((r: any) => ({
            ...r,
            source: "ai",
          }));

          mergedRecipes.push(...aiRecipesWithSource);
          recipesToSave.push(...aiRecipesWithSource);
        }

        // Also save Spoonacular recipes if present in dbResponse
        if (
          dbResponse.status === "fulfilled" &&
          dbResponse.value?.success &&
          Array.isArray(dbResponse.value.data)
        ) {
          const spoonacularRecipes = dbResponse.value.data.filter(
            (r: any) => r.source === "spoonacular",
          );
          if (spoonacularRecipes.length > 0) {
            recipesToSave.push(...spoonacularRecipes);
          }
        }

        // Save recipes to database if there are any to save
        if (recipesToSave.length > 0) {
          try {
            await fetch(apiUrl("/recipes/save"), {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ recipes: recipesToSave }),
            });
            console.log(`Saved ${recipesToSave.length} recipes to database`);
          } catch (saveErr) {
            console.warn("Failed to save recipes to database:", saveErr);
            // Don't fail the entire operation if saving fails
          }
        }

        if (mergedRecipes.length > 0) {
          setRecipes(mergedRecipes);
        } else {
          Alert.alert(
            "No recipes",
            "No matching recipes were found for your profile.",
          );
          navigation.goBack();
        }
      } catch (err) {
        console.error("Failed to fetch recipes:", err);
        Alert.alert("Error", "Failed to load recipes from server.");
        navigation.goBack();
      } finally {
        setLoading(false);
      }
    }

    loadRecipesFromAllSources();
    return () => {
      mounted = false;
    };
  }, [route?.params?.searchParams, route?.params?.recipe, navigation]);

  // Show loading state
  if (loading) {
    return (
      <View
        style={{
          flex: 1,
          justifyContent: "center",
          alignItems: "center",
          padding: 16,
          backgroundColor: "#fff",
        }}
      >
        <Text style={{ fontSize: 18, fontWeight: "600", marginBottom: 16 }}>
          Fetching recipes...
        </Text>
        <View
          style={{
            width: "80%",
            height: 8,
            backgroundColor: "#e5e7eb",
            borderRadius: 4,
            overflow: "hidden",
          }}
        >
          <View
            style={{
              height: "100%",
              backgroundColor: "#3b82f6",
              width: "60%",
            }}
          />
        </View>
        <Text style={{ color: "#6b7280", marginTop: 16, textAlign: "center" }}>
          Loading database and AI recipes
        </Text>
      </View>
    );
  }

  // Show detail view if recipe is selected
  if (selectedRecipe) {
    // Check if recipe is favorited
    const isFavorited = favorites.some((fav) => fav.id === selectedRecipe.id);

    return (
      <View style={{ flex: 1 }}>
        <RecipeDisplayScreen
          recipe={selectedRecipe}
          onFavorite={() => handleFavorite(selectedRecipe)}
          onUnfavorite={() => handleUnfavorite(selectedRecipe.id)}
          isFavorited={isFavorited}
        />
        <TouchableOpacity
          style={{
            backgroundColor: "#3b82f6",
            paddingVertical: 14,
            paddingHorizontal: 20,
            marginHorizontal: 20,
            marginBottom: 20,
            borderRadius: 16,
            alignItems: "center",
            shadowColor: "#3b82f6",
            shadowOffset: { width: 0, height: 4 },
            shadowOpacity: 0.3,
            shadowRadius: 8,
            elevation: 6,
          }}
          onPress={() => {
            // If we came from Dashboard, go back to Dashboard
            // If we came from search, go back to recipe list
            if (route?.params?.recipe) {
              navigation.goBack();
            } else {
              setSelectedRecipe(null);
            }
          }}
          activeOpacity={0.8}
        >
          <Text style={{ color: "white", fontSize: 16, fontWeight: "700" }}>
            ← {route?.params?.recipe ? "Back to Dashboard" : "Back to recipes"}
          </Text>
        </TouchableOpacity>
      </View>
    );
  }

  // Show recipe selection list
  if (recipes && recipes.length >= 1) {
    return (
      <RecipeSelectionList
        recipes={recipes}
        onSelectRecipe={setSelectedRecipe}
        onGoBack={() => navigation.goBack()}
      />
    );
  }

  return null;
}

// ============ MAIN NAVIGATOR ============

export default function AppNavigator() {
  const [isRestoring, setIsRestoring] = React.useState(true);

  // Restore auth and onboarding data from storage
  useAuthRestore();
  useOnboardingRestore();

  React.useEffect(() => {
    // Give some time for restoration hooks to complete
    const timer = setTimeout(() => {
      setIsRestoring(false);
    }, 500);
    return () => clearTimeout(timer);
  }, []);

  React.useEffect(() => {
    // Load any runtime API_BASE_URL override stored in AsyncStorage
    loadOverride().catch((e) =>
      console.error("Failed to load runtime API override", e),
    );

    // Install a temporary fetch wrapper to log requests and errors for debugging
    try {
      const originalFetch = (global as any).fetch;
      (global as any).fetch = async (input: any, init?: any) => {
        try {
          const url =
            typeof input === "string" ? input : input?.url || String(input);
          console.log(
            "[Fetch Debug] Request ->",
            url,
            init && { method: init.method, body: init.body },
          );
          const res = await originalFetch(input, init);
          console.log("[Fetch Debug] Response <-", url, "status:", res?.status);
          return res;
        } catch (err) {
          console.error("[Fetch Debug] Fetch error for", input, init, err);
          throw err;
        }
      };
    } catch (err) {
      console.warn("Could not install fetch debug wrapper", err);
    }
  }, []);

  const isAuthenticated = useSelector(selectIsAuthenticated);
  const onboardingCompleted = useSelector(selectOnboardingCompleted);

  // Determine initial route for App Stack
  const appInitialRouteName = onboardingCompleted ? "AppDrawer" : "Onboarding";

  // Show loading screen while restoring state
  if (isRestoring) {
    return (
      <View
        style={{
          flex: 1,
          justifyContent: "center",
          alignItems: "center",
          backgroundColor: "#f8fafc",
        }}
      >
        <ActivityIndicator size="large" color="#3b82f6" />
        <Text style={{ marginTop: 16, fontSize: 16, color: "#6b7280" }}>
          Loading...
        </Text>
      </View>
    );
  }

  return (
    <NavigationIndependentTree>
      <NavigationContainer>
        <Stack.Navigator
          initialRouteName={!isAuthenticated ? "SignIn" : appInitialRouteName}
          screenOptions={{
            headerShown: false,
          }}
        >
          {!isAuthenticated ? (
            // Auth Stack
            <>
              <Stack.Screen
                name="SignIn"
                component={SignInScreenWrapper}
                options={{
                  animationTypeForReplace: "push",
                }}
              />
              <Stack.Screen name="SignUp" component={SignUpScreenWrapper} />
            </>
          ) : (
            // App Stack with Drawer
            <>
              <Stack.Screen
                name="Onboarding"
                component={OnboardingScreenWrapper}
                options={{
                  animationTypeForReplace: "push",
                }}
              />
              {/* Main App with Drawer Navigation */}
              <Stack.Screen
                name="AppDrawer"
                component={AppDrawer}
                options={{
                  headerShown: false,
                }}
              />
              {/* Modal Screens (outside drawer) */}
              <Stack.Screen
                name="RecipeDisplay"
                component={RecipeDisplayScreenWrapper}
                options={{
                  presentation: "modal",
                }}
              />
            </>
          )}
        </Stack.Navigator>
      </NavigationContainer>
    </NavigationIndependentTree>
  );
}
