import React, { useEffect, useRef, useState } from "react";
import {
    ActivityIndicator,
    Animated,
    StyleSheet,
    Text,
    View,
} from "react-native";
import { useSelector } from "react-redux";
import { selectToken } from "../frontend/redux/authSlice";
import { apiUrl } from "../frontend/services/config";

interface MacroData {
  protein: number;
  carbs: number;
  veg: number;
  fat: number;
}

interface MacroPercentage {
  name: string;
  percentage: number;
  color: string;
  grams: number;
}

const TodayPlateBalance: React.FC = () => {
  const [macros, setMacros] = useState<MacroData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const token = useSelector(selectToken);

  // Animation values for each bar
  const proteinAnim = useRef(new Animated.Value(0)).current;
  const carbsAnim = useRef(new Animated.Value(0)).current;
  const vegAnim = useRef(new Animated.Value(0)).current;
  const fatAnim = useRef(new Animated.Value(0)).current;
  const scoreAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    fetchTodaysMacros();
  }, []);

  const fetchTodaysMacros = async () => {
    try {
      setLoading(true);
      setError(null);

      const headers: HeadersInit = {
        "Content-Type": "application/json",
      };

      if (token) {
        headers["Authorization"] = `Bearer ${token}`;
      }

      const response = await fetch(`${apiUrl}/api/diary/today`, { headers });

      if (!response.ok) {
        throw new Error("Failed to fetch today's data");
      }

      const data: MacroData = await response.json();
      setMacros(data);

      // Animate bars after data is loaded
      const total = data.protein + data.carbs + data.veg + data.fat;
      if (total > 0) {
        const score = calculatePortionScore(data);

        Animated.parallel([
          Animated.stagger(100, [
            Animated.timing(proteinAnim, {
              toValue: (data.protein / total) * 100,
              duration: 800,
              useNativeDriver: false,
            }),
            Animated.timing(carbsAnim, {
              toValue: (data.carbs / total) * 100,
              duration: 800,
              useNativeDriver: false,
            }),
            Animated.timing(vegAnim, {
              toValue: (data.veg / total) * 100,
              duration: 800,
              useNativeDriver: false,
            }),
            Animated.timing(fatAnim, {
              toValue: (data.fat / total) * 100,
              duration: 800,
              useNativeDriver: false,
            }),
          ]),
          Animated.timing(scoreAnim, {
            toValue: score,
            duration: 1000,
            useNativeDriver: false,
          }),
        ]).start();
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  const calculatePortionScore = (data: MacroData): number => {
    const total = data.protein + data.carbs + data.veg + data.fat;
    if (total === 0) return 0;

    // Calculate actual percentages
    const actualProtein = (data.protein / total) * 100;
    const actualCarbs = (data.carbs / total) * 100;
    const actualVeg = (data.veg / total) * 100;
    const actualFat = (data.fat / total) * 100;

    // Ideal distribution
    const idealProtein = 30;
    const idealCarbs = 40;
    const idealVeg = 20;
    const idealFat = 10;

    // Calculate deviations
    const proteinDiff = Math.abs(actualProtein - idealProtein);
    const carbsDiff = Math.abs(actualCarbs - idealCarbs);
    const vegDiff = Math.abs(actualVeg - idealVeg);
    const fatDiff = Math.abs(actualFat - idealFat);

    // Average deviation
    const avgDeviation = (proteinDiff + carbsDiff + vegDiff + fatDiff) / 4;

    // Score: 100 means perfect match, 0 means complete mismatch
    // Maximum possible deviation is 100, so we normalize
    const score = Math.max(0, Math.min(100, 100 - avgDeviation));

    return Math.round(score);
  };

  const calculatePercentages = (): MacroPercentage[] => {
    if (!macros) return [];

    const total = macros.protein + macros.carbs + macros.veg + macros.fat;
    if (total === 0) return [];

    return [
      {
        name: "Protein",
        percentage: Math.round((macros.protein / total) * 100),
        color: "#4CAF50",
        grams: macros.protein,
      },
      {
        name: "Carbs",
        percentage: Math.round((macros.carbs / total) * 100),
        color: "#FF9800",
        grams: macros.carbs,
      },
      {
        name: "Veg",
        percentage: Math.round((macros.veg / total) * 100),
        color: "#8BC34A",
        grams: macros.veg,
      },
      {
        name: "Fat",
        percentage: Math.round((macros.fat / total) * 100),
        color: "#F44336",
        grams: macros.fat,
      },
    ];
  };

  const renderProgressBar = (
    macro: MacroPercentage,
    animatedValue: Animated.Value,
  ) => {
    return (
      <View key={macro.name} style={styles.barContainer}>
        <View style={styles.labelRow}>
          <Text style={styles.macroLabel}>{macro.name}</Text>
          <Text style={styles.percentageLabel}>{macro.percentage}%</Text>
        </View>
        <View style={styles.progressBarTrack}>
          <Animated.View
            style={[
              styles.progressBarFill,
              {
                backgroundColor: macro.color,
                width: animatedValue.interpolate({
                  inputRange: [0, 100],
                  outputRange: ["0%", "100%"],
                }),
              },
            ]}
          />
        </View>
        <Text style={styles.gramsLabel}>{macro.grams}g</Text>
      </View>
    );
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <Text style={styles.title}>Today's Plate Balance</Text>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#4ECDC4" />
        </View>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.container}>
        <Text style={styles.title}>Today's Plate Balance</Text>
        <View style={styles.emptyContainer}>
          <Text style={styles.errorText}>Unable to load data</Text>
        </View>
      </View>
    );
  }

  const percentages = calculatePercentages();

  if (percentages.length === 0) {
    return (
      <View style={styles.container}>
        <Text style={styles.title}>Today's Plate Balance</Text>
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>No meals logged today.</Text>
        </View>
      </View>
    );
  }

  const animations = [proteinAnim, carbsAnim, vegAnim, fatAnim];
  const portionScore = macros ? calculatePortionScore(macros) : 0;

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Today's Plate Balance</Text>
        <View style={styles.scoreBadge}>
          <Animated.Text style={styles.scoreNumber}>
            {scoreAnim.interpolate({
              inputRange: [0, 100],
              outputRange: ["0", "100"],
            })}
          </Animated.Text>
          <Text style={styles.scoreLabel}>Score</Text>
        </View>
      </View>
      <View style={styles.barsContainer}>
        {percentages.map((macro, index) =>
          renderProgressBar(macro, animations[index]),
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 20,
    marginVertical: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
  },
  title: {
    fontSize: 20,
    fontWeight: "700",
    color: "#2C3E50",
    letterSpacing: 0.5,
    flex: 1,
  },
  scoreBadge: {
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: "#4CAF50",
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  scoreNumber: {
    fontSize: 24,
    fontWeight: "800",
    color: "#FFFFFF",
  },
  scoreLabel: {
    fontSize: 10,
    fontWeight: "600",
    color: "#FFFFFF",
    marginTop: 2,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  barsContainer: {
    gap: 16,
  },
  barContainer: {
    marginBottom: 4,
  },
  labelRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  macroLabel: {
    fontSize: 15,
    fontWeight: "600",
    color: "#34495E",
  },
  percentageLabel: {
    fontSize: 15,
    fontWeight: "700",
    color: "#2C3E50",
  },
  progressBarTrack: {
    height: 12,
    backgroundColor: "#ECF0F1",
    borderRadius: 6,
    overflow: "hidden",
    marginBottom: 4,
  },
  progressBarFill: {
    height: "100%",
    borderRadius: 6,
  },
  gramsLabel: {
    fontSize: 12,
    color: "#7F8C8D",
    marginTop: 2,
  },
  loadingContainer: {
    paddingVertical: 40,
    alignItems: "center",
    justifyContent: "center",
  },
  emptyContainer: {
    paddingVertical: 40,
    alignItems: "center",
    justifyContent: "center",
  },
  emptyText: {
    fontSize: 16,
    color: "#95A5A6",
    fontStyle: "italic",
  },
  errorText: {
    fontSize: 16,
    color: "#E74C3C",
  },
});

export default TodayPlateBalance;
