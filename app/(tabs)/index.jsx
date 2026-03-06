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
import { LinearGradient } from "expo-linear-gradient";
import Animated, { FadeInDown, FadeInUp } from "react-native-reanimated";

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

  // PAGINATION STATES
  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const PAGE_SIZE = 20;

  const colorScheme = useColorScheme();
  const theme = Colors[colorScheme ?? "light"];
  const styles = useMemo(() => getStyles(theme), [theme]);

  // Dynamic background gradient based on theme
  const backgroundGradient = [theme.background, theme.cardBackground];

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

  // PAGINATED FETCH LOGIC
  const fetchExperiences = async (isRefresh = false) => {
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
        setPage(1);
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
      <Animated.View
        entering={FadeInDown.delay(50).springify()}
        style={styles.topRow}
      >
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
      </Animated.View>

      <Animated.View
        entering={FadeInDown.delay(150).springify()}
        style={styles.searchContainer}
      >
        <Ionicons
          name="search"
          size={22}
          color={theme.textSecondary}
          style={{ marginRight: 10 }}
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
          <TouchableOpacity
            onPress={() => setSearchQuery("")}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <Ionicons
              name="close-circle"
              size={20}
              color={theme.textSecondary}
            />
          </TouchableOpacity>
        )}
      </Animated.View>

      <Animated.View
        entering={FadeInDown.delay(250).springify()}
        style={styles.filterContainer}
      >
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
                activeOpacity={0.7}
              >
                <LinearGradient
                  colors={
                    isActive
                      ? [theme.primary, theme.textPrimary]
                      : [theme.cardBackground, theme.cardBackground]
                  }
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  style={[
                    styles.chip,
                    isActive ? styles.chipActive : styles.chipInactive,
                  ]}
                >
                  <Text
                    style={[
                      styles.chipText,
                      isActive
                        ? { color: theme.white, fontWeight: "800" }
                        : { color: theme.textSecondary },
                    ]}
                  >
                    {item}
                  </Text>
                </LinearGradient>
              </TouchableOpacity>
            );
          }}
        />
      </Animated.View>

      {(searchQuery || selectedCategory !== "All") && (
        <Animated.Text
          entering={FadeInUp.delay(300).springify()}
          style={styles.resultCount}
        >
          {filteredExperiences.length}{" "}
          {filteredExperiences.length === 1 ? "result" : "results"} found
        </Animated.Text>
      )}
    </View>
  );

  return (
    <LinearGradient
      colors={backgroundGradient}
      style={[styles.container, { paddingTop: StatusBar.currentHeight || 0 }]}
    >
      <StatusBar
        barStyle={colorScheme === "dark" ? "light-content" : "dark-content"}
        backgroundColor="transparent"
        translucent
      />

      {/* THE FLATLIST */}
      <FlatList
        data={filteredExperiences}
        keyExtractor={(item) => item.id.toString()}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        keyboardDismissMode="on-drag"
        contentContainerStyle={{ paddingBottom: 120, paddingHorizontal: 16 }}
        ListHeaderComponent={renderHeader}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={theme.primary}
          />
        }
        renderItem={({ item, index }) => (
          <Animated.View
            entering={FadeInUp.delay(
              index < 5 ? 300 + index * 100 : 0,
            ).springify()}
          >
            <ExperienceCard item={item} />
          </Animated.View>
        )}
        onEndReached={() => {
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
              style={{ marginVertical: 24 }}
            />
          ) : null
        }
        ListEmptyComponent={
          !loading ? (
            <Animated.View
              entering={FadeInUp.delay(200)}
              style={styles.emptyState}
            >
              <View style={styles.emptyIconWrapper}>
                <Ionicons
                  name="search-outline"
                  size={54}
                  color={theme.textSecondary}
                />
              </View>
              <Text style={styles.emptyText}>No results found</Text>
              <Text style={styles.emptySubText}>
                Try adjusting your search or filters.
              </Text>
            </Animated.View>
          ) : (
            <View style={styles.loaderContainer}>
              <ActivityIndicator size="large" color={theme.textPrimary} />
            </View>
          )
        }
      />
    </LinearGradient>
  );
}

const getStyles = (theme) =>
  StyleSheet.create({
    container: {
      flex: 1,
    },
    headerContainer: {
      marginBottom: 20,
      paddingTop: 16,
    },
    topRow: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      marginBottom: 28,
    },
    brandTitle: {
      fontSize: 40,
      fontWeight: "900",
      color: theme.textPrimary,
      letterSpacing: -1.5,
      marginBottom: 4,
    },
    headerSubtitle: {
      fontSize: 16,
      color: theme.textSecondary,
      fontWeight: "600",
      letterSpacing: 0.2,
    },
    avatarShadow: {
      shadowColor: theme.primary,
      shadowOffset: { width: 0, height: 6 },
      shadowOpacity: 0.2,
      shadowRadius: 10,
      elevation: 6,
    },
    headerAvatar: {
      width: 52,
      height: 52,
      borderRadius: 26,
      backgroundColor: theme.inputBackground,
      borderWidth: 2,
      borderColor: theme.border,
    },
    searchContainer: {
      flexDirection: "row",
      alignItems: "center",
      backgroundColor: theme.inputBackground,
      borderRadius: 16, // Smoother border radius matching auth
      paddingHorizontal: 16,
      height: 60,
      borderWidth: 1,
      borderColor: theme.border,
      marginBottom: 20,
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.05,
      shadowRadius: 12,
      elevation: 2,
    },
    searchInput: {
      flex: 1,
      fontSize: 16,
      color: theme.textPrimary,
      height: "100%",
      fontWeight: "500",
    },
    filterContainer: {
      flexDirection: "row",
      marginBottom: 16,
    },
    chip: {
      paddingVertical: 10,
      paddingHorizontal: 20,
      borderRadius: 24, // Pill shape
      justifyContent: "center",
      alignItems: "center",
    },
    chipActive: {
      borderWidth: 0, // Gradient takes care of this
      shadowColor: theme.primary,
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.3,
      shadowRadius: 8,
      elevation: 5,
    },
    chipInactive: {
      borderWidth: 1,
      borderColor: theme.border,
    },
    chipText: {
      fontSize: 14,
      fontWeight: "600",
      letterSpacing: 0.3,
    },
    resultCount: {
      fontSize: 14,
      color: theme.textSecondary,
      marginTop: 8,
      marginLeft: 4,
      fontWeight: "600",
    },
    emptyState: {
      alignItems: "center",
      justifyContent: "center",
      marginTop: 80,
    },
    emptyIconWrapper: {
      width: 100,
      height: 100,
      borderRadius: 50,
      backgroundColor: theme.inputBackground,
      justifyContent: "center",
      alignItems: "center",
      marginBottom: 20,
      borderWidth: 1,
      borderColor: theme.border,
    },
    emptyText: {
      fontSize: 20,
      fontWeight: "800",
      color: theme.textPrimary,
      marginTop: 12,
      letterSpacing: -0.5,
    },
    emptySubText: {
      fontSize: 15,
      color: theme.textSecondary,
      marginTop: 8,
      fontWeight: "500",
    },
    loaderContainer: {
      alignItems: "center",
      justifyContent: "center",
      marginTop: 100,
    },
  });
