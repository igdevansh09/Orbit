import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  RefreshControl, // <--- 1. IMPORTED REFRESH CONTROL
  Dimensions,
} from "react-native";
import { useUser, useAuth } from "@clerk/clerk-expo";
import { useRouter } from "expo-router";
import { useEffect, useState } from "react";
import { supabase } from "../../lib/supabase";
import { Ionicons } from "@expo/vector-icons";
import { Image } from "expo-image";
import COLORS from "../../constants/colors";
import profileStyles from "../../assets/styles/profile.styles";

// --- 1. SUB-COMPONENT: Profile Post Card (Handles Read More & User Details) ---
const ProfileFeedCard = ({ item, user }) => {
  const [expanded, setExpanded] = useState(false);
  const CAPTION_LIMIT = 100;
  const isLongText = item.caption && item.caption.length > CAPTION_LIMIT;

  return (
    <View style={cardStyles.bookCard}>
      {/* Header */}
      <View style={cardStyles.bookHeader}>
        <View style={cardStyles.userInfo}>
          <Image source={user?.imageUrl} style={cardStyles.avatar} />
          <View>
            {/* NAME */}
            <Text style={cardStyles.username}>{user?.fullName}</Text>

            {/* EMAIL */}
            <Text style={{ fontSize: 11, color: "#666", marginBottom: 2 }}>
              {user?.primaryEmailAddress?.emailAddress}
            </Text>

            {/* COLLEGE & BRANCH */}
            <Text
              style={{ fontSize: 12, fontWeight: "600", color: COLORS.primary }}
            >
              {item.college} • {item.branch}
            </Text>
          </View>
        </View>
      </View>

      {/* Image */}
      <View style={cardStyles.bookImageContainer}>
        <Image
          source={item.image_url}
          style={cardStyles.bookImage}
          contentFit="cover"
        />
      </View>

      {/* Details */}
      <View style={cardStyles.bookDetails}>
        <Text style={cardStyles.bookTitle}>{item.title}</Text>

        {/* Stars */}
        <View style={cardStyles.ratingContainer}>
          {[1, 2, 3, 4, 5].map((i) => (
            <Ionicons
              key={i}
              name={i <= item.rating ? "star" : "star-outline"}
              size={16}
              color={i <= item.rating ? "#f4b400" : COLORS.textSecondary}
              style={{ marginRight: 2 }}
            />
          ))}
        </View>

        {/* Caption with Read More Logic */}
        <Text style={cardStyles.caption}>
          {expanded || !isLongText
            ? item.caption
            : `${item.caption.slice(0, CAPTION_LIMIT)}...`}
        </Text>

        {isLongText && (
          <TouchableOpacity onPress={() => setExpanded(!expanded)}>
            <Text style={cardStyles.readMore}>
              {expanded ? "Show Less" : "Read More"}
            </Text>
          </TouchableOpacity>
        )}

        <Text style={cardStyles.date}>
          Shared on {new Date(item.created_at).toLocaleDateString()}
        </Text>
      </View>
    </View>
  );
};

// --- 2. MAIN COMPONENT ---
export default function Profile() {
  const { user } = useUser();
  const { signOut } = useAuth();
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false); // <--- 2. ADDED REFRESH STATE
  const router = useRouter();

  useEffect(() => {
    if (user) {
      fetchUserBooks();
    }
  }, [user]);

  // Updated fetch logic to handle refresh
  const fetchUserBooks = async (isRefresh = false) => {
    if (!user) return;
    try {
      if (isRefresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }

      const { data, error } = await supabase
        .from("books")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });

      if (error) throw error;
      if (data) setBooks(data);
    } catch (err) {
      console.error("Error fetching posts:", err);
    } finally {
      setLoading(false);
      setRefreshing(false); // <--- STOP REFRESHING
    }
  };

  const handleLogout = async () => {
    await signOut();
  };

  // --- HEADER COMPONENT ---
  const renderHeader = () => (
    <View style={{ marginBottom: 20 }}>
      {/* Profile Info */}
      <View style={profileStyles.profileHeader}>
        <Image source={user?.imageUrl} style={profileStyles.profileImage} />
        <View style={profileStyles.profileInfo}>
          <Text style={profileStyles.username}>{user?.fullName}</Text>
          <Text style={profileStyles.email}>
            {user?.primaryEmailAddress?.emailAddress}
          </Text>
        </View>
      </View>

      {/* Logout Button */}
      <TouchableOpacity
        style={profileStyles.logoutButton}
        onPress={handleLogout}
      >
        <Ionicons name="log-out-outline" size={20} color="white" />
        <Text style={profileStyles.logoutText}>Logout</Text>
      </TouchableOpacity>

      {/* Section Title */}
      <View style={[profileStyles.booksHeader, { marginTop: 20 }]}>
        <Text style={profileStyles.booksTitle}>Your Contributions 📚</Text>
      </View>
    </View>
  );

  return (
    <View
      style={{ flex: 1, backgroundColor: COLORS.background, paddingTop: 30 }}
    >
      {loading && !refreshing ? ( // Only show full loader on initial load
        <ActivityIndicator
          size="large"
          color={COLORS.primary}
          style={{ marginTop: 50 }}
        />
      ) : (
        <FlatList
          data={books}
          keyExtractor={(item) => item.id.toString()}
          renderItem={({ item }) => <ProfileFeedCard item={item} user={user} />}
          ListHeaderComponent={renderHeader}
          contentContainerStyle={{
            paddingHorizontal: 12,
            paddingBottom: 80,
          }}
          showsVerticalScrollIndicator={false}
          // <--- 3. ADDED REFRESH CONTROL HERE
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={() => fetchUserBooks(true)}
              colors={[COLORS.primary]}
              tintColor={COLORS.primary}
            />
          }
          ListEmptyComponent={
            <View style={{ alignItems: "center", marginTop: 50 }}>
              <Text style={{ color: "#999" }}>
                You haven't posted anything yet.
              </Text>
            </View>
          }
        />
      )}
    </View>
  );
}

// --- STYLES ---
const cardStyles = StyleSheet.create({
  bookCard: {
    backgroundColor: COLORS.cardBackground || "white", // Fallback to white if undefined
    borderRadius: 16,
    marginBottom: 24,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 3,
    borderWidth: 1,
    borderColor: "#F3F4F6",
    overflow: "hidden",
    width: "100%",
  },
  bookHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#F3F4F6",
  },
  userInfo: {
    flexDirection: "row",
    alignItems: "center",
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 12,
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },
  username: {
    fontSize: 14,
    fontWeight: "700",
    color: "#1F2937",
    marginBottom: 1,
  },
  bookImageContainer: {
    width: "100%",
    height: 240,
    backgroundColor: "#F9FAFB",
  },
  bookImage: {
    width: "100%",
    height: "100%",
  },
  bookDetails: {
    padding: 16,
  },
  bookTitle: {
    fontSize: 18,
    fontWeight: "800",
    color: "#111827",
    marginBottom: 6,
  },
  ratingContainer: {
    flexDirection: "row",
    marginBottom: 8,
  },
  caption: {
    fontSize: 14,
    color: "#4B5563",
    lineHeight: 22,
    marginBottom: 8,
  },
  readMore: {
    color: COLORS.primary || "#2563EB",
    fontWeight: "600",
    fontSize: 14,
    marginBottom: 12,
  },
  date: {
    fontSize: 12,
    color: "#9CA3AF",
    fontWeight: "500",
  },
});
