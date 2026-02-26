import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
  useColorScheme,
  Alert,
} from "react-native";
import { Image } from "expo-image";
import { useState, useMemo, useCallback } from "react"; 
import { useRouter, useFocusEffect } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";
import { getProfileStyles } from "../../assets/styles/profile.styles";
import { Colors } from "../../constants/colors";
import { supabase } from "../../lib/supabase";
import { useAuthStore } from "../../store/authStore";
import ExperienceCard from "../../components/ExperienceCard";

const ProfileFeedCard = ({ item, user, styles, theme }) => {
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
      <View style={styles.bookHeader}>
        <View style={styles.userInfo}>
          <Image
            source={{
              uri:
                user?.user_metadata?.avatar_url ||
                `https://ui-avatars.com/api/?name=${user?.user_metadata?.username}&background=random`,
            }}
            style={styles.cardAvatar}
          />
          <View>
            <Text style={styles.cardUsername}>
              {user?.user_metadata?.username || "You"}
            </Text>
            <Text style={{ fontSize: 11, color: theme.textSecondary }}>
              {user?.email}
            </Text>
          </View>
        </View>
      </View>

      {item.image_url && (
        <View style={styles.bookImageContainer}>
          <Image
            source={{ uri: item.image_url }}
            style={styles.bookImage}
            contentFit="cover"
          />
        </View>
      )}

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
            <Text style={styles.readMore}>
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

export default function Profile() {
  const { user, logout, uploadAvatar, deleteAccount, isLoading } =
    useAuthStore();
  const [experiences, setExperiences] = useState([]);
  const [refreshing, setRefreshing] = useState(false);
  const [uploading, setUploading] = useState(false);
  const router = useRouter();

  const colorScheme = useColorScheme();
  const theme = Colors[colorScheme ?? "light"];
  const styles = useMemo(() => getProfileStyles(theme), [theme]);

  useFocusEffect(
    useCallback(() => {
      if (user) {
        fetchUserExperiences();
      }
    }, [user]),
  );

  const fetchUserExperiences = async (isRefresh = false) => {
    if (!user) return;
    try {
      if (isRefresh) setRefreshing(true);
      const { data, error } = await supabase
        .from("experiences")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });

      if (error) throw error;
      if (data) setExperiences(data);
    } catch (err) {
      console.error("Error fetching posts:", err);
    } finally {
      setRefreshing(false);
    }
  };

  const handleLogout = async () => {
    await logout();
  };

  const handleDeleteAccount = () => {
    Alert.alert(
      "Delete Account",
      "Are you sure? This action cannot be undone and you will lose all your data.",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            const res = await deleteAccount();
            if (res.success) {
              router.replace("/");
            } else {
              Alert.alert("Error", res.error);
            }
          },
        },
      ],
    );
  };

  const handleAvatarPick = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.5,
        base64: true,
      });

      if (!result.canceled && result.assets[0].base64) {
        setUploading(true);
        const res = await uploadAvatar(result.assets[0].base64);
        setUploading(false);

        if (res.success) {
          Alert.alert("Success", "Profile picture updated!");
        } else {
          Alert.alert("Error", res.error);
        }
      }
    } catch (error) {
      console.log("Pick error:", error);
      setUploading(false);
      Alert.alert("Error", "Failed to pick image");
    }
  };

  const renderHeader = () => (
    <View>
      <View style={styles.headerContainer}>
        <TouchableOpacity
          onPress={handleAvatarPick}
          disabled={uploading}
          activeOpacity={0.8}
        >
          <View style={styles.avatarContainer}>
            <Image
              source={{
                uri:
                  user?.user_metadata?.avatar_url ||
                  `https://ui-avatars.com/api/?name=${user?.user_metadata?.username}&background=random&size=256`,
              }}
              style={styles.profileImage}
              contentFit="cover"
              transition={300}
            />
            <View style={styles.editBadge}>
              {uploading ? (
                <ActivityIndicator size="small" color={theme.white} />
              ) : (
                <Ionicons name="camera" size={18} color={theme.white} />
              )}
            </View>
          </View>
        </TouchableOpacity>

        <View style={styles.profileInfo}>
          <Text style={styles.username}>
            {user?.user_metadata?.username || "Scholar"}
          </Text>
          <Text style={styles.email}>{user?.email}</Text>
          <View style={styles.metaBadge}>
            <Text style={styles.metaText}>
              {user?.user_metadata?.college || "NSUT"} •{" "}
              {user?.user_metadata?.branch || "Student"}
            </Text>
          </View>
        </View>

        <View style={styles.buttonRow}>
          <TouchableOpacity
            style={[styles.actionButton, styles.logoutButton]}
            onPress={handleLogout}
            activeOpacity={0.6}
          >
            <Ionicons
              name="log-out-outline"
              size={20}
              color={theme.textPrimary}
            />
            <Text style={styles.logoutText}>Logout</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.actionButton, styles.deleteButton]}
            onPress={handleDeleteAccount}
            activeOpacity={0.6}
          >
            <Ionicons name="trash-outline" size={20} color="#FF4444" />
            <Text style={styles.deleteText}>Delete</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <FlatList
        data={experiences}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => (
          <ExperienceCard
            item={item}
            readOnly={false}
            onDeleteSuccess={(id) => {
              setExperiences((prev) => prev.filter((post) => post.id !== id));
            }}
          />
        )}
        ListHeaderComponent={renderHeader}
        contentContainerStyle={{
          paddingBottom: 100,
        }}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={() => fetchUserExperiences(true)}
            colors={[theme.primary]}
            tintColor={theme.primary}
          />
        }
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Ionicons name="grid-outline" size={48} color={theme.border} />
            <Text style={styles.emptyText}>No contributions yet</Text>
            <Text style={styles.emptySubtext}>
              Share an experience to help your peers.
            </Text>
          </View>
        }
      />
    </View>
  );
}
