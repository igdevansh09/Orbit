import { View, Text } from "react-native";
import { useAuth } from "@clerk/clerk-expo";
import { Image } from "expo-image";
import { useEffect, useState } from "react";
import { supabase } from "../lib/supabase";
import styles from "../assets/styles/profile.styles";
import { formatMemberSince } from "../lib/utils";

export default function ProfileHeader() {
  const { user: clerkUser } = useAuth();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  // Fetch the public profile (username, avatar) from Supabase
  useEffect(() => {
    if (clerkUser) {
      getProfile();
    }
  }, [clerkUser]);

  const getProfile = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", clerkUser.id)
        .single();

      if (data) setProfile(data);
      if (error) console.log("Error fetching profile:", error);
    } catch (e) {
      console.log("Error fetching profile", e);
    } finally {
      setLoading(false);
    }
  };

  if (!clerkUser) return null;

  return (
    <View style={styles.profileHeader}>
      {/* Show Supabase avatar, or a fallback if missing */}
      <Image
        source={
          profile?.avatar_url ||
          `https://ui-avatars.com/api/?name=${profile?.username || clerkUser.firstName || "User"}`
        }
        style={styles.profileImage}
      />

      <View style={styles.profileInfo}>
        <Text style={styles.username}>
          {profile?.username || clerkUser.firstName || "Loading..."}
        </Text>
        <Text style={styles.email}>
          {clerkUser.primaryEmailAddress?.emailAddress}
        </Text>
        {/* Show when profile was created in Supabase */}
        {profile?.created_at && (
          <Text style={styles.memberSince}>
            🗓️ Joined {formatMemberSince(profile.created_at)}
          </Text>
        )}
      </View>
    </View>
  );
}
