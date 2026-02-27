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
  ScrollView,
  StatusBar,
} from "react-native";
import { useState, useEffect, useCallback, useMemo } from "react";
import { useFocusEffect } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { Image } from "expo-image";
import { useRouter } from "expo-router";
import { useAuthStore } from "../../store/authStore";
import { supabase } from "../../lib/supabase";
import ExperienceCard from "../../components/ExperienceCard";
import { Colors } from "../../constants/colors";

export default function Home() {
  const [allExperiences, setAllExperiences] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
const { user } = useAuthStore();
const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");

  const colorScheme = useColorScheme();
  const theme = Colors[colorScheme ?? "light"];
  const styles = useMemo(() => getStyles(theme), [theme]);

  const FILTERS = ["All", "Interview", "OA", "Internship"];

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

  useFocusEffect(
    useCallback(() => {
      fetchExperiences();
    }, []),
  );

  const filteredExperiences = useMemo(() => {
    let result = allExperiences;

    if (selectedCategory !== "All") {
      result = result.filter((exp) => exp.category === selectedCategory);
    }

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
    <View
      style={[styles.container, { paddingTop: StatusBar.currentHeight || 0 }]}
    >
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
        <View style={styles.headerContainer}>
          <View style={styles.topRow}>
            <View>
              <Text style={styles.brandTitle}>
                Orbit <Text style={{ fontSize: 28 }}>🚀</Text>
              </Text>
              <Text style={styles.headerSubtitle}>
                Welcome back,{" "}
                {user?.user_metadata?.username?.split(" ")[0] || "Scholar"}.
              </Text>
            </View>

            <TouchableOpacity
              onPress={() => router.push("/(tabs)/profile")}
              activeOpacity={0.8}
              style={styles.avatarShadow}
            >
              <Image
                source={{
                  uri:
                    user?.user_metadata?.avatar_url ||
                    `https://ui-avatars.com/api/?name=${user?.user_metadata?.username || "S"}&background=random`,
                }}
                style={styles.headerAvatar}
                contentFit="cover"
              />
            </TouchableOpacity>
          </View>

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

          <View style={styles.filterContainer}>
            <FlatList
              horizontal
              data={FILTERS}
              showsHorizontalScrollIndicator={false}
              keyExtractor={(item) => item}
              contentContainerStyle={{ gap: 4, paddingRight: 16 }}
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

          {(searchQuery || selectedCategory !== "All") && (
            <Text style={styles.resultCount}>
              {filteredExperiences.length}{" "}
              {filteredExperiences.length === 1 ? "result" : "results"} found
            </Text>
          )}
        </View>

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
      marginBottom: 24,
      marginTop: 10,
    },
    brandTitle: {
      fontSize: 38,
      fontWeight: "900", 
      color: theme.primary,
      letterSpacing: -1.5,
      marginBottom: 4,
    },
    headerSubtitle: {
      fontSize: 16,
      color: theme.textSecondary,
      fontWeight: "600",
      letterSpacing: -0.2,
    },
    avatarShadow: {
      shadowColor: theme.primary,
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.15,
      shadowRadius: 8,
      elevation: 4,
    },
    headerAvatar: {
      width: 48,
      height: 48,
      borderRadius: 24,
      backgroundColor: theme.inputBackground,
      borderWidth: 2,
      borderColor: theme.background, 
    },
    iconBtn: {
      padding: 8,
      borderRadius: 50,
      backgroundColor: theme.cardBackground,
      borderWidth: 1,
      borderColor: theme.border,
    },
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
    resultCount: {
      fontSize: 13,
      color: theme.textSecondary,
      marginTop: 4,
      marginLeft: 4,
      fontWeight: "500",
    },
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
