import { useState } from "react";
import {
  View,
  Text,
  Platform,
  KeyboardAvoidingView,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Alert,
  Image,
  ActivityIndicator,
  StyleSheet,
} from "react-native";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useUser, useAuth } from "@clerk/clerk-expo";
import { decode } from "base64-arraybuffer";
import * as ImagePicker from "expo-image-picker";
import * as FileSystem from "expo-file-system";

// Make sure you have these helper files
import styles from "../../assets/styles/create.styles";
import COLORS from "../../constants/colors";
import { supabase, createAuthenticatedClient } from "../../lib/supabase";

export default function Create() {
  const { user } = useUser();
  const { getToken } = useAuth();
  const router = useRouter();

  const [title, setTitle] = useState("");
  const [college, setCollege] = useState("");
  const [branch, setBranch] = useState("");
  const [caption, setCaption] = useState("");
  const [rating, setRating] = useState(3);
  const [image, setImage] = useState(null);
  const [imageBase64, setImageBase64] = useState(null);
  const [loading, setLoading] = useState(false);

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
      console.error("Error picking image:", error);
      Alert.alert("Error", "Problem selecting image.");
    }
  };

  const handleSubmit = async () => {
    // --- STRICT VALIDATION ---
    if (!title.trim())
      return Alert.alert("Missing Detail", "Please enter the Company Name.");
    if (!college.trim())
      return Alert.alert("Missing Detail", "Please enter your College Name.");
    if (!branch.trim())
      return Alert.alert("Missing Detail", "Please enter your Branch.");
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

      const token = await getToken({ template: "supabase" });
      const authSupabase = createAuthenticatedClient(token);

      // 1. Upload Image
      const fileName = `${user.id}/${Date.now()}.jpg`;
      const { error: uploadError } = await supabase.storage
        .from("book-images")
        .upload(fileName, decode(imageBase64), { contentType: "image/jpeg" });

      if (uploadError) throw uploadError;

      // 2. Get URL
      const {
        data: { publicUrl },
      } = supabase.storage.from("book-images").getPublicUrl(fileName);

      // 3. Insert Data
      const { error: insertError } = await authSupabase.from("books").insert([
        {
          title: title.trim(),
          college: college.trim(),
          branch: branch.trim(),
          caption: caption.trim(),
          rating,
          image_url: publicUrl,
          user_id: user.id,
          // 👇 NEW FIELDS ADDED HERE
          author_name: user.fullName,
          author_email: user.primaryEmailAddress?.emailAddress,
          author_image: user.imageUrl,
        },
      ]);

      if (insertError) throw insertError;

      Alert.alert("Success", "Experience shared!");

      // Reset
      setTitle("");
      setCollege("");
      setBranch("");
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
            color={i <= rating ? "#f4b400" : COLORS.textSecondary}
          />
        </TouchableOpacity>,
      );
    }
    return <View style={styles.ratingContainer}>{stars}</View>;
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
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
                  color={COLORS.textSecondary}
                  style={styles.inputIcon}
                />
                <TextInput
                  style={styles.input}
                  placeholder="e.g. Amazon, Google, TCS"
                  placeholderTextColor={COLORS.placeholderText}
                  value={title}
                  onChangeText={setTitle}
                />
              </View>
            </View>

            {/* COLLEGE & BRANCH ROW */}
            <View style={{ flexDirection: "row", gap: 10 }}>
              <View style={[styles.formGroup, { flex: 1 }]}>
                <Text style={styles.label}>
                  College <Text style={{ color: "red" }}>*</Text>
                </Text>
                <View style={styles.inputContainer}>
                  <Ionicons
                    name="school-outline"
                    size={20}
                    color={COLORS.textSecondary}
                    style={styles.inputIcon}
                  />
                  <TextInput
                    style={styles.input}
                    placeholder="NSUT"
                    placeholderTextColor={COLORS.placeholderText}
                    value={college}
                    onChangeText={setCollege}
                  />
                </View>
              </View>

              <View style={[styles.formGroup, { flex: 1 }]}>
                <Text style={styles.label}>
                  Branch <Text style={{ color: "red" }}>*</Text>
                </Text>
                <View style={styles.inputContainer}>
                  <Ionicons
                    name="hardware-chip-outline"
                    size={20}
                    color={COLORS.textSecondary}
                    style={styles.inputIcon}
                  />
                  <TextInput
                    style={styles.input}
                    placeholder="CSE/IT"
                    placeholderTextColor={COLORS.placeholderText}
                    value={branch}
                    onChangeText={setBranch}
                  />
                </View>
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
                      color={COLORS.textSecondary}
                    />
                    <Text style={styles.placeholderText}>Tap to upload</Text>
                  </View>
                )}
              </TouchableOpacity>
            </View>

            {/* REVIEW */}
            <View style={styles.formGroup}>
              <Text style={styles.label}>
                Your Experience <Text style={{ color: "red" }}>*</Text>
              </Text>
              <TextInput
                style={styles.textArea}
                placeholder="What questions were asked? Any tips?"
                placeholderTextColor={COLORS.placeholderText}
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
                <ActivityIndicator color={COLORS.white} />
              ) : (
                <>
                  <Ionicons
                    name="cloud-upload-outline"
                    size={20}
                    color={COLORS.white}
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
