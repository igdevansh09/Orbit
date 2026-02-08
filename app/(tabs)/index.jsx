import {
  View,
  Text,
  FlatList,
  ActivityIndicator,
  RefreshControl,
  TouchableOpacity,
} from "react-native";
import { Image } from "expo-image";
import { useEffect, useState } from "react";
import { Ionicons } from "@expo/vector-icons";

import styles from "../../assets/styles/home.styles";
import COLORS from "../../constants/colors";
import Loader from "../../components/Loader";
import { supabase } from "../../lib/supabase";
import { useUser } from "@clerk/clerk-expo";

// --- 1. SUB-COMPONENT: Feed Card (Defined OUTSIDE to prevent re-renders) ---
const FeedCard = ({ item }) => {
  const [expanded, setExpanded] = useState(false);
  const CAPTION_LIMIT = 100;
  const isLongText = item.caption && item.caption.length > CAPTION_LIMIT;

  // Helper for stars
  const renderStars = (rating) => {
    return [1, 2, 3, 4, 5].map((i) => (
      <Ionicons
        key={i}
        name={i <= rating ? "star" : "star-outline"}
        size={16}
        color={i <= rating ? "#f4b400" : COLORS.textSecondary}
        style={{ marginRight: 2 }}
      />
    ));
  };

  return (
    <View style={styles.bookCard}>
      {/* HEADER: User Info */}
      <View style={styles.bookHeader}>
        <View style={styles.userInfo}>
          {/* Avatar: Uses Author Image or Fallback to Initials */}
          <Image
            source={
              item.author_image ||
              `https://ui-avatars.com/api/?name=${item.author_name || item.college || "User"}&background=random&color=fff`
            }
            style={styles.avatar}
          />
          <View>
            {/* 1. AUTHOR NAME */}
            <Text style={styles.username}>
              {item.author_name || "Anonymous User"}
            </Text>

            {/* 2. AUTHOR EMAIL */}
            {item.author_email && (
              <Text style={{ fontSize: 11, color: "#666", marginBottom: 2 }}>
                {item.author_email}
              </Text>
            )}

            {/* 3. COLLEGE & BRANCH */}
            <Text
              style={{ fontSize: 12, fontWeight: "600", color: COLORS.primary }}
            >
              {item.college || "NSUT"} • {item.branch || "Student"}
            </Text>
          </View>
        </View>
      </View>

      {/* IMAGE */}
      <View style={styles.bookImageContainer}>
        <Image
          source={item.image_url}
          style={styles.bookImage}
          contentFit="cover"
        />
      </View>

      {/* DETAILS */}
      <View style={styles.bookDetails}>
        <Text style={styles.bookTitle}>{item.title}</Text>

        {/* Rating */}
        <View style={styles.ratingContainer}>{renderStars(item.rating)}</View>

        {/* Caption with Read More */}
        <Text style={styles.caption}>
          {expanded || !isLongText
            ? item.caption
            : `${item.caption.slice(0, CAPTION_LIMIT)}...`}
        </Text>

        {isLongText && (
          <TouchableOpacity onPress={() => setExpanded(!expanded)}>
            <Text
              style={{
                color: COLORS.primary,
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
  const { user } = useUser();
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const limit = 20;

  const fetchBooks = async (isRefresh = false) => {
    try {
      if (isRefresh) setRefreshing(true);

      const { data, error } = await supabase
        .from("books")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(limit);

      if (error) throw error;
      setBooks(data);
    } catch (error) {
      console.error("Error fetching books:", error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchBooks();
  }, []);

  if (loading) return <Loader />;

  return (
    <View style={[styles.container, { paddingTop: 10 }]}>
      <FlatList
        data={books}
        renderItem={({ item }) => <FeedCard item={item} />}
        keyExtractor={(item) => item.id.toString()}
        contentContainerStyle={styles.listContainer}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={() => fetchBooks(true)}
            colors={[COLORS.primary]}
            tintColor={COLORS.primary}
          />
        }
        ListHeaderComponent={
          <View style={styles.header}>
            <Text style={styles.headerTitle}>Orbit 🪐</Text>
            <Text style={styles.headerSubtitle}>
              Discover great reads from the community..
            </Text>
          </View>
        }
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Ionicons
              name="book-outline"
              size={60}
              color={COLORS.textSecondary}
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
