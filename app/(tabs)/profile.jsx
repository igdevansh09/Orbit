import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
  useColorScheme,
  Alert,
  StatusBar,
} from "react-native";
import { Image } from "expo-image";
import { useState, useMemo, useCallback } from "react";
import { useRouter, useFocusEffect } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";
import { LinearGradient } from "expo-linear-gradient";
import Animated, { FadeInDown, FadeInUp } from "react-native-reanimated";

import { getProfileStyles } from "../../assets/styles/profile.styles";
import { Colors } from "../../constants/colors";
import { supabase } from "../../lib/supabase";
import { useAuthStore } from "../../store/authStore";
import ExperienceCard from "../../components/ExperienceCard";

export default function Profile() {
  const { user, logout, uploadAvatar, deleteAccount, isLoading, removeAvatar } =
    useAuthStore();
  const [experiences, setExperiences] = useState([]);
  const [refreshing, setRefreshing] = useState(false);
  const [uploading, setUploading] = useState(false);
  const router = useRouter();

  const colorScheme = useColorScheme();
  const theme = Colors[colorScheme ?? "light"];
  const styles = useMemo(() => getProfileStyles(theme), [theme]);

  // Dynamic background gradient based on theme
  const backgroundGradient = [theme.background, theme.cardBackground];

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

  const handleAvatarOptions = () => {
    Alert.alert("Profile Photo", "What would you like to do?", [
      { text: "Upload New Photo", onPress: handleAvatarPick },
      {
        text: "Remove Photo",
        onPress: handleAvatarRemove,
        style: "destructive",
      },
      { text: "Cancel", style: "cancel" },
    ]);
  };

  const handleAvatarRemove = async () => {
    setUploading(true);
    const res = await removeAvatar();
    setUploading(false);
    if (!res.success) {
      Alert.alert("Error", res.error);
    }
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
    <View style={styles.headerContainer}>
      <Animated.View entering={FadeInDown.delay(50).springify()}>
        <TouchableOpacity
          onPress={handleAvatarOptions}
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
      </Animated.View>

      <Animated.View
        entering={FadeInDown.delay(150).springify()}
        style={styles.profileInfo}
      >
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
      </Animated.View>

      <Animated.View
        entering={FadeInDown.delay(250).springify()}
        style={styles.buttonRow}
      >
        <TouchableOpacity
          style={[styles.actionButton, styles.logoutButton]}
          onPress={handleLogout}
          activeOpacity={0.7}
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
          activeOpacity={0.7}
        >
          <Ionicons name="trash-outline" size={20} color="#FF4444" />
          <Text style={styles.deleteText}>Delete</Text>
        </TouchableOpacity>
      </Animated.View>
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

      <FlatList
        data={experiences}
        keyExtractor={(item) => item.id.toString()}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 120, paddingHorizontal: 16 }}
        ListHeaderComponent={renderHeader}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={() => fetchUserExperiences(true)}
            tintColor={theme.primary}
          />
        }
        renderItem={({ item, index }) => (
          <Animated.View
            entering={FadeInUp.delay(
              index < 5 ? 300 + index * 100 : 0,
            ).springify()}
          >
            <ExperienceCard
              item={item}
              onDeleteSuccess={(id) => {
                setExperiences((prev) => prev.filter((post) => post.id !== id));
              }}
            />
          </Animated.View>
        )}
        ListEmptyComponent={
          !refreshing ? (
            <Animated.View
              entering={FadeInUp.delay(300)}
              style={styles.emptyState}
            >
              <View style={styles.emptyIconWrapper}>
                <Ionicons
                  name="grid-outline"
                  size={54}
                  color={theme.textSecondary}
                />
              </View>
              <Text style={styles.emptyText}>No contributions yet</Text>
              <Text style={styles.emptySubtext}>
                Share an experience to help your peers.
              </Text>
            </Animated.View>
          ) : null
        }
      />
    </LinearGradient>
  );
}
