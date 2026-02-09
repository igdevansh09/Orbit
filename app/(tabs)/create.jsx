import { useState, useMemo, useCallback } from "react";
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
  StyleSheet,
} from "react-native";
import { Image } from "expo-image";
import { useRouter, useLocalSearchParams, useFocusEffect } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { decode } from "base64-arraybuffer";
import * as ImagePicker from "expo-image-picker";
import * as FileSystem from "expo-file-system";

// Internal Imports
import { getCreateStyles } from "../../assets/styles/create.styles";
import { Colors } from "../../constants/colors";
import { supabase } from "../../lib/supabase";
import { useAuthStore } from "../../store/authStore";

export default function Create() {
  const router = useRouter();
  const { user } = useAuthStore();
  const params = useLocalSearchParams();

  // Theme
  const colorScheme = useColorScheme();
  const theme = Colors[colorScheme === "dark" ? "dark" : "light"];
  const styles = useMemo(() => getCreateStyles(theme), [theme]);

  // --- STATE ---
  const [isEditMode, setIsEditMode] = useState(false);
  const [postId, setPostId] = useState(null);

  const [company, setCompany] = useState("");
  const [role, setRole] = useState("");
  const [category, setCategory] = useState("Interview");
  const [review, setReview] = useState("");
  const [rating, setRating] = useState(3);
  const [image, setImage] = useState(null);
  const [imageBase64, setImageBase64] = useState(null);
  const [loading, setLoading] = useState(false);

  const CATEGORIES = ["Interview", "OA", "Internship"];

  // --- RESET FORM HELPER ---
  const resetForm = () => {
    setIsEditMode(false);
    setPostId(null);
    setCompany("");
    setRole("");
    setCategory("Interview");
    setReview("");
    setRating(3);
    setImage(null);
    setImageBase64(null);
  };

  // --- FOCUS EFFECT (The Fix) ---
  useFocusEffect(
    useCallback(() => {
      // FIX: We only check primitives (strings), not the whole 'params' object
      // This prevents the form from resetting while you type
      if (params.isEdit === "true") {
        setIsEditMode(true);
        setPostId(params.id);
        setCompany(params.initialCompany || "");
        setRole(params.initialRole || "");
        setCategory(params.initialCategory || "Interview");
        setReview(params.initialReview || "");
        setRating(
          params.initialDifficulty ? parseInt(params.initialDifficulty) : 3,
        );
        setImage(params.initialImage || null);
      } else {
        // Only reset if we are NOT in edit mode (Clean slate for new posts)
        resetForm();
      }
    }, [params.isEdit, params.id]), // <--- CRITICAL FIX: Only run if these specific values change
  );

  // --- IMAGE PICKER ---
  const pickImage = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
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
      Alert.alert("Error", "Problem selecting image.");
    }
  };

  // --- SUBMIT HANDLER ---
  const handleSubmit = async () => {
    // 1. Validation
    if (!company.trim())
      return Alert.alert("Missing Detail", "Please enter Company Name.");
    if (!role.trim())
      return Alert.alert("Missing Detail", "Please enter Role.");
    if (!review.trim())
      return Alert.alert("Missing Detail", "Please write your experience.");

    // Image Validation: Required for New, Optional for Edit
    if (!isEditMode && !image)
      return Alert.alert("Missing Evidence", "Please upload a screenshot.");

    try {
      setLoading(true);
      if (!user) throw new Error("No user logged in");

      let finalImageUrl = image;

      // 2. Upload Image (Only if a NEW image was picked)
      if (imageBase64) {
        const fileName = `${user.id}/${Date.now()}_post.jpg`;
        const { error: uploadError } = await supabase.storage
          .from("experience-uploads")
          .upload(fileName, decode(imageBase64), { contentType: "image/jpeg" });

        if (uploadError) throw uploadError;

        const { data } = supabase.storage
          .from("experience-uploads")
          .getPublicUrl(fileName);
        finalImageUrl = data.publicUrl;
      }

      // 3. Prepare Payload
      const payload = {
        company: company.trim(),
        role: role.trim(),
        category: category,
        description: review.trim(),
        difficulty: rating,
        image_url: finalImageUrl,
      };

      // 4. Update or Insert
      if (isEditMode && postId) {
        // UPDATE
        const { error } = await supabase
          .from("experiences")
          .update(payload)
          .eq("id", postId);

        if (error) throw error;
        Alert.alert("Success", "Experience Updated!");
      } else {
        // CREATE
        const { error } = await supabase.from("experiences").insert([
          {
            ...payload,
            college: user?.user_metadata?.college || "NSUT",
            branch: user?.user_metadata?.branch || "Student",
            user_id: user.id,
            username: user?.user_metadata?.username || "Anonymous",
            user_avatar: user?.user_metadata?.avatar_url,
          },
        ]);

        if (error) throw error;
        Alert.alert("Success", "Experience Shared!");
      }

      // 5. CLEANUP (Crucial Step)
      resetForm(); // Wipe state manually
      router.setParams({}); // Clear URL params so they don't persist
      router.replace("/(tabs)/"); // Go Home
    } catch (error) {
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
            <Text style={styles.title}>
              {isEditMode ? "Edit Experience" : "Share Experience"}
            </Text>
            <Text style={styles.subtitle}>
              {isEditMode
                ? "Update your details below"
                : "Help juniors by sharing your interview details"}
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
                  value={company}
                  onChangeText={setCompany}
                />
              </View>
            </View>

            {/* ROLE */}
            <View style={styles.formGroup}>
              <Text style={styles.label}>
                Role / Position <Text style={{ color: "red" }}>*</Text>
              </Text>
              <View style={styles.inputContainer}>
                <Ionicons
                  name="person-outline"
                  size={20}
                  color={theme.textSecondary}
                  style={styles.inputIcon}
                />
                <TextInput
                  style={styles.input}
                  placeholder="e.g. SDE Intern, Analyst"
                  placeholderTextColor={theme.placeholderText}
                  value={role}
                  onChangeText={setRole}
                />
              </View>
            </View>

            {/* CATEGORY */}
            <View style={styles.formGroup}>
              <Text style={styles.label}>
                Type <Text style={{ color: "red" }}>*</Text>
              </Text>
              <View style={{ flexDirection: "row", gap: 10, flexWrap: "wrap" }}>
                {CATEGORIES.map((cat) => (
                  <TouchableOpacity
                    key={cat}
                    onPress={() => setCategory(cat)}
                    style={{
                      paddingVertical: 8,
                      paddingHorizontal: 16,
                      borderRadius: 20,
                      borderWidth: 1,
                      borderColor:
                        category === cat ? theme.primary : theme.border,
                      backgroundColor:
                        category === cat ? theme.primary : "transparent",
                    }}
                  >
                    <Text
                      style={{
                        color: category === cat ? "#FFF" : theme.textPrimary,
                        fontWeight: category === cat ? "bold" : "normal",
                      }}
                    >
                      {cat}
                    </Text>
                  </TouchableOpacity>
                ))}
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
                placeholder="Share your interview questions, rounds, and tips..."
                placeholderTextColor={theme.textSecondary}
                value={review}
                onChangeText={setReview}
                multiline={true}
                textAlignVertical="top"
                style={[
                  styles.input,
                  {
                    height: "auto",
                    minHeight: 120,
                    paddingTop: 12,
                    paddingBottom: 12,
                  },
                ]}
              />
            </View>

            {/* SUBMIT BUTTON */}
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
                    name={isEditMode ? "save-outline" : "cloud-upload-outline"}
                    size={20}
                    color="#fff"
                    style={styles.buttonIcon}
                  />
                  <Text style={styles.buttonText}>
                    {isEditMode ? "Update Experience" : "Post Experience"}
                  </Text>
                </>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
