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
    <View style={styles.headerContainer}>
      <Text style={styles.brandTitle}>Saved Posts</Text>
      <Text style={styles.headerSubtitle}>
        Your personal question bank for quick revision.
      </Text>
    </View>
  );

  return (
    <View
      style={[styles.container, { paddingTop: StatusBar.currentHeight || 0 }]}
    >
      <StatusBar
        barStyle={colorScheme === "dark" ? "light-content" : "dark-content"}
      />

      <FlatList
        data={savedPosts}
        keyExtractor={(item) => item.id.toString()}
        showsVerticalScrollIndicator={false}
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
        )}
        ListEmptyComponent={
          !loading ? (
            <View style={styles.emptyState}>
              <Ionicons
                name="bookmark-outline"
                size={48}
                color={theme.textSecondary}
              />
              <Text style={styles.emptyText}>No saved posts yet</Text>
              <Text style={styles.emptySubText}>
                Tap the bookmark icon on any experience to save it here.
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
      marginBottom: 24,
      paddingTop: 10,
    },
    brandTitle: {
      fontSize: 34,
      fontWeight: "900",
      color: theme.primary,
      letterSpacing: -1,
      marginBottom: 4,
    },
    headerSubtitle: {
      fontSize: 16,
      color: theme.textSecondary,
      fontWeight: "600",
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
      textAlign: "center",
      paddingHorizontal: 20,
    },
    loaderContainer: {
      alignItems: "center",
      justifyContent: "center",
      marginTop: 80,
    },
  });