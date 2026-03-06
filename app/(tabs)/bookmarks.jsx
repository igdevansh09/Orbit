import {
  View,
  Text,
  FlatList,
  ActivityIndicator,
  StyleSheet,
  RefreshControl,
  useColorScheme,
  StatusBar,
} from "react-native";
import { useState, useCallback, useMemo } from "react";
import { useFocusEffect } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import Animated, { FadeInDown, FadeInUp } from "react-native-reanimated";
import { useAuthStore } from "../../store/authStore";
import { supabase } from "../../lib/supabase";
import ExperienceCard from "../../components/ExperienceCard";
import { Colors } from "../../constants/colors";

export default function Bookmarks() {
  const [savedPosts, setSavedPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const { user } = useAuthStore();

  const colorScheme = useColorScheme();
  const theme = Colors[colorScheme ?? "light"];
  const styles = useMemo(() => getStyles(theme), [theme]);

  // Dynamic background gradient based on theme
  const backgroundGradient = [theme.background, theme.cardBackground];

  const fetchBookmarks = async (isRefresh = false) => {
    if (!user) return;
    if (!isRefresh) setLoading(true);

    // This query fetches the bookmark AND joins the associated experience data
    const { data, error } = await supabase
      .from("bookmarks")
      .select("*, experiences(*)")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false });

    if (error) {
      console.error(error);
    } else {
      // Filter out any bookmarks where the experience might have been deleted
      const validPosts = data
        .filter((b) => b.experiences !== null)
        .map((b) => b.experiences);

      setSavedPosts(validPosts);
    }

    setLoading(false);
    setRefreshing(false);
  };

  useFocusEffect(
    useCallback(() => {
      fetchBookmarks();
    }, [user]),
  );

  const onRefresh = () => {
    setRefreshing(true);
    fetchBookmarks(true);
  };

  const renderHeader = () => (
    <Animated.View
      entering={FadeInDown.delay(50).springify()}
      style={styles.headerContainer}
    >
      <Text style={styles.brandTitle}>Saved Posts</Text>
      <Text style={styles.headerSubtitle}>
        Your personal question bank for quick revision.
      </Text>
    </Animated.View>
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

      <FlatList
        data={savedPosts}
        keyExtractor={(item) => item.id.toString()}
        showsVerticalScrollIndicator={false}
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
              index < 6 ? 150 + index * 100 : 0,
            ).springify()}
          >
            <ExperienceCard
              item={item}
              readOnly={false}
              // If they unsave it here, remove it from this list immediately
              onDeleteSuccess={(deletedId) => {
                setSavedPosts((prev) =>
                  prev.filter((post) => post.id !== deletedId),
                );
              }}
            />
          </Animated.View>
        )}
        ListEmptyComponent={
          !loading ? (
            <Animated.View
              entering={FadeInUp.delay(200)}
              style={styles.emptyState}
            >
              <View style={styles.emptyIconWrapper}>
                <Ionicons
                  name="bookmark-outline"
                  size={54}
                  color={theme.textSecondary}
                />
              </View>
              <Text style={styles.emptyText}>No saved posts yet</Text>
              <Text style={styles.emptySubText}>
                Tap the bookmark icon on any experience to save it here.
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
      marginBottom: 24,
      paddingTop: 16,
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
      textAlign: "center",
      paddingHorizontal: 24,
      fontWeight: "500",
      lineHeight: 22,
    },
    loaderContainer: {
      alignItems: "center",
      justifyContent: "center",
      marginTop: 100,
    },
  });
