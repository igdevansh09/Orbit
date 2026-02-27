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
import Autolink from "react-native-autolink";

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

  const [expanded, setExpanded] = useState(false);
  const DESCRIPTION_LIMIT = 120;

  const isOwner = user?.id === item.user_id;

  const handleDelete = () => {
    Alert.alert("Delete Post", "Are you sure? This action cannot be undone.", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete",
        style: "destructive",
        onPress: async () => {
          try {
            if (item.image_url) {
              try {
                const pathParts = item.image_url.split("experience-uploads/");
                if (pathParts.length > 1) {
                  const filePath = pathParts[1];
                  await supabase.storage
                    .from("experience-uploads")
                    .remove([filePath]);
                }
              } catch (imgErr) {
                console.log("Image delete failed:", imgErr);
              }
            }

            const { error } = await supabase
              .from("experiences")
              .delete()
              .eq("id", item.id);

            if (error) throw error;
            if (onDeleteSuccess) onDeleteSuccess(item.id);
          } catch (error) {
            Alert.alert("Delete Failed", error.message);
          }
        },
      },
    ]);
  };

  const handleEdit = () => {
    router.push({
      pathname: "/create",
      params: {
        isEdit: "true",
        id: item.id,
        initialCompany: item.company,
        initialRole: item.role || "",
        initialCategory: item.category || "Interview",
        initialReview: item.description,
        initialDifficulty: item.difficulty?.toString(),
        initialImage: item.image_url || "",
      },
    });
  };

  const styles = useMemo(() => getStyles(theme), [theme]);

  const fullText = item.description || "";
  const displayText =
    expanded || fullText.length <= DESCRIPTION_LIMIT
      ? fullText
      : `${fullText.substring(0, DESCRIPTION_LIMIT)}...`;

  return (
    <View style={styles.card}>
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
              {item.branch} •{" "}
              {new Date(item.created_at).toLocaleDateString(undefined, {
                month: "short",
                day: "numeric",
              })}
            </Text>
          </View>
        </View>

        {isOwner && !readOnly && (
          <View style={styles.actions}>
            <TouchableOpacity
              onPress={handleEdit}
              style={styles.actionBtn}
              hitSlop={{ top: 15, bottom: 15, left: 15, right: 15 }}
            >
              <Ionicons name="pencil" size={20} color={theme.textSecondary} />
            </TouchableOpacity>
            <TouchableOpacity
              onPress={handleDelete}
              style={[styles.actionBtn, { marginLeft: 16 }]}
              hitSlop={{ top: 15, bottom: 15, left: 15, right: 15 }}
            >
              <Ionicons name="trash-outline" size={20} color="#FF5252" />
            </TouchableOpacity>
          </View>
        )}
      </View>

      <View style={styles.content}>
        <Text style={styles.company}>{item.company}</Text>

        <View style={styles.tagsContainer}>
          <View style={styles.pillTag}>
            <Text style={styles.pillText}>{item.category || "Interview"}</Text>
          </View>
          <Text style={styles.roleText}>{item.role || "Role N/A"}</Text>
        </View>

        <View style={styles.stars}>
          {[...Array(5)].map((_, i) => (
            <Ionicons
              key={i}
              name={i < item.difficulty ? "star" : "star-outline"}
              size={18}
              color={theme.primary}
              style={{ marginRight: 4 }}
            />
          ))}
        </View>

        <Autolink
          text={displayText}
          email
          url
          selectable={true}
          component={Text}
          style={styles.description}
          linkStyle={{ color: theme.primary, fontWeight: "700" }}
        />

        {fullText.length > DESCRIPTION_LIMIT && (
          <TouchableOpacity
            onPress={() => setExpanded(!expanded)}
            hitSlop={{ top: 15, bottom: 15, left: 15, right: 15 }}
          >
            <Text style={styles.readMore}>
              {expanded ? "Show less" : "Read more"}
            </Text>
          </TouchableOpacity>
        )}
      </View>

      {item.image_url && (
        <Image
          source={{ uri: item.image_url }}
          style={styles.postImage}
          contentFit="cover"
          transition={300}
        />
      )}
    </View>
  );
}

const getStyles = (theme) =>
  StyleSheet.create({
    card: {
      backgroundColor: "transparent",
      marginBottom: 32,
      paddingBottom: 24,
      borderBottomWidth: 1,
      borderBottomColor: theme.border, 
    },
    header: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      marginBottom: 16,
    },
    userInfo: {
      flexDirection: "row",
      alignItems: "center",
      gap: 16,
      flex: 1,
    },
    avatar: {
      width: 48, 
      height: 48,
      borderRadius: 24,
      backgroundColor: theme.inputBackground,
    },
    username: {
      fontWeight: "900",
      fontSize: 17,
      color: theme.textPrimary,
      letterSpacing: -0.3,
    },
    meta: {
      fontSize: 14,
      color: theme.textSecondary,
      fontWeight: "600",
      marginTop: 2,
    },
    actions: {
      flexDirection: "row",
      alignItems: "center",
    },
    actionBtn: {
      padding: 4,
    },
    content: {
      marginBottom: 8,
    },
    company: {
      fontSize: 26,
      fontWeight: "900",
      color: theme.textPrimary,
      letterSpacing: -0.5,
      marginBottom: 8,
    },
    tagsContainer: {
      flexDirection: "row",
      alignItems: "center",
      marginBottom: 12,
    },
    pillTag: {
      backgroundColor: theme.glassBackgroundDark,
      paddingVertical: 6,
      paddingHorizontal: 12,
      borderRadius: 100,
      marginRight: 10,
      borderWidth: 1,
      borderColor: theme.border,
      shadowColor: theme.shadowColorLight,
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.08,
      shadowRadius: 2,
      elevation: 1,
    },
    pillText: {
      fontSize: 13,
      fontWeight: "800",
      color: theme.primary,
      textTransform: "uppercase",
      letterSpacing: 0.5,
    },
    roleText: {
      fontSize: 16,
      fontWeight: "700",
      color: theme.textSecondary,
    },
    stars: {
      flexDirection: "row",
      marginBottom: 16,
    },
    description: {
      fontSize: 17,
      lineHeight: 26,
      color: theme.textDark,
      fontWeight: "400",
    },
    readMore: {
      color: theme.textSecondary,
      fontWeight: "800",
      marginTop: 10,
      fontSize: 15,
    },
    postImage: {
      width: "100%",
      height: 260,
      borderRadius: 24, 
      marginTop: 16,
      backgroundColor: theme.inputBackground,
    },
  });
