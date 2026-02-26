import { useState, useMemo, useCallback, useRef } from "react";
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
import { getCreateStyles } from "../../assets/styles/create.styles";
import { Colors } from "../../constants/colors";
import { supabase } from "../../lib/supabase";
import { useAuthStore } from "../../store/authStore";

export default function Create() {
  const router = useRouter();
  const { user } = useAuthStore();
  const params = useLocalSearchParams();

  const colorScheme = useColorScheme();
  const theme = Colors[colorScheme === "dark" ? "dark" : "light"];
  const styles = useMemo(() => getCreateStyles(theme), [theme]);

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

  const hasLoadedEditData = useRef(false);

  const CATEGORIES = ["Interview", "OA", "Internship"];

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
    hasLoadedEditData.current = false;
  };

  useFocusEffect(
    useCallback(() => {
      if (params.isEdit === "true" && params.id && !hasLoadedEditData.current) {
        hasLoadedEditData.current = true; 
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
      }
      else if (params.isEdit !== "true") {
        resetForm();
      }

      return () => {
        hasLoadedEditData.current = false;
      };
    }, [params.isEdit]), 
  );

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

  const handleSubmit = async () => {
    if (!company.trim())
      return Alert.alert("Missing Detail", "Please enter Company Name.");
    if (!role.trim())
      return Alert.alert("Missing Detail", "Please enter Role.");
    if (!review.trim())
      return Alert.alert("Missing Detail", "Please write your experience.");

    if (!isEditMode && !image)
      return Alert.alert("Missing Evidence", "Please upload a screenshot.");

    try {
      setLoading(true);
      if (!user) throw new Error("No user logged in");

      let finalImageUrl = image;

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

      const payload = {
        company: company.trim(),
        role: role.trim(),
        category: category,
        description: review.trim(),
        difficulty: rating,
        image_url: finalImageUrl,
      };

      if (isEditMode && postId) {
        const { error } = await supabase
          .from("experiences")
          .update(payload)
          .eq("id", postId);

        if (error) throw error;

        Alert.alert("Success", "Experience Updated!", [
          {
            text: "OK",
            onPress: () => {
              resetForm();

              router.setParams({
                isEdit: undefined,
                id: undefined,
                initialCompany: undefined,
                initialRole: undefined,
                initialCategory: undefined,
                initialReview: undefined,
                initialDifficulty: undefined,
                initialImage: undefined,
              });

              router.push("/(tabs)/profile");
            },
          },
        ]);
      } else {
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

        Alert.alert("Success", "Experience Shared!", [
          {
            text: "OK",
            onPress: () => {
              resetForm();

              router.push("/(tabs)/");
            },
          },
        ]);
      }
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
          activeOpacity={0.7}
        >
          <Ionicons
            name={i <= rating ? "star" : "star-outline"}
            size={36}
            color={i <= rating ? theme.primary : theme.textSecondary}
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
      keyboardVerticalOffset={Platform.OS === "ios" ? 0 : 20}
    >
      <ScrollView
        contentContainerStyle={styles.container}
        style={styles.scrollViewStyle}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          <Text style={styles.title}>
            {isEditMode ? "Edit Experience" : "Share Experience"}
          </Text>
          <Text style={styles.subtitle}>
            {isEditMode
              ? "Update your details below."
              : "Help juniors by sharing your interview details."}
          </Text>
        </View>

        <View style={styles.form}>
          <View style={styles.formGroup}>
            <Text style={styles.label}>
              Company Name <Text style={{ color: "#FF5252" }}>*</Text>
            </Text>
            <View style={styles.inputContainer}>
              <Ionicons
                name="business"
                size={22}
                color={theme.primary}
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

          <View style={styles.formGroup}>
            <Text style={styles.label}>
              Role / Position <Text style={{ color: "#FF5252" }}>*</Text>
            </Text>
            <View style={styles.inputContainer}>
              <Ionicons
                name="code-slash"
                size={22}
                color={theme.primary}
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

          <View style={styles.formGroup}>
            <Text style={styles.label}>
              Type <Text style={{ color: "#FF5252" }}>*</Text>
            </Text>
            <View style={styles.chipContainer}>
              {CATEGORIES.map((cat) => (
                <TouchableOpacity
                  key={cat}
                  onPress={() => setCategory(cat)}
                  style={[styles.chip, category === cat && styles.chipActive]}
                  activeOpacity={0.8}
                >
                  <Text
                    style={[
                      styles.chipText,
                      category === cat && styles.chipTextActive,
                    ]}
                  >
                    {cat}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          <View style={styles.formGroup}>
            <Text style={styles.label}>
              Difficulty Rating <Text style={{ color: "#FF5252" }}>*</Text>
            </Text>
            {renderRatingPicker()}
          </View>

          <View style={styles.formGroup}>
            <Text style={styles.label}>
              Screenshot / Proof{" "}
              {!isEditMode && <Text style={{ color: "#FF5252" }}>*</Text>}
              {isEditMode && (
                <Text
                  style={{
                    color: theme.textSecondary,
                    fontSize: 11,
                    textTransform: "none",
                  }}
                >
                  {" "}
                  (Optional)
                </Text>
              )}
            </Text>
            <TouchableOpacity
              style={styles.imagePicker}
              onPress={pickImage}
              activeOpacity={0.8}
            >
              {image ? (
                <Image
                  source={{ uri: image }}
                  style={styles.previewImage}
                  contentFit="cover"
                />
              ) : (
                <View style={styles.placeholderContainer}>
                  <Ionicons
                    name="image"
                    size={48}
                    color={theme.placeholderText}
                  />
                  <Text style={styles.placeholderText}>Tap to upload</Text>
                </View>
              )}
            </TouchableOpacity>
          </View>

          <View style={styles.formGroup}>
            <Text style={styles.label}>
              Your Experience <Text style={{ color: "#FF5252" }}>*</Text>
            </Text>
            <TextInput
              placeholder="Share your interview questions, rounds, and tips..."
              placeholderTextColor={theme.placeholderText}
              value={review}
              onChangeText={setReview}
              multiline={true}
              style={styles.textArea}
            />
          </View>
          <TouchableOpacity
            style={styles.button}
            onPress={handleSubmit}
            disabled={loading}
            activeOpacity={0.8}
          >
            {loading ? (
              <ActivityIndicator color={theme.white} size="small" />
            ) : (
              <>
                <Ionicons
                  name={isEditMode ? "save" : "paper-plane"}
                  size={22}
                  color={theme.white}
                  style={styles.buttonIcon}
                />
                <Text style={styles.buttonText}>
                  {isEditMode ? "Update Experience" : "Post Experience"}
                </Text>
              </>
            )}
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
