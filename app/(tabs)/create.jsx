import { useState, useMemo } from "react";
import {
  View,
  Text,
  Platform,
  KeyboardAvoidingView,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  useColorScheme,
} from "react-native";
import { Image } from "expo-image";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { decode } from "base64-arraybuffer";
import * as ImagePicker from "expo-image-picker";
import * as FileSystem from "expo-file-system";

import { getCreateStyles } from "../../assets/styles/create.styles";
import { Colors } from "../../constants/colors";
import { supabase } from "../../lib/supabase";
import { useAuthStore } from "../../store/authStore";

export default function Create() {
  const router = useRouter();
  const { user } = useAuthStore();

  const colorScheme = useColorScheme();
  const theme = Colors[colorScheme ?? "light"];
  const styles = useMemo(() => getCreateStyles(theme), [theme]);

  const [title, setTitle] = useState("");
  // REMOVED: college and branch states (we get them from user.user_metadata)
  const [caption, setCaption] = useState("");
  const [rating, setRating] = useState(3);
  const [image, setImage] = useState(null);
  const [imageBase64, setImageBase64] = useState(null);
  const [loading, setLoading] = useState(false);

  // --- GET USER METADATA ---
  const userBranch = user?.user_metadata?.branch || "Student";
  const userCollege = user?.user_metadata?.college || "NSUT";
  const userName = user?.user_metadata?.username || "Anonymous";
  const userAvatar = user?.user_metadata?.avatar_url || null;

  const pickImage = async () => {
    try {
      if (Platform.OS !== "web") {
        const { status } =
          await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (status !== "granted") {
          Alert.alert("Permission Denied", "We need camera roll permissions.");
          return;
        }
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: "images",
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.5,
        base64: true,
      });

      if (!result.canceled) {
        setImage(result.assets[0].uri);
        if (result.assets[0].base64) {
          setImageBase64(result.assets[0].base64);
        } else {
          const base64 = await FileSystem.readAsStringAsync(
            result.assets[0].uri,
            {
              encoding: FileSystem.EncodingType.Base64,
            },
          );
          setImageBase64(base64);
        }
      }
    } catch (error) {
      console.error("Error picking image:", error);
      Alert.alert("Error", "Problem selecting image.");
    }
  };

  const handleSubmit = async () => {
    if (!title.trim())
      return Alert.alert("Missing Detail", "Please enter the Company Name.");
    if (!caption.trim())
      return Alert.alert(
        "Missing Detail",
        "Please write your experience review.",
      );
    if (!imageBase64)
      return Alert.alert(
        "Missing Evidence",
        "Please upload a screenshot or proof.",
      );

    try {
      setLoading(true);
      if (!user) throw new Error("No user logged in");

      // 1. Upload Image
      const fileName = `${user.id}/${Date.now()}_post.jpg`;
      const { error: uploadError } = await supabase.storage
        .from("experience-uploads")
        .upload(fileName, decode(imageBase64), { contentType: "image/jpeg" });

      if (uploadError) throw uploadError;

      const {
        data: { publicUrl },
      } = supabase.storage.from("experience-uploads").getPublicUrl(fileName);

      // 2. Insert Data (Auto-filling College & Branch)
      const { error: insertError } = await supabase.from("experiences").insert([
        {
          company: title.trim(),
          college: userCollege, // Auto-filled
          branch: userBranch, // Auto-filled
          description: caption.trim(),
          difficulty: rating,
          image_url: publicUrl,
          user_id: user.id,
          username: userName,
          user_avatar: userAvatar,
        },
      ]);

      if (insertError) throw insertError;

      Alert.alert("Success", "Experience shared!");
      setTitle("");
      setCaption("");
      setRating(3);
      setImage(null);
      setImageBase64(null);
      router.push("/");
    } catch (error) {
      console.error("Error creating post:", error);
      Alert.alert("Error", error.message);
    } finally {
      setLoading(false);
    }
  };

  const renderRatingPicker = () => {
    const stars = [];
    for (let i = 1; i <= 5; i++) {
      stars.push(
        <TouchableOpacity
          key={i}
          onPress={() => setRating(i)}
          style={styles.starButton}
        >
          <Ionicons
            name={i <= rating ? "star" : "star-outline"}
            size={32}
            color={i <= rating ? "#f4b400" : theme.textSecondary}
          />
        </TouchableOpacity>,
      );
    }
    return <View style={styles.ratingContainer}>{stars}</View>;
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1, backgroundColor: theme.background }}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <ScrollView
        contentContainerStyle={styles.container}
        style={styles.scrollViewStyle}
      >
        <View style={styles.card}>
          <View style={styles.header}>
            <Text style={styles.title}>Share Experience</Text>
            <Text style={styles.subtitle}>
              Help juniors by sharing your interview details
            </Text>
          </View>

          <View style={styles.form}>
            {/* COMPANY */}
            <View style={styles.formGroup}>
              <Text style={styles.label}>
                Company Name <Text style={{ color: "red" }}>*</Text>
              </Text>
              <View style={styles.inputContainer}>
                <Ionicons
                  name="briefcase-outline"
                  size={20}
                  color={theme.textSecondary}
                  style={styles.inputIcon}
                />
                <TextInput
                  style={styles.input}
                  placeholder="e.g. Amazon, Google"
                  placeholderTextColor={theme.placeholderText}
                  value={title}
                  onChangeText={setTitle}
                />
              </View>
            </View>

            {/* RATING */}
            <View style={styles.formGroup}>
              <Text style={styles.label}>
                Difficulty Rating <Text style={{ color: "red" }}>*</Text>
              </Text>
              {renderRatingPicker()}
            </View>

            {/* IMAGE */}
            <View style={styles.formGroup}>
              <Text style={styles.label}>
                Screenshot / Proof <Text style={{ color: "red" }}>*</Text>
              </Text>
              <TouchableOpacity style={styles.imagePicker} onPress={pickImage}>
                {image ? (
                  <Image source={{ uri: image }} style={styles.previewImage} />
                ) : (
                  <View style={styles.placeholderContainer}>
                    <Ionicons
                      name="image-outline"
                      size={40}
                      color={theme.textSecondary}
                    />
                    <Text style={styles.placeholderText}>Tap to upload</Text>
                  </View>
                )}
              </TouchableOpacity>
            </View>

            {/* DESCRIPTION */}
            <View style={styles.formGroup}>
              <Text style={styles.label}>
                Your Experience <Text style={{ color: "red" }}>*</Text>
              </Text>
              <TextInput
                style={styles.textArea}
                placeholder="What questions were asked? Any tips?"
                placeholderTextColor={theme.placeholderText}
                value={caption}
                onChangeText={setCaption}
                multiline
              />
            </View>

            <TouchableOpacity
              style={styles.button}
              onPress={handleSubmit}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <>
                  <Ionicons
                    name="cloud-upload-outline"
                    size={20}
                    color="#fff"
                    style={styles.buttonIcon}
                  />
                  <Text style={styles.buttonText}>Post Experience</Text>
                </>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
