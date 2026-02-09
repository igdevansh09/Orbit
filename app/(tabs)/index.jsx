import {
  View,
  Text,
  FlatList,
  RefreshControl,
  TouchableOpacity,
  useColorScheme,
  ActivityIndicator,
} from "react-native";
import { Image } from "expo-image";
import { useEffect, useState, useMemo } from "react";
import { Ionicons } from "@expo/vector-icons";

// Imports
import { getHomeStyles } from "../../assets/styles/home.styles";
import { Colors } from "../../constants/colors";
import { supabase } from "../../lib/supabase";

// --- 1. SUB-COMPONENT: Feed Card ---
const FeedCard = ({ item, theme, styles }) => {
  const [expanded, setExpanded] = useState(false);
  const CAPTION_LIMIT = 100;
  const captionText = item.description || "";
  const isLongText = captionText.length > CAPTION_LIMIT;

  const renderStars = (rating) => {
    return [1, 2, 3, 4, 5].map((i) => (
      <Ionicons
        key={i}
        name={i <= rating ? "star" : "star-outline"}
        size={16}
        color={i <= rating ? "#f4b400" : theme.textSecondary}
        style={{ marginRight: 2 }}
      />
    ));
  };

  return (
    <View style={styles.bookCard}>
      {/* HEADER: User Info */}
      <View style={styles.bookHeader}>
        <View style={styles.userInfo}>
          {/* Avatar: Uses Saved Post Avatar OR Fallback */}
          <Image
            source={{
              uri:
                item.user_avatar ||
                `https://ui-avatars.com/api/?name=${item.username || "User"}&background=random&color=fff&size=128`,
            }}
            style={styles.avatar}
            contentFit="cover"
            transition={500}
          />
          <View>
            {/* 1. AUTHOR NAME */}
            <Text style={styles.username}>{item.username || "Anonymous"}</Text>

            {/* 2. COLLEGE & BRANCH */}
            <Text
              style={{
                fontSize: 12,
                fontWeight: "600",
                color: theme.primary,
                marginTop: 2,
              }}
            >
              {item.college || "NSUT"} • {item.branch || "Student"}
            </Text>
          </View>
        </View>
      </View>

      {/* IMAGE (If available) */}
      {item.image_url && (
        <View style={styles.bookImageContainer}>
          <Image
            source={{ uri: item.image_url }}
            style={styles.bookImage}
            contentFit="cover"
            transition={500}
          />
        </View>
      )}

      {/* DETAILS */}
      <View style={styles.bookDetails}>
        <Text style={styles.bookTitle}>{item.company}</Text>

        <View style={styles.ratingContainer}>
          {renderStars(item.difficulty)}
        </View>

        <Text style={styles.caption}>
          {expanded || !isLongText
            ? captionText
            : `${captionText.slice(0, CAPTION_LIMIT)}...`}
        </Text>

        {isLongText && (
          <TouchableOpacity onPress={() => setExpanded(!expanded)}>
            <Text
              style={{
                color: theme.primary,
                marginTop: 4,
                fontWeight: "600",
              }}
            >
              {expanded ? "Show Less" : "Read More"}
            </Text>
          </TouchableOpacity>
        )}

        <Text style={styles.date}>
          Shared on {new Date(item.created_at).toLocaleDateString()}
        </Text>
      </View>
    </View>
  );
};

// --- 2. MAIN HOME COMPONENT ---
export default function Home() {
  const [experiences, setExperiences] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const colorScheme = useColorScheme();
  const theme = Colors[colorScheme ?? "light"];
  const styles = useMemo(() => getHomeStyles(theme), [theme]);

  const fetchExperiences = async (isRefresh = false) => {
    try {
      if (isRefresh) setRefreshing(true);

      const { data, error } = await supabase
        .from("experiences")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(20);

      if (error) throw error;
      setExperiences(data);
    } catch (error) {
      console.error("Error fetching experiences:", error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchExperiences();
  }, []);

  if (loading) {
    return (
      <View
        style={[
          styles.container,
          { justifyContent: "center", alignItems: "center" },
        ]}
      >
        <ActivityIndicator size="large" color={theme.primary} />
      </View>
    );
  }

  return (
    <View style={[styles.container, { paddingTop: 10 }]}>
      <FlatList
        data={experiences}
        renderItem={({ item }) => (
          <FeedCard item={item} theme={theme} styles={styles} />
        )}
        keyExtractor={(item) => item.id.toString()}
        contentContainerStyle={styles.listContainer}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={() => fetchExperiences(true)}
            colors={[theme.primary]}
            tintColor={theme.primary}
          />
        }
        ListHeaderComponent={
          <View style={styles.header}>
            <Text style={styles.headerTitle}>Orbit <Ionicons name="rocket-outline" size={24} color={theme.primary} /></Text>
            <Text style={styles.headerSubtitle}>
              Discover interview insights from the community
            </Text>
          </View>
        }
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Ionicons
              name="book-outline"
              size={60}
              color={theme.textSecondary}
            />
            <Text style={styles.emptyText}>No Experience shared yet</Text>
            <Text style={styles.emptySubtext}>
              Be the first to share your experience!
            </Text>
          </View>
        }
      />
    </View>
  );
}
