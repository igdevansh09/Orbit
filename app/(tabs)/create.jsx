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
} from "react-native";
import { Image } from "expo-image";
import { useRouter, useLocalSearchParams, useFocusEffect } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { decode } from "base64-arraybuffer";
import * as ImagePicker from "expo-image-picker";
import * as FileSystem from "expo-file-system";
import { LinearGradient } from "expo-linear-gradient";
import Animated, { FadeInDown, FadeInUp } from "react-native-reanimated";

import { getCreateStyles } from "../../assets/styles/create.styles";
import { Colors } from "../../constants/colors";
import { supabase } from "../../lib/supabase";
import { useAuthStore } from "../../store/authStore";

const BRANCH_LIST = [
  "CSAI",
  "CSE",
  "CSDS",
  "IT",
  "ITNS",
  "MAC",
  "ECE",
  "EVDT",
  "EIOT",
  "EE",
  "ICE",
  "ME",
  "BT",
  "CSDA",
  "CIOT",
  "ECAM",
  "MEEV",
  "CE",
  "GI",
];

export default function Create() {
  const router = useRouter();
  const { user } = useAuthStore();
  const params = useLocalSearchParams();

  const colorScheme = useColorScheme();
  const theme = Colors[colorScheme === "dark" ? "dark" : "light"];
  const styles = useMemo(() => getCreateStyles(theme), [theme]);

  // Dynamic background gradient based on theme
  const backgroundGradient = [theme.background, theme.cardBackground];

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

  const [isAnonymous, setIsAnonymous] = useState(false);
  const [driveType, setDriveType] = useState("On-Campus");
  const [cgpaCutoff, setCgpaCutoff] = useState("");
  const [allowedBranches, setAllowedBranches] = useState([]);
  const [rounds, setRounds] = useState("1");

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
    setIsAnonymous(false);
    setDriveType("On-Campus");
    setCgpaCutoff("");
    setAllowedBranches([]); // Reset array
    setRounds("1");
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
        setDriveType(params.initialDriveType || "On-Campus");
        setIsAnonymous(params.initialIsAnonymous === "true");
        setCgpaCutoff(params.initialCgpaCutoff || "");

        if (params.initialAllowedBranches) {
          setAllowedBranches(
            params.initialAllowedBranches.split(",").map((b) => b.trim()),
          );
        } else {
          setAllowedBranches([]);
        }

        setRounds(params.initialRounds || "1");
      } else if (params.isEdit !== "true") {
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

  const toggleBranch = (branch) => {
    if (allowedBranches.includes(branch)) {
      setAllowedBranches(allowedBranches.filter((b) => b !== branch));
    } else {
      setAllowedBranches([...allowedBranches, branch]);
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
        is_anonymous: isAnonymous,
        drive_type: driveType,
        cgpa_cutoff: cgpaCutoff ? parseFloat(cgpaCutoff) : null,
        allowed_branches: allowedBranches.join(", "),
        rounds: parseInt(rounds, 10) || 1,
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
            size={32}
            color={i <= rating ? "#F5A623" : theme.textSecondary} // Keep stars gold/yellow for familiarity
          />
        </TouchableOpacity>,
      );
    }
    return <View style={styles.ratingContainer}>{stars}</View>;
  };

  return (
    <LinearGradient colors={backgroundGradient} style={{ flex: 1 }}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        keyboardVerticalOffset={Platform.OS === "ios" ? 0 : 20}
      >
        <ScrollView
          contentContainerStyle={styles.container}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <Animated.View
            entering={FadeInDown.delay(50).springify()}
            style={styles.header}
          >
            <Text style={styles.title}>
              {isEditMode ? "Edit Experience" : "Share Experience"}
            </Text>
            <Text style={styles.subtitle}>
              {isEditMode
                ? "Update your details below."
                : "Help juniors by sharing your interview details."}
            </Text>
          </Animated.View>

          <View style={styles.form}>
            {/* Anonymous Toggle */}
            <Animated.View
              entering={FadeInDown.delay(100).springify()}
              style={[styles.formGroup, styles.rowGroup]}
            >
              <View style={{ flex: 1, paddingRight: 10 }}>
                <Text style={styles.label}>Post Anonymously</Text>
                <Text style={styles.helperText}>
                  Hide your identity from other students
                </Text>
              </View>
              <TouchableOpacity
                onPress={() => setIsAnonymous(!isAnonymous)}
                activeOpacity={0.8}
              >
                {isAnonymous ? (
                  <LinearGradient
                    colors={[theme.primary, theme.textPrimary]}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                    style={[styles.chip, styles.chipActive]}
                  >
                    <Text style={[styles.chipText, styles.chipTextActive]}>
                      Anonymous
                    </Text>
                  </LinearGradient>
                ) : (
                  <View style={[styles.chip, styles.chipInactive]}>
                    <Text style={styles.chipText}>Public</Text>
                  </View>
                )}
              </TouchableOpacity>
            </Animated.View>

            <Animated.View
              entering={FadeInDown.delay(150).springify()}
              style={styles.formGroup}
            >
              <Text style={styles.label}>
                Company Name <Text style={{ color: "#FF5252" }}>*</Text>
              </Text>
              <View style={styles.inputContainer}>
                <Ionicons
                  name="business"
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
            </Animated.View>

            <Animated.View
              entering={FadeInDown.delay(200).springify()}
              style={styles.formGroup}
            >
              <Text style={styles.label}>
                Role / Position <Text style={{ color: "#FF5252" }}>*</Text>
              </Text>
              <View style={styles.inputContainer}>
                <Ionicons
                  name="code-slash"
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
            </Animated.View>

            <Animated.View
              entering={FadeInDown.delay(250).springify()}
              style={styles.formGroup}
            >
              <Text style={styles.label}>
                Type <Text style={{ color: "#FF5252" }}>*</Text>
              </Text>
              <View style={styles.chipContainer}>
                {CATEGORIES.map((cat) => (
                  <TouchableOpacity
                    key={cat}
                    onPress={() => setCategory(cat)}
                    activeOpacity={0.8}
                  >
                    {category === cat ? (
                      <LinearGradient
                        colors={[theme.primary, theme.textPrimary]}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 1 }}
                        style={[styles.chip, styles.chipActive]}
                      >
                        <Text style={[styles.chipText, styles.chipTextActive]}>
                          {cat}
                        </Text>
                      </LinearGradient>
                    ) : (
                      <View style={[styles.chip, styles.chipInactive]}>
                        <Text style={styles.chipText}>{cat}</Text>
                      </View>
                    )}
                  </TouchableOpacity>
                ))}
              </View>
            </Animated.View>

            {/* Drive Type */}
            <Animated.View
              entering={FadeInDown.delay(300).springify()}
              style={styles.formGroup}
            >
              <Text style={styles.label}>
                Drive Type <Text style={{ color: "#FF5252" }}>*</Text>
              </Text>
              <View style={styles.chipContainer}>
                {["On-Campus", "Off-Campus"].map((type) => (
                  <TouchableOpacity
                    key={type}
                    onPress={() => setDriveType(type)}
                    activeOpacity={0.8}
                  >
                    {driveType === type ? (
                      <LinearGradient
                        colors={[theme.primary, theme.textPrimary]}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 1 }}
                        style={[styles.chip, styles.chipActive]}
                      >
                        <Text style={[styles.chipText, styles.chipTextActive]}>
                          {type}
                        </Text>
                      </LinearGradient>
                    ) : (
                      <View style={[styles.chip, styles.chipInactive]}>
                        <Text style={styles.chipText}>{type}</Text>
                      </View>
                    )}
                  </TouchableOpacity>
                ))}
              </View>
            </Animated.View>

            {/* Eligibility & Pipeline Grid */}
            <Animated.View
              entering={FadeInDown.delay(350).springify()}
              style={{ flexDirection: "row", gap: 12, marginBottom: 24 }}
            >
              <View style={{ flex: 1 }}>
                <Text style={styles.label}>CGPA Cutoff</Text>
                <View style={styles.inputContainer}>
                  <TextInput
                    style={styles.input}
                    placeholder="e.g. 7.5"
                    placeholderTextColor={theme.placeholderText}
                    value={cgpaCutoff}
                    onChangeText={setCgpaCutoff}
                    keyboardType="numeric"
                  />
                </View>
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.label}>Total Rounds</Text>
                <View style={styles.inputContainer}>
                  <TextInput
                    style={styles.input}
                    placeholder="e.g. 4"
                    placeholderTextColor={theme.placeholderText}
                    value={rounds}
                    onChangeText={setRounds}
                    keyboardType="numeric"
                  />
                </View>
              </View>
            </Animated.View>

            {/* Allowed Branches (Converted to Chips) */}
            <Animated.View
              entering={FadeInDown.delay(400).springify()}
              style={styles.formGroup}
            >
              <Text style={styles.label}>Allowed Branches (Tap to select)</Text>
              <View style={styles.chipContainer}>
                {BRANCH_LIST.map((branch) => {
                  const isSelected = allowedBranches.includes(branch);
                  return (
                    <TouchableOpacity
                      key={branch}
                      onPress={() => toggleBranch(branch)}
                      activeOpacity={0.8}
                    >
                      {isSelected ? (
                        <LinearGradient
                          colors={[theme.primary, theme.textPrimary]}
                          start={{ x: 0, y: 0 }}
                          end={{ x: 1, y: 1 }}
                          style={[
                            styles.chip,
                            styles.chipActive,
                            { paddingVertical: 10, paddingHorizontal: 14 },
                          ]}
                        >
                          <Text
                            style={[
                              styles.chipText,
                              styles.chipTextActive,
                              { fontSize: 13 },
                            ]}
                          >
                            {branch}
                          </Text>
                        </LinearGradient>
                      ) : (
                        <View
                          style={[
                            styles.chip,
                            styles.chipInactive,
                            { paddingVertical: 10, paddingHorizontal: 14 },
                          ]}
                        >
                          <Text style={[styles.chipText, { fontSize: 13 }]}>
                            {branch}
                          </Text>
                        </View>
                      )}
                    </TouchableOpacity>
                  );
                })}
              </View>
            </Animated.View>

            <Animated.View
              entering={FadeInDown.delay(450).springify()}
              style={styles.formGroup}
            >
              <Text style={styles.label}>
                Difficulty Rating <Text style={{ color: "#FF5252" }}>*</Text>
              </Text>
              {renderRatingPicker()}
            </Animated.View>

            <Animated.View
              entering={FadeInDown.delay(500).springify()}
              style={styles.formGroup}
            >
              <Text style={styles.label}>
                Screenshot / Proof{" "}
                {!isEditMode && <Text style={{ color: "#FF5252" }}>*</Text>}
                {isEditMode && (
                  <Text style={styles.optionalText}> (Optional)</Text>
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
                      name="image-outline"
                      size={48}
                      color={theme.textSecondary}
                    />
                    <Text style={styles.placeholderText}>
                      Tap to upload proof
                    </Text>
                  </View>
                )}
              </TouchableOpacity>
            </Animated.View>

            <Animated.View
              entering={FadeInDown.delay(550).springify()}
              style={styles.formGroup}
            >
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
            </Animated.View>

            <Animated.View entering={FadeInUp.delay(650).springify()}>
              <TouchableOpacity
                onPress={handleSubmit}
                disabled={loading}
                activeOpacity={0.8}
              >
                <LinearGradient
                  colors={[theme.primary, theme.textPrimary]}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={styles.button}
                >
                  {loading ? (
                    <ActivityIndicator color={theme.white} size="small" />
                  ) : (
                    <>
                      <Ionicons
                        name={
                          isEditMode ? "save-outline" : "paper-plane-outline"
                        }
                        size={22}
                        color={theme.white}
                        style={styles.buttonIcon}
                      />
                      <Text style={styles.buttonText}>
                        {isEditMode ? "Update Experience" : "Post Experience"}
                      </Text>
                    </>
                  )}
                </LinearGradient>
              </TouchableOpacity>
            </Animated.View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </LinearGradient>
  );
}
