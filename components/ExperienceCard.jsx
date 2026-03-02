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

  const styles = useMemo(() => getStyles(theme), [theme]);

  const fullText = item.description || "";
  const displayText =
    expanded || fullText.length <= DESCRIPTION_LIMIT
      ? fullText
      : `${fullText.substring(0, DESCRIPTION_LIMIT)}...`;

  const displayUsername = item.is_anonymous
    ? "Verified Student"
    : item.username;
  const displayAvatar = item.is_anonymous
    ? `https://ui-avatars.com/api/?name=V+S&background=1E1E1E&color=fff`
    : item.user_avatar ||
      `https://ui-avatars.com/api/?name=${item.username}&background=random`;
  const displayBranch = item.is_anonymous ? "NSUT" : item.branch;

  const parseJsonArray = (data) => {
    if (!data) return [];
    if (Array.isArray(data)) return data;
    try {
      return JSON.parse(data);
    } catch (e) {
      return [];
    }
  };

  const extractedQuestions = parseJsonArray(item.technical_questions);
  const extractedTopics = parseJsonArray(item.dsa_topics);

  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <View style={styles.userInfo}>
          <Image source={displayAvatar} style={styles.avatar} />
          <View>
            <Text style={styles.username}>{displayUsername}</Text>
            <Text style={styles.meta}>
              {displayBranch} •{" "}
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
              onPress={handleDelete}
              style={styles.actionBtn}
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
          <View
            style={[styles.pillTag, { backgroundColor: theme.primary + "20" }]}
          >
            <Text style={styles.pillText}>
              {item.drive_type || "On-Campus"}
            </Text>
          </View>
          <Text style={styles.roleText}>{item.role || "Role N/A"}</Text>
        </View>

        {(item.cgpa_cutoff ||
          item.rounds ||
          item.extracted_rounds ||
          item.allowed_branches) && (
          <View style={{ marginBottom: 16 }}>
            <View
              style={{
                flexDirection: "row",
                gap: 16,
                marginBottom: item.allowed_branches ? 6 : 0,
              }}
            >
              {item.cgpa_cutoff && (
                <Text style={styles.metadataText}>
                  <Ionicons name="school" size={14} /> CGPA: {item.cgpa_cutoff}+
                </Text>
              )}
              {(item.rounds || item.extracted_rounds) && (
                <Text style={styles.metadataText}>
                  <Ionicons name="layers" size={14} /> Rounds:{" "}
                  {item.extracted_rounds || item.rounds}
                </Text>
              )}
            </View>

            {item.allowed_branches && (
              <Text
                style={[styles.metadataText, { fontSize: 13, lineHeight: 20 }]}
              >
                <Ionicons name="git-branch" size={13} /> Branches:{" "}
                {item.allowed_branches}
              </Text>
            )}
          </View>
        )}

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

        {(extractedQuestions.length > 0 || extractedTopics.length > 0) && (
          <View style={styles.extractionContainer}>
            {extractedTopics.length > 0 && (
              <View style={styles.topicChips}>
                {extractedTopics.map((topic, index) => (
                  <View key={index} style={styles.topicPill}>
                    <Text style={styles.topicText}>{topic}</Text>
                  </View>
                ))}
              </View>
            )}

            {extractedQuestions.length > 0 && (
              <View style={styles.questionsBlock}>
                <Text style={styles.questionsHeader}>Questions Asked:</Text>
                {extractedQuestions.map((q, index) => (
                  <View key={index} style={styles.questionRow}>
                    <View style={styles.bulletPoint} />
                    <Text style={styles.questionText}>{q}</Text>
                  </View>
                ))}
              </View>
            )}
          </View>
        )}

        <Text
          style={[styles.questionsHeader, { marginTop: 12, marginBottom: 4 }]}
        >
          Experience Narrative:
        </Text>
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
              {expanded ? "Show less narrative" : "Read full narrative"}
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
      backgroundColor: theme.inputBackground,
      paddingVertical: 6,
      paddingHorizontal: 12,
      borderRadius: 100,
      marginRight: 10,
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
    metadataText: {
      fontSize: 14,
      color: theme.textSecondary,
      fontWeight: "700",
    },
    stars: {
      flexDirection: "row",
      marginBottom: 16,
    },
    extractionContainer: {
      backgroundColor: theme.inputBackground,
      borderRadius: 16,
      padding: 16,
      marginBottom: 16,
      borderLeftWidth: 4,
      borderLeftColor: theme.primary,
    },
    topicChips: {
      flexDirection: "row",
      flexWrap: "wrap",
      gap: 8,
      marginBottom: 12,
    },
    topicPill: {
      backgroundColor: theme.primary + "1A",
      paddingVertical: 4,
      paddingHorizontal: 10,
      borderRadius: 6,
      borderWidth: 1,
      borderColor: theme.primary + "4D",
    },
    topicText: {
      color: theme.primary,
      fontWeight: "700",
      fontSize: 12,
    },
    questionsBlock: {
      marginTop: 4,
    },
    questionsHeader: {
      fontWeight: "800",
      color: theme.textPrimary,
      fontSize: 14,
      marginBottom: 8,
      textTransform: "uppercase",
      letterSpacing: 0.5,
    },
    questionRow: {
      flexDirection: "row",
      alignItems: "flex-start",
      marginBottom: 6,
    },
    bulletPoint: {
      width: 6,
      height: 6,
      borderRadius: 3,
      backgroundColor: theme.textSecondary,
      marginTop: 8,
      marginRight: 10,
    },
    questionText: {
      fontSize: 15,
      color: theme.textPrimary,
      fontWeight: "500",
      flex: 1,
      lineHeight: 22,
    },
    description: {
      fontSize: 16,
      lineHeight: 24,
      color: theme.textDark,
      fontWeight: "400",
    },
    readMore: {
      color: theme.primary,
      fontWeight: "800",
      marginTop: 10,
      fontSize: 14,
    },
    postImage: {
      width: "100%",
      height: 260,
      borderRadius: 24,
      marginTop: 16,
      backgroundColor: theme.inputBackground,
    },
  });
