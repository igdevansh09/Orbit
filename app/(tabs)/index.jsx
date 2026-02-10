import {
  View,
  Text,
  FlatList,
  ActivityIndicator,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  RefreshControl,
  useColorScheme,
  Keyboard,
  ScrollView,
  StatusBar,
} from "react-native";
import { useState, useEffect, useCallback, useMemo } from "react";
import { useFocusEffect } from "expo-router";
import { Ionicons } from "@expo/vector-icons";

// Internal Imports
import { supabase } from "../../lib/supabase";
import ExperienceCard from "../../components/ExperienceCard";
import { Colors } from "../../constants/colors";

export default function Home() {
  const [allExperiences, setAllExperiences] = useState([]); // Store ALL data
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // --- SEARCH & FILTER STATE ---
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");

  const colorScheme = useColorScheme();
  const theme = Colors[colorScheme ?? "light"];
  const styles = useMemo(() => getStyles(theme), [theme]);

  // Categories for Filter Chips
  const FILTERS = ["All", "Interview", "OA", "Internship"];

  // --- FETCH ALL DATA ONCE ---
  const fetchExperiences = async (isRefresh = false) => {
    try {
      if (isRefresh) setRefreshing(true);
      else if (allExperiences.length === 0) setLoading(true);

      const { data, error } = await supabase
        .from("experiences")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      setAllExperiences(data || []);
    } catch (error) {
      console.error("Error fetching experiences:", error.message);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  // --- INITIAL LOAD & FOCUS REFRESH ---
  useFocusEffect(
    useCallback(() => {
      fetchExperiences();
    }, []),
  );

  // --- CLIENT-SIDE FILTERING (INSTANT, NO API CALLS) ---
  const filteredExperiences = useMemo(() => {
    let result = allExperiences;

    // Apply Category Filter
    if (selectedCategory !== "All") {
      result = result.filter((exp) => exp.category === selectedCategory);
    }

    // Apply Search Filter
    if (searchQuery.trim().length > 0) {
      const query = searchQuery.toLowerCase();
      result = result.filter(
        (exp) =>
          exp.company?.toLowerCase().includes(query) ||
          exp.role?.toLowerCase().includes(query),
      );
    }

    return result;
  }, [allExperiences, selectedCategory, searchQuery]);

  const onRefresh = () => {
    fetchExperiences(true);
  };

  return (
    <View style={[styles.container, {paddingTop: StatusBar.currentHeight || 0}]}>
      <StatusBar
        barStyle={colorScheme === "dark" ? "light-content" : "dark-content"}
      />
      <ScrollView
        contentContainerStyle={{ paddingBottom: 100 }}
        keyboardShouldPersistTaps="handled"
        keyboardDismissMode="on-drag"
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={theme.primary}
          />
        }
      >
        {/* HEADER */}
        <View style={styles.headerContainer}>
          {/* BRANDING HEADER */}
          <View style={styles.topRow}>
            <View>
              <Text style={styles.brandTitle}>Orbit 🚀</Text>
              <Text style={styles.headerSubtitle}>
                Discover interview experiences
              </Text>
            </View>

            {/* Notification / Profile Placeholder */}
            {/* <TouchableOpacity style={styles.iconBtn}>
              <Ionicons
                name="notifications-outline"
                size={24}
                color={theme.textPrimary}
              />
            </TouchableOpacity> */}
          </View>

          {/* SEARCH BAR */}
          <View style={styles.searchContainer}>
            <Ionicons
              name="search"
              size={20}
              color={theme.textSecondary}
              style={{ marginRight: 8 }}
            />
            <TextInput
              placeholder="Search company or role (e.g. Google)..."
              placeholderTextColor={theme.placeholderText}
              value={searchQuery}
              onChangeText={setSearchQuery}
              style={styles.searchInput}
              returnKeyType="search"
              autoCorrect={false}
              autoCapitalize="none"
            />
            {searchQuery.length > 0 && (
              <TouchableOpacity onPress={() => setSearchQuery("")}>
                <Ionicons
                  name="close-circle"
                  size={18}
                  color={theme.textSecondary}
                />
              </TouchableOpacity>
            )}
          </View>

          {/* FILTER CHIPS */}
          <View style={styles.filterContainer}>
            <FlatList
              horizontal
              data={FILTERS}
              showsHorizontalScrollIndicator={false}
              keyExtractor={(item) => item}
              contentContainerStyle={{ gap: 8, paddingRight: 16 }}
              renderItem={({ item }) => {
                const isActive = selectedCategory === item;
                return (
                  <TouchableOpacity
                    onPress={() => setSelectedCategory(item)}
                    style={[
                      styles.chip,
                      isActive && {
                        backgroundColor: theme.primary,
                        borderColor: theme.primary,
                      },
                    ]}
                  >
                    <Text
                      style={[
                        styles.chipText,
                        isActive && { color: "#FFF", fontWeight: "bold" },
                      ]}
                    >
                      {item}
                    </Text>
                  </TouchableOpacity>
                );
              }}
            />
          </View>

          {/* RESULT COUNT */}
          {(searchQuery || selectedCategory !== "All") && (
            <Text style={styles.resultCount}>
              {filteredExperiences.length}{" "}
              {filteredExperiences.length === 1 ? "result" : "results"} found
            </Text>
          )}
        </View>

        {/* RESULTS LIST */}
        {loading && allExperiences.length === 0 ? (
          <View style={styles.loaderContainer}>
            <ActivityIndicator size="large" color={theme.primary} />
          </View>
        ) : filteredExperiences.length > 0 ? (
          filteredExperiences.map((item) => (
            <ExperienceCard key={item.id} item={item} readOnly={true} />
          ))
        ) : (
          <View style={styles.emptyState}>
            <Ionicons
              name="search-outline"
              size={48}
              color={theme.textSecondary}
            />
            <Text style={styles.emptyText}>No results found</Text>
            <Text style={styles.emptySubText}>
              Try a different keyword or category.
            </Text>
          </View>
        )}
      </ScrollView>
    </View>
  );
}

// --- STYLES ---
const getStyles = (theme) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.background,
      paddingHorizontal: 16,
      paddingTop: 10,
    },
    headerContainer: {
      marginBottom: 16,
      paddingTop: 10,
    },
    topRow: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      marginBottom: 20,
      marginTop: 10,
    },
    brandTitle: {
      fontSize: 32, // Branding Size
      fontWeight: "900", // Extra Bold
      color: theme.primary, // Brand Color
      letterSpacing: -1,
    },
    headerSubtitle: {
      fontSize: 14,
      color: theme.textSecondary,
      fontWeight: "500",
    },
    iconBtn: {
      padding: 8,
      borderRadius: 50,
      backgroundColor: theme.cardBackground,
      borderWidth: 1,
      borderColor: theme.border,
    },
    // Search Bar
    searchContainer: {
      flexDirection: "row",
      alignItems: "center",
      backgroundColor: theme.inputBackground,
      borderRadius: 14,
      paddingHorizontal: 12,
      height: 52,
      borderWidth: 1,
      borderColor: theme.border,
      marginBottom: 16,
    },
    searchInput: {
      flex: 1,
      fontSize: 16,
      color: theme.textPrimary,
      height: "100%",
    },
    // Filters
    filterContainer: {
      flexDirection: "row",
      marginBottom: 12,
    },
    chip: {
      paddingVertical: 8,
      paddingHorizontal: 18,
      borderRadius: 24,
      backgroundColor: theme.cardBackground,
      borderWidth: 1,
      borderColor: theme.border,
      marginRight: 8,
    },
    chipText: {
      fontSize: 14,
      color: theme.textPrimary,
      fontWeight: "500",
    },
    // Result Count
    resultCount: {
      fontSize: 13,
      color: theme.textSecondary,
      marginTop: 4,
      marginLeft: 4,
      fontWeight: "500",
    },
    // Empty State
    emptyState: {
      alignItems: "center",
      justifyContent: "center",
      marginTop: 60,
    },
    emptyText: {
      fontSize: 18,
      fontWeight: "bold",
      color: theme.textPrimary,
      marginTop: 12,
    },
    emptySubText: {
      fontSize: 14,
      color: theme.textSecondary,
      marginTop: 4,
    },
    loaderContainer: {
      alignItems: "center",
      justifyContent: "center",
      marginTop: 80,
    },
  });
