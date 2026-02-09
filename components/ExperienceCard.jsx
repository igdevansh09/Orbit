import { useState, useMemo } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  useColorScheme,
} from "react-native";
import { Image } from "expo-image";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useAuthStore } from "../store/authStore";
import { supabase } from "../lib/supabase";
import { Colors } from "../constants/colors";

export default function ExperienceCard({
  item,
  onDeleteSuccess,
  readOnly = false,
}) {
  const { user } = useAuthStore();
  const router = useRouter();
  const colorScheme = useColorScheme();
  const theme = Colors[colorScheme ?? "light"];

  // --- STATE FOR READ MORE ---
  const [expanded, setExpanded] = useState(false);
  const DESCRIPTION_LIMIT = 100;

  // Check ownership
  const isOwner = user?.id === item.user_id;

  // --- DELETE LOGIC ---
  const handleDelete = () => {
    Alert.alert("Delete Post", "Are you sure? This action cannot be undone.", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete",
        style: "destructive",
        onPress: async () => {
          try {
            console.log("Attempting to delete post:", item.id);

            // 1. Try to Delete Image (Best Effort)
            if (item.image_url) {
              try {
                // Extract path: "user_id/timestamp.jpg"
                // URL format: .../experience-uploads/user_id/filename.jpg
                const pathParts = item.image_url.split("experience-uploads/");
                if (pathParts.length > 1) {
                  const filePath = pathParts[1];
                  console.log("Deleting image at:", filePath);
                  await supabase.storage
                    .from("experience-uploads")
                    .remove([filePath]);
                }
              } catch (imgErr) {
                console.log("Image delete failed (ignoring):", imgErr);
              }
            }

            // 2. Delete Database Record (Critical)
            const { error } = await supabase
              .from("experiences")
              .delete()
              .eq("id", item.id);

            if (error) {
              console.error("Supabase Delete Error:", error);
              throw error;
            }

            console.log("Post deleted successfully");

            // 3. Refresh UI
            if (onDeleteSuccess) {
              onDeleteSuccess(item.id);
            } else {
              // If on Home screen, we might not have this callback,
              // so we can't refresh list instantly without context refresh.
              Alert.alert("Success", "Post deleted. Pull to refresh.");
            }
          } catch (error) {
            Alert.alert(
              "Delete Failed",
              error.message || "Could not delete post.",
            );
          }
        },
      },
    ]);
  };

  // --- EDIT LOGIC (Fixed Params) ---
  const handleEdit = () => {
    console.log("Navigating to edit:", item.id);

    router.push({
      pathname: "/create",
      params: {
        isEdit: "true",
        id: item.id,
        // Pass ALL fields so they populate correctly
        initialCompany: item.company,
        initialRole: item.role || "",
        initialCategory: item.category || "Interview", // <--- ADDED THIS
        initialReview: item.description,
        initialDifficulty: item.difficulty?.toString(),
        initialImage: item.image_url || "",
      },
    });
  };

  const styles = useMemo(() => getStyles(theme), [theme]);

  return (
    <View style={styles.card}>
      {/* HEADER */}
      <View style={styles.header}>
        <View style={styles.userInfo}>
          <Image
            source={
              item.user_avatar ||
              `https://ui-avatars.com/api/?name=${item.username}&background=random`
            }
            style={styles.avatar}
          />
          <View>
            <Text style={styles.username}>{item.username}</Text>
            <Text style={styles.meta}>
              {item.branch} • {item.college}
            </Text>
          </View>
        </View>

        {/* ACTIONS (Only visible if Owner AND Not ReadOnly) */}
        {isOwner && !readOnly && (
          <View style={styles.actions}>
            <TouchableOpacity onPress={handleEdit} style={styles.actionBtn}>
              <Ionicons name="pencil" size={20} color={theme.primary} />
            </TouchableOpacity>
            <TouchableOpacity
              onPress={handleDelete}
              style={[styles.actionBtn, { marginLeft: 8 }]}
            >
              <Ionicons name="trash-outline" size={20} color="#FF5252" />
            </TouchableOpacity>
          </View>
        )}
      </View>

      {/* CONTENT */}
      <View style={styles.content}>
        <View style={styles.titleRow}>
          <Text style={styles.company}>{item.company}</Text>
        </View>
        {/* Role & Category Line */}
        <Text style={styles.role}>
          {item.category || "Interview"} • {item.role || "Role N/A"}
        </Text>

        <View style={styles.stars}>
          {[...Array(5)].map((_, i) => (
            <Ionicons
              key={i}
              name={i < item.difficulty ? "star" : "star-outline"}
              size={14}
              color="#F4B400"
            />
          ))}
        </View>

        <Text style={styles.description}>
          {expanded
            ? item.description
            : item.description.length > DESCRIPTION_LIMIT
              ? `${item.description.substring(0, DESCRIPTION_LIMIT)}...`
              : item.description}
        </Text>

        {item.description.length > DESCRIPTION_LIMIT && (
          <TouchableOpacity onPress={() => setExpanded(!expanded)}>
            <Text style={styles.readMore}>
              {expanded ? "Show Less" : "Read More"}
            </Text>
          </TouchableOpacity>
        )}
      </View>

      {/* IMAGE */}
      {item.image_url && (
        <Image
          source={{ uri: item.image_url }}
          style={styles.postImage}
          contentFit="cover"
          transition={500}
        />
      )}
    </View>
  );
}

const getStyles = (theme) =>
  StyleSheet.create({
    card: {
      backgroundColor: theme.cardBackground,
      borderRadius: 16,
      padding: 16,
      marginBottom: 16,
      borderWidth: 1,
      borderColor: theme.border,
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.05,
      shadowRadius: 8,
      elevation: 2,
    },
    header: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "flex-start",
      marginBottom: 12,
    },
    userInfo: {
      flexDirection: "row",
      alignItems: "center",
      gap: 12,
      flex: 1,
    },
    avatar: {
      width: 42,
      height: 42,
      borderRadius: 21,
      backgroundColor: "#eee",
      borderWidth: 1,
      borderColor: theme.border,
    },
    username: {
      fontWeight: "700",
      fontSize: 15,
      color: theme.textPrimary,
    },
    meta: {
      fontSize: 12,
      color: theme.textSecondary,
      marginTop: 2,
    },
    actions: {
      flexDirection: "row",
      alignItems: "center",
      backgroundColor: theme.inputBackground,
      padding: 6,
      borderRadius: 8,
    },
    actionBtn: {
      padding: 4,
    },
    content: {
      marginBottom: 12,
    },
    titleRow: {
      flexDirection: "row",
      alignItems: "center",
      flexWrap: "wrap",
      marginBottom: 2,
    },
    company: {
      fontSize: 18,
      fontWeight: "800",
      color: theme.textPrimary,
    },
    role: {
      fontSize: 14,
      fontWeight: "600",
      color: theme.primary,
      marginBottom: 6,
      textTransform: "uppercase",
      letterSpacing: 0.5,
    },
    stars: {
      flexDirection: "row",
      marginBottom: 8,
    },
    description: {
      fontSize: 15,
      lineHeight: 22,
      color: theme.textPrimary,
    },
    readMore: {
      color: theme.primary,
      fontWeight: "600",
      marginTop: 4,
    },
    postImage: {
      width: "100%",
      height: 220,
      borderRadius: 12,
      marginTop: 8,
      backgroundColor: theme.inputBackground,
    },
  });
