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
  StatusBar,
  Alert,
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

  // PAGINATION STATES (You were missing these)
  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const PAGE_SIZE = 20;

  const colorScheme = useColorScheme();
  const theme = Colors[colorScheme ?? "light"];
  const styles = useMemo(() => getStyles(theme), [theme]);

  const FILTERS = ["All", "Interview", "OA", "Internship"];

  // THE MODERATION ALERT LOGIC
  useEffect(() => {
    if (!user) return;

    const checkSystemNotifications = async () => {
      const { data, error } = await supabase
        .from("system_notifications")
        .select("*")
        .eq("user_id", user.id)
        .eq("is_read", false);

      if (error || !data || data.length === 0) return;

      data.forEach((notification) => {
        Alert.alert(notification.title, notification.message, [
          { text: "Understood" },
        ]);
      });

      await supabase
        .from("system_notifications")
        .update({ is_read: true })
        .in(
          "id",
          data.map((n) => n.id),
        );
    };

    checkSystemNotifications();
  }, [user]);

  // PAGINATED FETCH LOGIC (You were missing the .range() query)
  const fetchExperiences = async (isRefresh = false) => {
    // THE FIX: Block if we are currently loading a new page,
    // BUT allow it to pass if it is an initial load or a pull-to-refresh
    if (loading && !isRefresh) return;
    if (!hasMore && !isRefresh) return;

    setLoading(true);

    const from = isRefresh ? 0 : page * PAGE_SIZE;
    const to = from + PAGE_SIZE - 1;

    try {
      const { data, error } = await supabase
        .from("experiences")
        .select("*")
        .order("created_at", { ascending: false })
        .range(from, to);

      if (error) throw error;

      if (data.length < PAGE_SIZE) setHasMore(false);

      if (isRefresh) {
        setAllExperiences(data || []);
        setPage(1); // Reset to page 1 after a fresh load
      } else {
        setAllExperiences((prev) => [...prev, ...data]);
        setPage((prev) => prev + 1);
      }
    } catch (error) {
      console.error("Error fetching experiences:", error.message);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      fetchExperiences(true);
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
    setRefreshing(true);
    fetchExperiences(true);
  };

  // Extract the header so FlatList can manage it
  const renderHeader = () => (
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
                    isActive && { color: theme.white, fontWeight: "bold" },
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
  );

  return (
    <View
      style={[styles.container, { paddingTop: StatusBar.currentHeight || 0 }]}
    >
      <StatusBar
        barStyle={colorScheme === "dark" ? "light-content" : "dark-content"}
      />

      {/* THE FLATLIST (Replaces your ScrollView) */}
      <FlatList
        data={filteredExperiences}
        keyExtractor={(item) => item.id.toString()}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        keyboardDismissMode="on-drag"
        contentContainerStyle={{ paddingBottom: 100 }}
        ListHeaderComponent={renderHeader}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={theme.primary}
          />
        }
        renderItem={({ item }) => (
          // readOnly is false here so buttons show up!
          <ExperienceCard item={item} readOnly={false} />
        )}
        onEndReached={() => {
          // Only paginate if we aren't heavily filtering
          if (searchQuery.length === 0 && selectedCategory === "All") {
            fetchExperiences();
          }
        }}
        onEndReachedThreshold={0.5}
        ListFooterComponent={
          loading && allExperiences.length > 0 ? (
            <ActivityIndicator
              size="small"
              color={theme.primary}
              style={{ marginVertical: 20 }}
            />
          ) : null
        }
        ListEmptyComponent={
          !loading ? (
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
          ) : (
            <View style={styles.loaderContainer}>
              <ActivityIndicator size="large" color={theme.primary} />
            </View>
          )
        }
      />
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
